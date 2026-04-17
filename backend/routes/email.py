import os, ssl, json, imaplib, smtplib, traceback, threading, time, queue
from email                import policy
from email.parser         import BytesParser
from email.mime.text      import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header         import decode_header
from email.utils          import parsedate_to_datetime, localtime
from datetime             import datetime, timezone
from contextlib           import contextmanager

from flask              import Blueprint, request, jsonify, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.email_account import EmailAccount
from models.email_message import EmailMessage


email_bp = Blueprint("email", __name__)


# ══════════════════════════════════════════════════════════════
# 1.  IMAP CONNECTION POOL
# ══════════════════════════════════════════════════════════════

class IMAPPool:
    def __init__(self, max_size: int = 4):
        self._pools: dict[int, queue.Queue] = {}
        self._lock   = threading.Lock()
        self.max_size = max_size

    def _get_queue(self, account_id: int) -> queue.Queue:
        with self._lock:
            if account_id not in self._pools:
                self._pools[account_id] = queue.Queue(maxsize=self.max_size)
            return self._pools[account_id]

    def _open(self, account: "EmailAccount") -> imaplib.IMAP4:
        if account.use_ssl:
            conn = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
        else:
            conn = imaplib.IMAP4(account.imap_host, account.imap_port)
        conn.login(account.email, account.password)
        return conn

    def _is_alive(self, conn: imaplib.IMAP4) -> bool:
        try:
            conn.noop()
            return True
        except Exception:
            return False

    @contextmanager
    def get(self, account: "EmailAccount"):
        q = self._get_queue(account.id)
        conn = None
        try:
            conn = q.get_nowait()
            if not self._is_alive(conn):
                try: conn.logout()
                except Exception: pass
                conn = self._open(account)
        except queue.Empty:
            conn = self._open(account)

        try:
            yield conn
        finally:
            try:
                q.put_nowait(conn)
            except queue.Full:
                try: conn.logout()
                except Exception: pass

    def invalidate(self, account_id: int):
        q = self._get_queue(account_id)
        while not q.empty():
            try:
                c = q.get_nowait()
                try: c.logout()
                except Exception: pass
            except queue.Empty:
                break


imap_pool = IMAPPool(max_size=4)


# ══════════════════════════════════════════════════════════════
# 2.  SSE EVENT BUS
# ══════════════════════════════════════════════════════════════

class EventBus:
    def __init__(self):
        self._subscribers: dict[int, list[queue.Queue]] = {}
        self._lock = threading.Lock()

    def subscribe(self, user_id: int) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=100)
        with self._lock:
            self._subscribers.setdefault(user_id, []).append(q)
        return q

    def unsubscribe(self, user_id: int, q: queue.Queue):
        with self._lock:
            subs = self._subscribers.get(user_id, [])
            if q in subs:
                subs.remove(q)

    def publish(self, user_id: int, event: dict):
        payload = f"data: {json.dumps(event)}\n\n"
        with self._lock:
            for q in list(self._subscribers.get(user_id, [])):
                try:
                    q.put_nowait(payload)
                except queue.Full:
                    pass


event_bus = EventBus()


# ══════════════════════════════════════════════════════════════
# 3.  IMAP IDLE WATCHER
# ══════════════════════════════════════════════════════════════

_idle_threads: dict[int, threading.Thread] = {}
_idle_stop:    dict[int, threading.Event]  = {}


def _idle_worker(account_id: int, stop_event: threading.Event):
    from models.email_account import EmailAccount

    app = None
    try:
        from app import create_app
        app = create_app()
    except Exception:
        pass

    def run():
        while not stop_event.is_set():
            try:
                ctx = app.app_context() if app else None
                if ctx: ctx.push()

                with db.session() if app else _nullctx() as session:
                    account = EmailAccount.query.get(account_id)
                    if not account or not account.is_active:
                        break

                    if account.use_ssl:
                        mail = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
                    else:
                        mail = imaplib.IMAP4(account.imap_host, account.imap_port)
                    mail.login(account.email, account.password)
                    mail.select("INBOX")

                    mail.send(b"IDLE\r\n" if hasattr(mail, "send") else b"A001 IDLE\r\n")
                    mail.readline()

                    while not stop_event.is_set():
                        mail.sock.settimeout(25)
                        try:
                            line = mail.readline()
                        except (imaplib.IMAP4.abort, OSError, TimeoutError):
                            break

                        if b"EXISTS" in line or b"RECENT" in line:
                            mail.send(b"DONE\r\n")
                            time.sleep(0.3)
                            new_msgs = _fast_sync_inbox(account, account.user_id, limit=10)
                            if new_msgs:
                                event_bus.publish(account.user_id, {
                                    "type": "new_mail",
                                    "count": len(new_msgs),
                                    "messages": new_msgs,
                                })
                            break

                    try:
                        mail.send(b"DONE\r\n")
                        mail.logout()
                    except Exception:
                        pass

                if ctx: ctx.pop()

            except Exception as e:
                print(f"[IDLE] account {account_id} error: {e}")
                time.sleep(5)

    run()


