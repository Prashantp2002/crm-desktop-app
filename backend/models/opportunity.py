from extensions import db
from datetime import datetime

class Opportunity(db.Model):
    __tablename__   = "opportunities"
    __table_args__  = {"extend_existing": True}    # ← ADD THIS

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.String, nullable=False)
    name           = db.Column(db.String(200), nullable=False)
    account_name   = db.Column(db.String(150))
    stage          = db.Column(db.String(100), default="Prospecting")
    amount         = db.Column(db.String(50))
    probability    = db.Column(db.String(20))
    close_date     = db.Column(db.String(30))
    contacts       = db.Column(db.String(200))
    lead_source    = db.Column(db.String(100))
    assigned_user  = db.Column(db.String(100))
    team           = db.Column(db.String(100))
    email          = db.Column(db.String(120))
    phone          = db.Column(db.String(30))
    address_country= db.Column(db.String(100))
    description    = db.Column(db.Text)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":             self.id,
            "name":           self.name,
            "account_name":   self.account_name,
            "stage":          self.stage,
            "amount":         self.amount,
            "probability":    self.probability,
            "close_date":     self.close_date,
            "contacts":       self.contacts,
            "lead_source":    self.lead_source,
            "assigned_user":  self.assigned_user,
            "team":           self.team,
            "email":          self.email,
            "phone":          self.phone,
            "address_country":self.address_country,
            "description":    self.description,
            "created_at":     self.created_at.isoformat() if self.created_at else None,
            "updated_at":     self.updated_at.isoformat() if self.updated_at else None,
        }