from extensions import db
from datetime import datetime

class Account(db.Model):
    __tablename__ = "accounts"

    id         = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    name       = db.Column(db.String(150), nullable=False)
    website    = db.Column(db.String(200))
    industry   = db.Column(db.String(100))
    email      = db.Column(db.String(120))
    phone      = db.Column(db.String(30))
    type       = db.Column(db.String(50))

    billing_street   = db.Column(db.String(200))
    billing_city     = db.Column(db.String(100))
    billing_state    = db.Column(db.String(100))
    billing_postal   = db.Column(db.String(20))
    billing_country  = db.Column(db.String(100))

    shipping_street  = db.Column(db.String(200))
    shipping_city    = db.Column(db.String(100))
    shipping_state   = db.Column(db.String(100))
    shipping_postal  = db.Column(db.String(20))
    shipping_country = db.Column(db.String(100))

    assigned_user    = db.Column(db.String(100))
    description      = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":               self.id,
            "name":             self.name,
            "website":          self.website,
            "industry":         self.industry,
            "email":            self.email,
            "phone":            self.phone,
            "type":             self.type,
            "billing_street":   self.billing_street,
            "billing_city":     self.billing_city,
            "billing_state":    self.billing_state,
            "billing_postal":   self.billing_postal,
            "billing_country":  self.billing_country,
            "shipping_street":  self.shipping_street,
            "shipping_city":    self.shipping_city,
            "shipping_state":   self.shipping_state,
            "shipping_postal":  self.shipping_postal,
            "shipping_country": self.shipping_country,
            "assigned_user":    self.assigned_user,
            "description":      self.description,
            "created_at":       self.created_at.isoformat() if self.created_at else None,
        }