@contextmanager
def _nullctx():
    yield None


def start_idle(account: "EmailAccount"):
    aid = account.id
    if aid in _idle_threads and _idle_threads[aid].is_alive():
        return

    stop = threading.Event()
    _idle_stop[aid]    = stop
    t = threading.Thread(target=_idle_worker, args=(aid, stop), daemon=True)
    _idle_threads[aid] = t
    t.start()


def stop_idle(account_id: int):
    if account_id in _idle_stop:
        _idle_stop[account_id].set()


# ══════════════════════════════════════════════════════════════
# 4.  PRESETS + FOLDER MAP
# ══════════════════════════════════════════════════════════════

IMAP_PRESETS = {
    "gmail.com":      {"imap": "imap.gmail.com",          "smtp": "smtp.gmail.com",          "imap_port": 993, "smtp_port": 587},
    "yahoo.com":      {"imap": "imap.mail.yahoo.com",     "smtp": "smtp.mail.yahoo.com",     "imap_port": 993, "smtp_port": 587},
    "outlook.com":    {"imap": "imap-mail.outlook.com",   "smtp": "smtp-mail.outlook.com",   "imap_port": 993, "smtp_port": 587},
    "hotmail.com":    {"imap": "imap-mail.outlook.com",   "smtp": "smtp-mail.outlook.com",   "imap_port": 993, "smtp_port": 587},
    "icloud.com":     {"imap": "imap.mail.me.com",        "smtp": "smtp.mail.me.com",        "imap_port": 993, "smtp_port": 587},
    "zoho.com":       {"imap": "imap.zoho.com",           "smtp": "smtp.zoho.com",           "imap_port": 993, "smtp_port": 587},
    "protonmail.com": {"imap": "127.0.0.1",               "smtp": "127.0.0.1",               "imap_port": 1143,"smtp_port": 1025},
}

# ── FIXED: "drafts" (not "draft") used consistently throughout
FOLDER_MAP = {
    "inbox":   ["INBOX"],
    "sent":    ["Sent", "Sent Items", "SENT", "[Gmail]/Sent Mail"],
    "drafts":  ["Drafts", "DRAFTS", "[Gmail]/Drafts"],          # ← was inconsistent
    "spam":    ["Spam", "Junk", "SPAM", "[Gmail]/Spam"],
    "starred": ["[Gmail]/Starred", "Flagged"],
    "archive": ["Archive", "All Mail", "[Gmail]/All Mail"],
    "trash":   ["Trash", "Deleted Items", "[Gmail]/Trash"],
}


def get_preset(email_addr: str) -> dict:
    domain = email_addr.split("@")[-1].lower()
    return IMAP_PRESETS.get(domain, {
        "imap": "mail." + domain, "smtp": "mail." + domain,
        "imap_port": 993, "smtp_port": 587,
    })


def decode_mime_header(value: str) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    result = []
    for part, enc in parts:
        if isinstance(part, bytes):
            result.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            result.append(part)
    return " ".join(result)


def _select_folder(mail: imaplib.IMAP4, folder_key: str) -> str:
    if folder_key == "inbox":
        mail.select("INBOX")
        return "INBOX"
    candidates = FOLDER_MAP.get(folder_key, [folder_key])
    _, folders_raw = mail.list()
    available = []
    for f in (folders_raw or []):
        if f:
            parts = f.decode().split('"')
            name  = parts[-1].strip() if len(parts) > 1 else f.decode().split()[-1]
            available.append(name)
    for cand in candidates:
        for avail in available:
            if cand.lower() in avail.lower():
                try:
                    rv, _ = mail.select(f'"{avail}"')
                    if rv == "OK":
                        return avail
                except Exception:
                    pass
    mail.select("INBOX")
    return "INBOX"


