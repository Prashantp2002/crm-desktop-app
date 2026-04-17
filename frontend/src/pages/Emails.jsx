import { useState, useEffect, useRef } from "react";
import "../styles/emails.css";
import {
  getEmailAccount, connectEmail, disconnectAccount,
  getMessages, getMessage, sendEmail,
  starMessage, archiveMessage, markSpam,
  deleteMessage, deleteAllSpam, syncFolder,
} from "../api/email";

const HOSTINGER = {
  imap_host : "imap.hostinger.com",
  imap_port : 993,
  smtp_host : "smtp.hostinger.com",
  smtp_port : 587,
  use_ssl   : true,
};

const extractName = (from = "") => {
  const m = from.match(/^"?([^"<]+)"?\s*</);
  return m ? m[1].trim() : from.split("@")[0] || from;
};

const COLORS = ["#c0392b","#2980b9","#27ae60","#8e44ad","#e67e22","#16a085","#d35400"];
const avatarColor = (name = "") => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
const getInitials = (name = "") => {
  const p = name.trim().split(" ");
  return p.length >= 2
    ? p[0].charAt(0).toUpperCase() + p[1].charAt(0).toUpperCase()
    : (p[0].charAt(0) || "?").toUpperCase();
};

const TABS = ["Inbox","Starred","Sent","Drafts","Spam","Archived"];

// ── FIXED: "drafts" (not "draft") matches backend DB folder name
const FOLDER_MAP = {
  Inbox    : "inbox",
  Sent     : "sent",
  Drafts   : "drafts",   // ← was "draft", caused empty Drafts tab
  Spam     : "spam",
  Archived : "archive",
  Starred  : "inbox",    // fetch inbox, filter starred client-side
};

// ══════════════════════════════════════════════════════════════
// DATE / TIME HELPERS
// The backend stores all dates as UTC ISO-8601 strings.
// We parse them as UTC and format in the user's LOCAL timezone.
// ══════════════════════════════════════════════════════════════

/**
 * Parse a date string coming from the API.
 * Backend sends ISO-8601 e.g. "2024-03-15T10:30:00+00:00"
 * If the string has no timezone suffix, we treat it as UTC.
 */
function parseApiDate(raw) {
  if (!raw) return null;
  // If it already has a timezone offset (+00:00, Z, etc.) → parse directly
  // If it looks like a bare "YYYY-MM-DDTHH:MM:SS" without offset → append Z
  const hasOffset = /[Zz]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(raw);
  return new Date(hasOffset ? raw : raw + "Z");
}

/**
 * Format a date for the email row:
 *   - Today      → "10:32 AM"  (12-hour, user local time)
 *   - This year  → "Mar 15"
 *   - Older      → "Mar 15, 2023"
 */
