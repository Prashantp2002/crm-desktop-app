from extensions import db
from datetime import datetime

class EmailAccount(db.Model):
    __tablename__  = "email_accounts"
    __table_args__ = {"extend_existing": True}

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    email         = db.Column(db.String(200))
    display_name  = db.Column(db.String(200))
    password      = db.Column(db.Text)           # app password stored encrypted
    imap_host     = db.Column(db.String(200))
    imap_port     = db.Column(db.Integer, default=993)
    smtp_host     = db.Column(db.String(200))
    smtp_port     = db.Column(db.Integer, default=587)
    use_ssl       = db.Column(db.Boolean, default=True)
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":           self.id,
            "email":        self.email,
            "display_name": self.display_name,
            "imap_host":    self.imap_host,
            "imap_port":    self.imap_port,
            "smtp_host":    self.smtp_host,
            "smtp_port":    self.smtp_port,
            "is_active":    self.is_active,
        }