# ══════════════════════════════════════════════════════════════
# 5.  DATE / TIME HELPERS
#     All timestamps stored as UTC in DB; sent to frontend as
#     ISO-8601 with timezone offset so browser renders correctly
# ══════════════════════════════════════════════════════════════

def _parse_date_utc(date_str: str) -> datetime:
    """
    Parse an email Date header and return an aware UTC datetime.
    Falls back to utcnow() on any parse failure.
    """
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        dt = parsedate_to_datetime(date_str)   # returns aware datetime
        # Normalise to UTC so comparisons + storage are consistent
        return dt.astimezone(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ══════════════════════════════════════════════════════════════
# 6.  FAST BATCH SYNC
# ══════════════════════════════════════════════════════════════

def _fast_sync_inbox(account: "EmailAccount", user_id: int, limit: int = 50) -> list[dict]:
    with imap_pool.get(account) as mail:
        _select_folder(mail, "inbox")

        _, data = mail.uid("search", None, "ALL")
        all_uids = data[0].split() if data and data[0] else []
        uids = all_uids[-limit:]
        if not uids:
            return []

        uid_list  = b",".join(uids)
        _, msg_data = mail.uid(
            "fetch", uid_list,
            "(UID FLAGS BODY.PEEK[HEADER.FIELDS (SUBJECT FROM TO CC DATE)])"
        )

    parsed_batch = []
    i = 0
    while i < len(msg_data):
        item = msg_data[i]
        if not isinstance(item, tuple):
            i += 1
            continue
        meta_str   = item[0].decode("utf-8", errors="replace")
        raw_header = item[1]

        uid_str = ""
        for tok in meta_str.split():
            if tok.isdigit() and "UID" in meta_str:
                prev = meta_str.split(tok)[0]
                if prev.rstrip().endswith("UID"):
                    uid_str = tok
                    break
        if not uid_str:
            i += 1
            continue

        is_read    = "\\Seen"    in meta_str
        is_starred = "\\Flagged" in meta_str

        msg       = BytesParser(policy=policy.default).parsebytes(raw_header)
        subject   = decode_mime_header(msg.get("Subject", ""))
        from_addr = decode_mime_header(msg.get("From", ""))
        to_addr   = decode_mime_header(msg.get("To", ""))
        cc_addr   = decode_mime_header(msg.get("Cc", ""))
        date_str  = msg.get("Date", "")

        from_name = from_addr.split("<")[0].strip().strip('"') if "<" in from_addr else from_addr

        # ── FIXED: use helper that always returns UTC-aware datetime
        date_received = _parse_date_utc(date_str)

        parsed_batch.append({
            "uid":           uid_str,
            "subject":       subject[:499],
            "from_addr":     from_addr[:299],
            "from_name":     from_name[:199],
            "to_addr":       to_addr,
            "cc_addr":       cc_addr,
            "date_received": date_received,
            "is_read":       is_read,
            "is_starred":    is_starred,
        })
        i += 1

    if not parsed_batch:
        return []

    existing_uids = {
        r[0] for r in db.session.query(EmailMessage.uid)
            .filter(
                EmailMessage.user_id == user_id,
                EmailMessage.folder  == "inbox",
                EmailMessage.uid.in_([p["uid"] for p in parsed_batch]),
            ).all()
    }

    new_records    = []
    update_records = []
    for p in parsed_batch:
        if p["uid"] in existing_uids:
            update_records.append(p)
        else:
            new_records.append(p)

    if update_records:
        for p in update_records:
            db.session.query(EmailMessage).filter_by(
                user_id=user_id, uid=p["uid"], folder="inbox"
            ).update({"is_read": p["is_read"], "is_starred": p["is_starred"]},
                     synchronize_session=False)

    if new_records:
        db.session.bulk_insert_mappings(EmailMessage, [
            dict(
                user_id=user_id,
                account_id=account.id,
                uid=p["uid"],
                folder="inbox",
                subject=p["subject"],
                from_addr=p["from_addr"],
                from_name=p["from_name"],
                to_addr=p["to_addr"],
                cc_addr=p["cc_addr"],
                body_html="",
                body_text="",
                snippet="",
                date_received=p["date_received"],
                is_read=p["is_read"],
                is_starred=p["is_starred"],
                has_attachment=False,
                attachments=json.dumps([]),
            ) for p in new_records
        ])

    db.session.commit()
    return [p for p in new_records]


# ══════════════════════════════════════════════════════════════
# 7.  LAZY BODY FETCH
# ══════════════════════════════════════════════════════════════

def _fetch_body(account: "EmailAccount", uid: str) -> tuple[str, str, str, bool, list]:
    with imap_pool.get(account) as mail:
        mail.select("INBOX")
        _, data = mail.uid("fetch", uid.encode(), "(BODY[])")

    if not data or not data[0] or not isinstance(data[0], tuple):
        return "", "", "", False, []

    raw = data[0][1]
    msg = BytesParser(policy=policy.default).parsebytes(raw)

    body_html = body_text = ""
    attachments = []

    def walk(part):
        nonlocal body_html, body_text
        ct  = part.get_content_type()
        cd  = str(part.get("Content-Disposition", ""))
        if "attachment" in cd:
            fn = part.get_filename()
            if fn:
                attachments.append({"filename": decode_mime_header(fn), "mimeType": ct})
            return
        if ct == "text/html" and not body_html:
            try:
                body_html = part.get_content()
            except Exception:
                p = part.get_payload(decode=True)
                if p:
                    body_html = p.decode(part.get_content_charset() or "utf-8", errors="replace")
        elif ct == "text/plain" and not body_text:
            try:
                body_text = part.get_content()
            except Exception:
                p = part.get_payload(decode=True)
                if p:
                    body_text = p.decode(part.get_content_charset() or "utf-8", errors="replace")
        if part.is_multipart():
            for sub in part.iter_parts():
                walk(sub)

    walk(msg)
    plain   = body_text or body_html
    snippet = plain[:200].replace("\n", " ").replace("\r", "") if plain else ""
    return body_html, body_text, snippet, len(attachments) > 0, attachments


# ══════════════════════════════════════════════════════════════
# 8.  SMTP POOL
# ══════════════════════════════════════════════════════════════

class SMTPPool:
    def __init__(self):
        self._conns: dict[int, smtplib.SMTP] = {}
        self._lock = threading.Lock()

    def _open(self, account: "EmailAccount") -> smtplib.SMTP:
        if account.smtp_port == 465:
            s = smtplib.SMTP_SSL(account.smtp_host, account.smtp_port)
        else:
            s = smtplib.SMTP(account.smtp_host, account.smtp_port)
            s.ehlo()
            s.starttls()
            s.ehlo()
        s.login(account.email, account.password)
        return s

    def _is_alive(self, s: smtplib.SMTP) -> bool:
        try:
            s.noop()
            return True
        except Exception:
            return False

    @contextmanager
    def get(self, account: "EmailAccount"):
        with self._lock:
            s = self._conns.get(account.id)
            if s and not self._is_alive(s):
                try: s.quit()
                except Exception: pass
                s = None
            if s is None:
                s = self._open(account)
                self._conns[account.id] = s
        try:
            yield s
        except smtplib.SMTPServerDisconnected:
            with self._lock:
                self._conns.pop(account.id, None)
            s2 = self._open(account)
            with self._lock:
                self._conns[account.id] = s2
            yield s2


smtp_pool = SMTPPool()


# ══════════════════════════════════════════════════════════════
# 9.  ROUTES
# ══════════════════════════════════════════════════════════════

@email_bp.route("/email/presets", methods=["GET"])
def get_presets():
    return jsonify(get_preset(request.args.get("email", ""))), 200


# ── Connect ────────────────────────────────────────────────────
@email_bp.route("/email/connect", methods=["POST"])
@jwt_required()
def connect_email():
    user_id = get_jwt_identity()
    data    = request.get_json()

    email_addr   = data.get("email", "").strip()
    password     = data.get("password", "").strip()
    display_name = data.get("display_name", "").strip()

    if not email_addr or not password:
        return jsonify({"error": "Email and password are required"}), 400

    preset    = get_preset(email_addr)
    imap_host = data.get("imap_host") or preset["imap"]
    imap_port = int(data.get("imap_port") or preset["imap_port"])
    smtp_host = data.get("smtp_host") or preset["smtp"]
    smtp_port = int(data.get("smtp_port") or preset["smtp_port"])
    use_ssl   = data.get("use_ssl", True)

    try:
        if use_ssl:
            test = imaplib.IMAP4_SSL(imap_host, imap_port)
        else:
            test = imaplib.IMAP4(imap_host, imap_port)
        test.login(email_addr, password)
        test.logout()
    except Exception as e:
        return jsonify({"error": "IMAP connection failed: " + str(e)}), 400

    try:
        if smtp_port == 465:
            sv = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            sv = smtplib.SMTP(smtp_host, smtp_port)
            sv.starttls()
        sv.login(email_addr, password)
        sv.quit()
    except Exception as e:
        return jsonify({"error": "SMTP connection failed: " + str(e)}), 400

    account = EmailAccount.query.filter_by(user_id=user_id).first()
    if not account:
        account = EmailAccount(user_id=user_id)
        db.session.add(account)

    account.email        = email_addr
    account.display_name = display_name or email_addr.split("@")[0]
    account.password     = password
    account.imap_host    = imap_host
    account.imap_port    = imap_port
    account.smtp_host    = smtp_host
    account.smtp_port    = smtp_port
    account.use_ssl      = use_ssl
    account.is_active    = True
    db.session.commit()

    threading.Thread(target=_fast_sync_inbox, args=(account, user_id, 50), daemon=True).start()
    start_idle(account)

    return jsonify({"message": "Connected successfully", "email": email_addr}), 200


# ── Account info ───────────────────────────────────────────────
@email_bp.route("/email/account", methods=["GET"])
@jwt_required()
def get_account():
    user_id = get_jwt_identity()
    account = EmailAccount.query.filter_by(user_id=user_id, is_active=True).first()
    if not account:
        return jsonify({"connected": False}), 200
    return jsonify({"connected": True, **account.to_dict()}), 200


# ── Disconnect ─────────────────────────────────────────────────
@email_bp.route("/email/account/disconnect", methods=["DELETE"])
@jwt_required()
def disconnect():
    user_id = get_jwt_identity()
    account = EmailAccount.query.filter_by(user_id=user_id).first()
    if account:
        stop_idle(account.id)
        imap_pool.invalidate(account.id)
        account.is_active = False
        db.session.commit()
        EmailMessage.query.filter_by(user_id=user_id).delete()
        db.session.commit()
    return jsonify({"message": "Disconnected"}), 200


# ── List messages ──────────────────────────────────────────────
@email_bp.route("/email/messages", methods=["GET"])
@jwt_required()
def get_messages():
    user_id  = get_jwt_identity()
    folder   = request.args.get("folder", "inbox").lower()
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    search   = request.args.get("search", "").strip()

    # ── FIXED: "drafts" is the correct DB folder name
    if folder == "starred":
        query = EmailMessage.query.filter_by(user_id=user_id, is_starred=True)
    else:
        query = EmailMessage.query.filter_by(user_id=user_id, folder=folder)

    if search:
        query = query.filter(db.or_(
            EmailMessage.subject.ilike(f"%{search}%"),
            EmailMessage.from_addr.ilike(f"%{search}%"),
            EmailMessage.from_name.ilike(f"%{search}%"),
            EmailMessage.snippet.ilike(f"%{search}%"),
        ))

    total    = query.count()
    messages = (query
                .order_by(EmailMessage.date_received.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
                .all())

    return jsonify({
        "messages": [m.to_dict() for m in messages],
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "has_next": (page * per_page) < total,
    }), 200


# ── Get single message ─────────────────────────────────────────
@email_bp.route("/email/messages/<int:msg_id>", methods=["GET"])
@jwt_required()
def get_message(msg_id):
    user_id = get_jwt_identity()
    msg = EmailMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    if not msg.body_html and not msg.body_text:
        account = EmailAccount.query.get(msg.account_id)
        if account:
            try:
                html, text, snippet, has_att, attachments = _fetch_body(account, msg.uid)
                msg.body_html      = html
                msg.body_text      = text
                msg.snippet        = snippet or msg.snippet
                msg.has_attachment = has_att
                msg.attachments    = json.dumps(attachments)
                msg.is_read        = True
                db.session.commit()
            except Exception as e:
                print("Body fetch error:", e)

    msg.is_read = True
    db.session.commit()
    return jsonify(msg.to_dict()), 200


# ── Send email ────────────────────────────────────────────────
@email_bp.route("/email/send", methods=["POST"])
@jwt_required()
def send_email():
    user_id = get_jwt_identity()
    data    = request.get_json()

    account = EmailAccount.query.filter_by(user_id=user_id, is_active=True).first()
    if not account:
        return jsonify({"error": "No email account connected"}), 400

    to         = data.get("to", "").strip()
    subject    = data.get("subject", "").strip()
    body       = data.get("body", "")
    cc         = data.get("cc", "")
    bcc        = data.get("bcc", "")
    save_draft = data.get("saveAsDraft", False)

    if not to and not save_draft:
        return jsonify({"error": "Recipient is required"}), 400

    try:
        mime = MIMEMultipart("alternative")
        mime["From"]    = f"{account.display_name} <{account.email}>"
        mime["To"]      = to
        mime["Subject"] = subject
        # ── FIXED: set Date header with proper RFC-2822 UTC timestamp
        mime["Date"]    = localtime(_now_utc())
        if cc:  mime["Cc"]  = cc
        if bcc: mime["Bcc"] = bcc
        mime.attach(MIMEText(body, "html"))
        mime.attach(MIMEText(body.replace("<br>", "\n").replace("<p>", "\n").replace("</p>", ""), "plain"))

        now_utc = _now_utc()   # capture once, use for both DB and IMAP

        if save_draft:
            with imap_pool.get(account) as mail:
                draft_folder = _select_folder(mail, "drafts")   # ← "drafts" not "draft"
                mail.append(
                    draft_folder, "\\Draft",
                    imaplib.Time2Internaldate(now_utc),
                    mime.as_bytes()
                )
            db.session.add(EmailMessage(
                user_id=user_id, account_id=account.id,
                uid=f"draft_{now_utc.timestamp()}",
                folder="drafts",                               # ← "drafts" not "draft"
                subject=subject,
                from_addr=account.email, from_name=account.display_name,
                to_addr=to, cc_addr=cc, body_html=body,
                snippet=body[:200],
                date_received=now_utc,                         # ← UTC-aware
                is_read=True,
                attachments=json.dumps([]),
            ))
            db.session.commit()
            return jsonify({"message": "Saved as draft"}), 200

        all_recipients = [r.strip() for r in f"{to},{cc},{bcc}".split(",") if r.strip()]
        with smtp_pool.get(account) as sv:
            sv.sendmail(account.email, all_recipients, mime.as_bytes())

        # Cache in sent — UTC-aware timestamp
        db.session.add(EmailMessage(
            user_id=user_id, account_id=account.id,
            uid=f"sent_{now_utc.timestamp()}",
            folder="sent", subject=subject,
            from_addr=account.email, from_name=account.display_name,
            to_addr=to, cc_addr=cc, body_html=body,
            snippet=body[:200],
            date_received=now_utc,                             # ← UTC-aware
            is_read=True,
            attachments=json.dumps([]),
        ))
        db.session.commit()

        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── SSE stream ─────────────────────────────────────────────────
@email_bp.route("/email/stream", methods=["GET"])
@jwt_required()
def sse_stream():
    user_id = get_jwt_identity()
    q       = event_bus.subscribe(user_id)

    def generate():
        yield "data: {\"type\": \"connected\"}\n\n"
        try:
            while True:
                try:
                    payload = q.get(timeout=20)
                    yield payload
                except queue.Empty:
                    yield ": heartbeat\n\n"
        except GeneratorExit:
            pass
        finally:
            event_bus.unsubscribe(user_id, q)

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":        "keep-alive",
        },
    )