function formatEmailDate(raw) {
  const dt = parseApiDate(raw);
  if (!dt || isNaN(dt.getTime())) return "--";

  const now   = new Date();
  const isToday =
    dt.getDate()     === now.getDate()   &&
    dt.getMonth()    === now.getMonth()  &&
    dt.getFullYear() === now.getFullYear();

  if (isToday) {
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const isThisYear = dt.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return dt.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return dt.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Full date+time for the email detail header.
 * e.g. "Wednesday, March 15, 2024 at 10:32 AM"
 */
function formatEmailDateFull(raw) {
  const dt = parseApiDate(raw);
  if (!dt || isNaN(dt.getTime())) return "No date";
  return dt.toLocaleString([], {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}


// ══════════════════════════════════════════════════════════════
// CONNECT SCREEN
// ══════════════════════════════════════════════════════════════

const HostingerConnect = ({ onConnected }) => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleConnect = async () => {
    if (!email.includes("@")) { setError("Enter a valid company email address"); return; }
    if (!password)            { setError("Password is required"); return; }
    setError("");
    setLoading(true);
    try {
      await connectEmail({ email, password, display_name: email.split("@")[0], ...HOSTINGER });
      onConnected();
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Connection failed";
      if (msg.toLowerCase().includes("imap") || msg.toLowerCase().includes("authentication")) {
        setError("Incorrect email or password. Please check and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="em-connect">
      <div className="em-connect-card">
        <div className="em-connect-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#c0392b">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <h2>Sign in to your Email</h2>
        <p>Enter your company email and password to access your mailbox.</p>
        {error && <div className="em-connect-err">{error}</div>}
        <div className="em-connect-field">
          <label>Company Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            onKeyDown={e => e.key === "Enter" && handleConnect()}
            autoComplete="username"
          />
        </div>
        <div className="em-connect-field">
          <label>Password</label>
          <div className="em-pass-wrap">
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your email password"
              onKeyDown={e => e.key === "Enter" && handleConnect()}
              autoComplete="current-password"
            />
            <button className="em-pass-toggle" onClick={() => setShowPass(v => !v)} type="button">
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button className="em-connect-btn" onClick={handleConnect} disabled={loading}>
          {loading
            ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                <span className="em-spinner" style={{ width:16, height:16, borderWidth:2 }} />
                Connecting…
              </span>
            : "Sign in to Mailbox"
          }
        </button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:12, color:"#6b7280", marginTop:8 }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#27ae60" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Secured via Hostinger Business Email
        </div>
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// COMPOSE MODAL
// ══════════════════════════════════════════════════════════════

const ComposeModal = ({ onClose, onSend, replyTo = null, forwardOf = null }) => {
  const [to,        setTo]        = useState(replyTo ? (replyTo.from_addr || replyTo.from || "") : "");
  const [cc,        setCc]        = useState("");
  const [bcc,       setBcc]       = useState("");
  const [subject,   setSubject]   = useState(
    replyTo   ? "Re: "  + (replyTo.subject  || "") :
    forwardOf ? "Fwd: " + (forwardOf.subject || "") : ""
  );
  const [body,      setBody]      = useState(
    forwardOf
      ? `<br><br>---------- Forwarded message ----------<br>From: ${forwardOf.from_addr || forwardOf.from || ""}<br>Subject: ${forwardOf.subject || ""}<br><br>${forwardOf.snippet || ""}`
      : ""
  );
  const [showCc,    setShowCc]    = useState(false);
  const [showBcc,   setShowBcc]   = useState(false);
  const [sending,   setSending]   = useState(false);
  const [maximized, setMaximized] = useState(false);
  const bodyRef = useRef();

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    bodyRef.current?.focus();
  };

  const handleSend = async (draft = false) => {
    if (!to.trim() && !draft) { alert("Please enter a recipient"); return; }
    try {
      setSending(true);
      const htmlBody = bodyRef.current ? bodyRef.current.innerHTML : body;
      await onSend({ to, cc, bcc, subject, body: htmlBody, saveAsDraft: draft });
      onClose();
    } catch (e) {
      alert("Failed: " + (e.response?.data?.error || e.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={"em-compose" + (maximized ? " em-compose-max" : "")}>
      <div className="em-compose-header">
        <span>New Message</span>
        <div className="em-compose-hbtns">
          <button onClick={() => setMaximized(v => !v)} title="Maximize">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="em-compose-body">
        <div className="em-compose-row">
          <span className="em-compose-lbl">To</span>
          <input className="em-compose-input" value={to}
            onChange={e => setTo(e.target.value)} placeholder="Recipients" />
          <div className="em-compose-row-btns">
            {!showCc  && <button onClick={() => setShowCc(true)}>Cc</button>}
            {!showBcc && <button onClick={() => setShowBcc(true)}>Bcc</button>}
          </div>
        </div>
        {showCc && (
          <div className="em-compose-row">
            <span className="em-compose-lbl">Cc</span>
            <input className="em-compose-input" value={cc}
              onChange={e => setCc(e.target.value)} placeholder="Cc recipients" />
          </div>
        )}
        {showBcc && (
          <div className="em-compose-row">
            <span className="em-compose-lbl">Bcc</span>
            <input className="em-compose-input" value={bcc}
              onChange={e => setBcc(e.target.value)} placeholder="Bcc recipients" />
          </div>
        )}
        <div className="em-compose-row">
          <span className="em-compose-lbl">Subject :</span>
          <input className="em-compose-input" value={subject}
            onChange={e => setSubject(e.target.value)} placeholder="Subject" />
        </div>
        <div className="em-compose-toolbar">
          <button className="em-tb" onClick={() => execCmd("undo")}>↩</button>
          <button className="em-tb" onClick={() => execCmd("redo")}>↪</button>
          <select className="em-tb-font" onChange={e => execCmd("fontName", e.target.value)}>
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
          <button className="em-tb em-tb-bold"   onClick={() => execCmd("bold")}>B</button>
          <button className="em-tb em-tb-italic" onClick={() => execCmd("italic")}>I</button>
          <button className="em-tb em-tb-ul"     onClick={() => execCmd("underline")}>U</button>
          <button className="em-tb" onClick={() => execCmd("justifyLeft")}>≡</button>
          <button className="em-tb" onClick={() => execCmd("insertUnorderedList")}>☰</button>
          <button className="em-tb" onClick={() => execCmd("insertOrderedList")}>≡#</button>
        </div>
        <div
          ref={bodyRef}
          className="em-compose-editor"
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <div className="em-compose-footer">
          <div className="em-compose-footer-left">
            <button className="em-tb" onClick={() => execCmd("formatBlock","p")}>A</button>
            <button className="em-tb">📎</button>
            <button className="em-tb" onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCmd("createLink", url);
            }}>🔗</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="em-save-draft-btn" onClick={() => handleSend(true)} disabled={sending}>
              Save Draft
            </button>
            <button className="em-send-btn" onClick={() => handleSend(false)} disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// EMAIL ROW
// ══════════════════════════════════════════════════════════════

const EmailRow = ({ email, selected, onSelect, onClick, onStar, folder }) => {
  const name  = folder === "sent" || folder === "drafts"
    ? "To: " + (email.to?.split(",")[0] || "")
    : (email.from_name || extractName(email.from || ""));
  const isRead = !email.isUnread;
  const color  = avatarColor(name);

  return (
    <div
      className={"em-row" + (selected ? " em-row-sel" : "") + (isRead ? " em-row-read" : "")}
      onClick={onClick}
    >
      <div className="em-row-check" onClick={e => { e.stopPropagation(); onSelect(); }}>
        <input type="checkbox" checked={selected} onChange={() => {}} />
      </div>
      <button
        className={"em-row-star" + (email.isStarred ? " starred" : "")}
        onClick={e => { e.stopPropagation(); onStar(email.id, !email.isStarred); }}
      >★</button>
      <div className="em-row-avatar" style={{ background: color }}>
        {folder === "sent" || folder === "drafts"
          ? (email.to?.charAt(0) || "?").toUpperCase()
          : getInitials(name)
        }
      </div>
      <div className="em-row-name">
        {folder === "drafts" && <span className="em-draft-label">Draft : </span>}
        {name}
      </div>
      <div className="em-row-subject">
        <span className="em-row-subj-text">{email.subject}</span>
        <span className="em-row-snippet"> — {email.snippet}</span>
      </div>
      {email.hasAttachment && email.attachments?.length > 0 && (
        <div className="em-row-attachments">
          {email.attachments.slice(0,3).map((a,i) => (
            <span key={i} className="em-attach-chip">
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              {a.filename}
            </span>
          ))}
        </div>
      )}
      {/* ── FIXED: use formatEmailDate helper for proper local timezone display */}
      <div className="em-row-time">
        {formatEmailDate(email.date_received)}
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// EMAIL DETAIL
// ══════════════════════════════════════════════════════════════

const EmailDetail = ({ email, onReply, onForward, onDelete, onArchive, onSpam, onClose }) => {
  const [replyOpen,   setReplyOpen]   = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [replyBody,   setReplyBody]   = useState("");
  const [sending,     setSending]     = useState(false);

  const name  = email.from_name || extractName(email.from || "");
  const color = avatarColor(name);

  const handleReply = async () => {
    try {
      setSending(true);
      await onReply({
        to:      email.from_addr || email.from,
        subject: "Re: " + email.subject,
        body:    replyBody,
      });
      setReplyOpen(false);
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="em-detail">
      <div className="em-detail-header">
        <h2 className="em-detail-subject">{email.subject}</h2>
        <div className="em-detail-actions">
          <button className="em-da-btn" title="Archive" onClick={() => onArchive(email.id)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
          </button>
          <button className="em-da-btn" title="Spam" onClick={() => onSpam(email.id)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </button>
          <button className="em-da-btn em-da-delete" title="Delete"
            onClick={() => { onDelete(email.id); onClose(); }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button className="em-da-btn" title="Print" onClick={() => window.print()}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── FIXED: full human-readable local datetime */}
      <div className="em-detail-date">
        {formatEmailDateFull(email.date_received)}
      </div>

      <div className="em-detail-sender">
        <div className="em-detail-avatar" style={{ background: color }}>{getInitials(name)}</div>
        <div className="em-detail-from">
          <span className="em-detail-name">{name}</span>
          <span className="em-detail-to-me">to me{email.to ? ", " + email.to : ""}</span>
        </div>
      </div>

      <div className="em-detail-body"
        dangerouslySetInnerHTML={{ __html: email.body || email.snippet || "" }} />

      {email.attachments?.length > 0 && (
        <div className="em-detail-attachments">
          <span className="em-detail-attach-label">Attachments:</span>
          {email.attachments.map((a,i) => (
            <span key={i} className="em-attach-chip">📎 {a.filename}</span>
          ))}
        </div>
      )}

      {!replyOpen && !forwardOpen && (
        <div className="em-detail-reply-btns">
          <button className="em-reply-btn" onClick={() => setReplyOpen(true)}>↩ Reply</button>
          <button className="em-reply-btn" onClick={() => setReplyOpen(true)}>↩ Reply All</button>
          <button className="em-reply-btn" onClick={() => setForwardOpen(true)}>↪ Forward</button>
        </div>
      )}

      {(replyOpen || forwardOpen) && (
        <div className="em-inline-reply">
          <div className="em-ir-to">
            <span>{forwardOpen ? "→ Forward to:" : "→ Reply to:"}</span>
            <span className="em-ir-recipient">
              {forwardOpen ? "" : (email.from_addr || email.from)}
            </span>
            <button className="em-ir-close"
              onClick={() => { setReplyOpen(false); setForwardOpen(false); }}>✕</button>
          </div>
          {forwardOpen && (
            <div className="em-ir-fwd-banner">
              ---------- Forwarded message ----------{"\n"}
              From: {email.from_addr || email.from}{"\n"}
              Subject: {email.subject}
            </div>
          )}
          <textarea
            className="em-ir-textarea"
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="Write your reply…"
            rows={4}
          />
          <div className="em-ir-footer">
            <button className="em-send-btn" onClick={handleReply} disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </button>
            <button className="em-tb">📎</button>
            <button className="em-tb">🔗</button>
          </div>
        </div>
      )}
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// MAIN EMAIL PAGE
// ══════════════════════════════════════════════════════════════

const Emails = () => {
  const [connected,   setConnected]   = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("Inbox");
  const [messages,    setMessages]    = useState([]);
  const [fetching,    setFetching]    = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [selected,    setSelected]    = useState(new Set());
  const [openEmail,   setOpenEmail]   = useState(null);
  const [search,      setSearch]      = useState("");
  const [compose,     setCompose]     = useState(false);
  const [replyTo,     setReplyTo]     = useState(null);
  const [forwardOf,   setForwardOf]   = useState(null);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [hasNext,     setHasNext]     = useState(false);

  // ── SSE connection for real-time updates
  const sseRef = useRef(null);

  useEffect(() => { checkAccount(); }, []);

  useEffect(() => {
    if (connected) {
      fetchMessages(true);
      setupSSE();
    }
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [tab, connected]);

  // ── FIXED: SSE handler — listens for new_mail AND star_update events
  //    so starring in one tab instantly reflects in Starred tab with no lag
  const setupSSE = () => {
    if (sseRef.current) sseRef.current.close();

    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || "";
    // Note: EventSource doesn't support custom headers natively in all browsers.
    // If your backend supports token as query param, use that. Otherwise use fetch-based SSE.
    const url = `/email/stream${token ? `?token=${token}` : ""}`;

    try {
      const es = new EventSource(url);
      sseRef.current = es;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          if (event.type === "new_mail") {
            // Prepend new messages if we're on the inbox tab
            if (tab === "Inbox") {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.uid));
                const fresh = (event.messages || []).filter(m => !existingIds.has(m.uid));
                return [...fresh, ...prev];
              });
            }
          }

          // ── FIXED: real-time star sync across all tabs
          if (event.type === "star_update") {
            setMessages(prev =>
              prev.map(m => m.id === event.id ? { ...m, isStarred: event.starred } : m)
            );
            // If we're on the Starred tab and something was unstarred, remove it
            if (tab === "Starred" && !event.starred) {
              setMessages(prev => prev.filter(m => m.id !== event.id));
            }
            // If openEmail is the same message, update it too
            setOpenEmail(prev =>
              prev && prev.id === event.id ? { ...prev, isStarred: event.starred } : prev
            );
          }

        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        sseRef.current = null;
        // Reconnect after 5s
        setTimeout(() => { if (connected) setupSSE(); }, 5000);
      };
    } catch (_) {
      // SSE not available, silent fail — polling still works via manual sync
    }
  };

  const checkAccount = async () => {
    try {
      const r = await getEmailAccount();
      setConnected(r.data.connected);
      if (r.data.connected) setAccountInfo(r.data);
    } catch (e) {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnected = async () => {
    try {
      const r = await getEmailAccount();
      setAccountInfo(r.data);
    } catch (_) {}
    setConnected(true);
  };

  const fetchMessages = async (reset = false, pg = 1) => {
    setFetching(true);
    try {
      const r = await getMessages({
        folder   : FOLDER_MAP[tab],
        page     : pg,
        per_page : 50,
        search   : search,
        refresh  : reset ? "true" : "false",
      });

      const msgs = tab === "Starred"
        ? r.data.messages.filter(m => m.isStarred)
        : r.data.messages;

      setMessages(reset ? msgs : prev => [...prev, ...msgs]);
      setTotal(r.data.total);
      setHasNext(r.data.has_next);
      setPage(pg);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncFolder(FOLDER_MAP[tab]);
      await fetchMessages(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenEmail = async (id) => {
    try {
      const r = await getMessage(id);
      setOpenEmail(r.data);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: false } : m));
    } catch (e) {
      console.error(e);
    }
  };

  // ── FIXED: optimistic star update — UI flips instantly, no waiting for API
  const handleStar = async (id, starred) => {
    // 1. Optimistic update — instant feedback
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: starred } : m));

    // 2. If on Starred tab and we're unstarring, remove from list immediately
    if (tab === "Starred" && !starred) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }

    // 3. Update open email if it's the same one
    if (openEmail?.id === id) {
      setOpenEmail(prev => ({ ...prev, isStarred: starred }));
    }

    // 4. Fire API (non-blocking — backend also publishes SSE event)
    try {
      await starMessage(id, starred);
    } catch (e) {
      // Revert on failure
      console.error("Star error, reverting:", e);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !starred } : m));
      if (openEmail?.id === id) {
        setOpenEmail(prev => ({ ...prev, isStarred: !starred }));
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      setOpenEmail(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (id) => {
    // Optimistic remove from current view
    setMessages(prev => prev.filter(m => m.id !== id));
    setOpenEmail(null);
    try {
      await archiveMessage(id);
      if (tab === "Archived") fetchMessages(true);
    } catch (e) {
      console.error("Archive error:", e);
      fetchMessages(true); // revert by refetching
    }
  };

  const handleSpam = async (id) => {
    // Optimistic remove
    setMessages(prev => prev.filter(m => m.id !== id));
    setOpenEmail(null);
    try {
      await markSpam(id);
      if (tab === "Spam") fetchMessages(true);
    } catch (e) {
      console.error("Spam error:", e);
      fetchMessages(true);
    }
  };

  const handleSend = async (data) => {
    await sendEmail(data);
    if (tab === "Sent" || tab === "Drafts") fetchMessages(true);
  };

  const handleDisconnect = async () => {
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    await disconnectAccount();
    setConnected(false);
    setAccountInfo(null);
    setMessages([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  if (loading) {
    return (
      <div className="em-page">
        <div className="em-loading"><div className="em-spinner" /> Loading…</div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="em-page">
        <HostingerConnect onConnected={handleConnected} />
      </div>
    );
  }

  return (
    <div className="em-page">

      <div className="em-toolbar">
        <div className="em-search-wrap">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.2} style={{ color:"#9ba8c4", flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="em-search-input"
            placeholder="Search emails…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchMessages(true)}
          />
          {search && (
            <button onClick={() => { setSearch(""); fetchMessages(true); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#9ba8c4", fontSize:12 }}>
              ✕
            </button>
          )}
        </div>
        <button className="em-compose-btn"
          onClick={() => { setReplyTo(null); setForwardOf(null); setCompose(true); }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Compose
        </button>
      </div>

      <div className="em-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={"em-tab" + (tab === t ? " em-tab-active" : "")}
            onClick={() => { setTab(t); setOpenEmail(null); setSelected(new Set()); }}
          >{t}</button>
        ))}
      </div>

      {tab === "Spam" && (
        <div className="em-spam-banner">
          Messages in Spam for more than 30 days are automatically deleted.
          <button className="em-spam-delete"
            onClick={async () => { await deleteAllSpam(); fetchMessages(true); }}>
            Delete all spam now
          </button>
        </div>
      )}

      {openEmail ? (
        <div className="em-detail-wrap">
          <div className="em-detail-topbar">
            <button className="em-back-btn" onClick={() => setOpenEmail(null)}>← Back</button>
            <div className="em-detail-pagination">
              <span>{messages.findIndex(m => m.id === openEmail.id) + 1} of {messages.length}</span>
            </div>
          </div>
          <div className="em-detail-scroll">
            <EmailDetail
              email={openEmail}
              onClose={() => setOpenEmail(null)}
              onReply={handleSend}
              onForward={handleSend}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onSpam={handleSpam}
            />
          </div>
        </div>
      ) : (
        <div className="em-list-wrap">
          <div className="em-list-header">
            <div className="em-list-hdr-left">
              <input
                type="checkbox"
                checked={selected.size === messages.length && messages.length > 0}
                onChange={() => setSelected(
                  selected.size === messages.length
                    ? new Set()
                    : new Set(messages.map(m => m.id))
                )}
              />
              <button
                className={"em-hdr-btn" + (syncing ? " em-syncing" : "")}
                onClick={handleSync} title="Sync"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}
                  style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              <button className="em-hdr-btn">⋮</button>
            </div>
            <div className="em-list-hdr-right">
              <span className="em-pagination">
                {messages.length > 0 ? `1–${messages.length} of ${total}` : "0 messages"}
              </span>
              <button className="em-page-btn" disabled={page <= 1}
                onClick={() => fetchMessages(false, page - 1)}>‹</button>
              <button className="em-page-btn" disabled={!hasNext}
                onClick={() => fetchMessages(false, page + 1)}>›</button>
            </div>
          </div>

          {fetching ? (
            <div className="em-fetching"><div className="em-spinner" /> Loading emails…</div>
          ) : messages.length === 0 ? (
            <div className="em-empty">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <p>No emails in {tab}</p>
              <button className="em-sync-empty-btn" onClick={handleSync}>Sync Now</button>
            </div>
          ) : (
            <div className="em-messages">
              {messages.map(email => (
                <EmailRow
                  key={email.id}
                  email={email}
                  folder={tab.toLowerCase()}
                  selected={selected.has(email.id)}
                  onSelect={() => toggleSelect(email.id)}
                  onClick={() => handleOpenEmail(email.id)}
                  onStar={handleStar}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="em-account-bar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#c0392b">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span>{accountInfo?.email}</span>
        <button className="em-disconnect-btn" onClick={handleDisconnect}>
          Sign out of mailbox
        </button>
      </div>

      {compose && (
        <ComposeModal
          onClose={() => { setCompose(false); setReplyTo(null); setForwardOf(null); }}
          onSend={handleSend}
          replyTo={replyTo}
          forwardOf={forwardOf}
        />
      )}
    </div>
  );
};

export default Emails;