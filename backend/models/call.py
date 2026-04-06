from extensions import db
import uuid
from datetime import datetime

class Call(db.Model):
    __tablename__  = "calls"
    __table_args__ = {"extend_existing": True}

    id            = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, nullable=False)
    name          = db.Column(db.String(200), nullable=False)
    status        = db.Column(db.String(50),  default="Planned")
    direction     = db.Column(db.String(50),  default="Outbound")
    date_start    = db.Column(db.String(30))
    date_end      = db.Column(db.String(30))
    time_start    = db.Column(db.String(10))
    time_end      = db.Column(db.String(10))
    duration      = db.Column(db.String(20),  default="5m")
    description   = db.Column(db.Text)
    parent_type   = db.Column(db.String(50),  default="Account")
    parent_name   = db.Column(db.String(200))
    assigned_user = db.Column(db.String(100))
    teams         = db.Column(db.String(200))
    attendees_users    = db.Column(db.String(500))
    attendees_contacts = db.Column(db.String(500))
    attendees_leads    = db.Column(db.String(500))
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":                 self.id,
            "name":               self.name,
            "status":             self.status,
            "direction":          self.direction,
            "date_start":         self.date_start,
            "date_end":           self.date_end,
            "time_start":         self.time_start,
            "time_end":           self.time_end,
            "duration":           self.duration,
            "description":        self.description,
            "parent_type":        self.parent_type,
            "parent_name":        self.parent_name,
            "assigned_user":      self.assigned_user,
            "teams":              self.teams,
            "attendees_users":    self.attendees_users,
            "attendees_contacts": self.attendees_contacts,
            "attendees_leads":    self.attendees_leads,
            "created_at":         self.created_at.isoformat() if self.created_at else None,
            "updated_at":         self.updated_at.isoformat() if self.updated_at else None,
        }