# ── Sync ───────────────────────────────────────────────────────
@email_bp.route("/email/sync", methods=["POST"])
@jwt_required()
def sync_folder_route():
    user_id = get_jwt_identity()
    folder  = request.json.get("folder", "inbox")
    account = EmailAccount.query.filter_by(user_id=user_id, is_active=True).first()
    if not account:
        return jsonify({"error": "No account connected"}), 400

    def _bg():
        new_msgs = _fast_sync_inbox(account, user_id, limit=50)
        if new_msgs:
            event_bus.publish(user_id, {"type": "sync_done", "new": len(new_msgs)})

    threading.Thread(target=_bg, daemon=True).start()
    return jsonify({"message": "Sync started"}), 200


# ── Star ── FIXED: instant DB update + async IMAP flag ─────────
@email_bp.route("/email/messages/<int:msg_id>/star", methods=["POST"])
@jwt_required()
def star_message(msg_id):
    user_id = get_jwt_identity()
    data    = request.get_json()
    starred = data.get("starred", True)

    msg = EmailMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    if not msg:
        return jsonify({"error": "Not found"}), 404

    # Immediate DB update so next fetch reflects it
    msg.is_starred = starred
    db.session.commit()

    # Push SSE event so all open tabs update instantly
    event_bus.publish(user_id, {
        "type":    "star_update",
        "id":      msg_id,
        "starred": starred,
    })

    # Async IMAP flag sync (non-blocking)
    def _flag():
        account = EmailAccount.query.get(msg.account_id)
        if account:
            try:
                with imap_pool.get(account) as mail:
                    _select_folder(mail, "inbox")
                    action = "+FLAGS" if starred else "-FLAGS"
                    mail.uid("store", str(msg.uid), action, "\\Flagged")
            except Exception as e:
                print(f"[STAR] IMAP flag error: {e}")

    threading.Thread(target=_flag, daemon=True).start()
    return jsonify({"starred": starred}), 200


