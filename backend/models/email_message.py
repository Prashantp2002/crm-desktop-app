from extensions import db
from datetime import datetime

class EmailMessage(db.Model):
    __tablename__  = "email_messages"
    __table_args__ = {"extend_existing": True}

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    account_id    = db.Column(db.Integer, db.ForeignKey("email_accounts.id"))
    uid           = db.Column(db.String(100))          # IMAP UID
    folder        = db.Column(db.String(50), default="inbox")
    subject       = db.Column(db.String(500))
    from_addr     = db.Column(db.String(300))
    from_name     = db.Column(db.String(200))
    to_addr       = db.Column(db.Text)
    cc_addr       = db.Column(db.Text)
    bcc_addr      = db.Column(db.Text)
    body_html     = db.Column(db.Text)
    body_text     = db.Column(db.Text)
    snippet       = db.Column(db.String(300))
    date_received = db.Column(db.DateTime)
    is_read       = db.Column(db.Boolean, default=False)
    is_starred    = db.Column(db.Boolean, default=False)
    has_attachment= db.Column(db.Boolean, default=False)
    attachments   = db.Column(db.Text)                  # JSON string
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id":           self.id,
            "uid":          self.uid,
            "folder":       self.folder,
            "subject":      self.subject or "(no subject)",
            "from":         self.from_addr or "",
            "from_name":    self.from_name or "",
            "to":           self.to_addr   or "",
            "cc":           self.cc_addr   or "",
            "snippet":      self.snippet   or "",
            "body":         self.body_html or self.body_text or "",
            
            "date_received": self.date_received.isoformat() if self.date_received else None,
            "isUnread":     not self.is_read,
            "isStarred":    self.is_starred,
            "hasAttachment":self.has_attachment,
            "attachments":  json.loads(self.attachments) if self.attachments else [],
        }