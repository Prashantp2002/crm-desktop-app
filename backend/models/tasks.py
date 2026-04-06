from extensions import db
import uuid
from datetime import datetime

class Task(db.Model):
    __tablename__  = "tasks"
    __table_args__ = {"extend_existing": True}

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title       = db.Column(db.String(255))
    status      = db.Column(db.String(50),  default="Planned")
    due_date    = db.Column(db.DateTime)
    created_at  = db.Column(db.DateTime, server_default=db.func.now())

    # ── new fields ──
    date_start    = db.Column(db.String(30))
    date_end      = db.Column(db.String(30))
    time_start    = db.Column(db.String(10))
    time_end      = db.Column(db.String(10))
    priority      = db.Column(db.String(20),  default="Normal")
    description   = db.Column(db.Text)
    parent_type   = db.Column(db.String(50),  default="Account")
    parent_name   = db.Column(db.String(200))
    assigned_user = db.Column(db.String(100))
    assigned_user_id = db.Column(db.String(36))
    teams         = db.Column(db.String(200))
    attachment    = db.Column(db.String(300))
    duration      = db.Column(db.String(20))
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":            self.id,
            "user_id":       self.user_id,
            "title":         self.title,
            "name":          self.title,
            "status":        self.status or "Planned",
            "due_date":      self.due_date.isoformat() if self.due_date else None,
            "date_start": self.date_start.isoformat() if self.date_start else None,
            "date_end": self.date_end.isoformat() if self.date_end else None,
            "time_start": self.time_start.isoformat() if self.time_start else None,
            "time_end": self.time_end.isoformat() if self.time_end else None,
            "priority":      self.priority or "Normal",
            "description":   self.description,
            "parent_type":   self.parent_type or "Account",
            "parent_name":   self.parent_name,
            "assigned_user": self.assigned_user,
            "assigned_user_id": self.assigned_user_id,
            "teams":         self.teams,
            "attachment":    self.attachment,
            "duration":      self.duration,
            "created_at":    self.created_at.isoformat() if self.created_at else None,
            "updated_at":    self.updated_at.isoformat() if self.updated_at else None,
        }