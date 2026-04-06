from extensions import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = "leads"

    id                 = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.String, nullable=False)
    salutation         = db.Column(db.String(20))
    first_name         = db.Column(db.String(100), nullable=False)
    last_name          = db.Column(db.String(100))
    account_name       = db.Column(db.String(150))
    email              = db.Column(db.String(120))
    phone              = db.Column(db.String(30))
    phone_type         = db.Column(db.String(20))
    website            = db.Column(db.String(200))
    address_street     = db.Column(db.String(200))
    address_city       = db.Column(db.String(100))
    address_state      = db.Column(db.String(100))
    address_postal     = db.Column(db.String(20))
    address_country    = db.Column(db.String(100))
    industry           = db.Column(db.String(100))
    status             = db.Column(db.String(50), default="New")
    opportunity_amount = db.Column(db.String(50))
    source             = db.Column(db.String(100))
    campaign           = db.Column(db.String(100))
    assigned_user      = db.Column(db.String(100))
    team               = db.Column(db.String(100))
    title              = db.Column(db.String(100))
    description        = db.Column(db.Text)
    created_at         = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at         = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":                 self.id,
            "salutation":         self.salutation,
            "first_name":         self.first_name,
            "last_name":          self.last_name,
            "full_name":          " ".join(filter(None, [self.salutation, self.first_name, self.last_name])),
            "account_name":       self.account_name,
            "email":              self.email,
            "phone":              self.phone,
            "phone_type":         self.phone_type,
            "website":            self.website,
            "address_street":     self.address_street,
            "address_city":       self.address_city,
            "address_state":      self.address_state,
            "address_postal":     self.address_postal,
            "address_country":    self.address_country,
            "industry":           self.industry,
            "status":             self.status,
            "opportunity_amount": self.opportunity_amount,
            "source":             self.source,
            "campaign":           self.campaign,
            "assigned_user":      self.assigned_user,
            "team":               self.team,
            "title":              self.title,
            "description":        self.description,
            "created_at":         self.created_at.isoformat() if self.created_at else None,
            "updated_at":         self.updated_at.isoformat() if self.updated_at else None,
        }