# ── Archive ────────────────────────────────────────────────────
@email_bp.route("/email/messages/<int:msg_id>/archive", methods=["POST"])
@jwt_required()
def archive_message(msg_id):
    user_id = get_jwt_identity()
    msg = EmailMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    if not msg:
        return jsonify({"error": "Not found"}), 404

    msg.folder = "archive"
    db.session.commit()

    def _imap_archive():
        account = EmailAccount.query.get(msg.account_id)
        if account:
            with imap_pool.get(account) as mail:
                _select_folder(mail, "inbox")
                try:
                    mail.uid("copy",  str(msg.uid), "Archive")
                    mail.uid("store", str(msg.uid), "+FLAGS", "\\Deleted")
                    mail.expunge()
                except Exception as e:
                    print("Archive IMAP error:", e)

    threading.Thread(target=_imap_archive, daemon=True).start()
    return jsonify({"message": "Archived"}), 200


# ── Spam ───────────────────────────────────────────────────────
@email_bp.route("/email/messages/<int:msg_id>/spam", methods=["POST"])
@jwt_required()
def mark_spam(msg_id):
    user_id = get_jwt_identity()
    msg = EmailMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    if not msg:
        return jsonify({"error": "Not found"}), 404

    msg.folder = "spam"
    db.session.commit()

    def _imap_spam():
        account = EmailAccount.query.get(msg.account_id)
        if account:
            with imap_pool.get(account) as mail:
                _select_folder(mail, "inbox")
                try:
                    mail.uid("copy",  str(msg.uid), "Spam")
                    mail.uid("store", str(msg.uid), "+FLAGS", "\\Deleted")
                    mail.expunge()
                except Exception as e:
                    print("Spam IMAP error:", e)

    threading.Thread(target=_imap_spam, daemon=True).start()
    return jsonify({"message": "Marked as spam"}), 200


# ── Delete ─────────────────────────────────────────────────────
@email_bp.route("/email/messages/<int:msg_id>", methods=["DELETE"])
@jwt_required()
def delete_message(msg_id):
    user_id = get_jwt_identity()
    msg = EmailMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    if not msg:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@email_bp.route("/email/spam/delete-all", methods=["DELETE"])
@jwt_required()
def delete_all_spam():
    user_id = get_jwt_identity()
    deleted = EmailMessage.query.filter_by(user_id=user_id, folder="spam").delete()
    db.session.commit()
    return jsonify({"deleted": deleted}), 200