from extensions import db
from datetime import datetime

class Contact(db.Model):
    __tablename__ = "contacts"

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.String, nullable=False)
    full_name      = db.Column(db.String(200), nullable=False)
    email          = db.Column(db.String(120))
    dob            = db.Column(db.String(20))
    phone          = db.Column(db.String(30))
    address_city   = db.Column(db.String(100))
    address_state  = db.Column(db.String(100))
    address_postal = db.Column(db.String(20))
    address_country= db.Column(db.String(100))
    account_id     = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=True)
    assigned_to    = db.Column(db.String(100))
    team           = db.Column(db.String(100))
    description    = db.Column(db.Text)
    photo_url      = db.Column(db.String(500))
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    account = db.relationship("Account", backref="contacts", lazy=True)

    def to_dict(self):
        return {
            "id":              self.id,
            "full_name":       self.full_name,
            "email":           self.email,
            "dob":             self.dob,
            "phone":           self.phone,
            "address_city":    self.address_city,
            "address_state":   self.address_state,
            "address_postal":  self.address_postal,
            "address_country": self.address_country,
            "account_id":      self.account_id,
            "account_name":    self.account.name if self.account else "",
            "assigned_to":     self.assigned_to,
            "team":            self.team,
            "description":     self.description,
            "photo_url":       self.photo_url,
            "created_at":      self.created_at.isoformat() if self.created_at else None,
        }