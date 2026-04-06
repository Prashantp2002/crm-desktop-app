from extensions import db
import uuid
from datetime import datetime

class Team(db.Model):
    __tablename__ = "teams"

    id          = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name        = db.Column(db.String(150), nullable=False)
    roles       = db.Column(db.String(200))
    position_list = db.Column(db.String(300))
    layout_set  = db.Column(db.String(100))
    working_time_calendar = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":                     self.id,
            "name":                   self.name,
            "roles":                  self.roles,
            "position_list":          self.position_list,
            "layout_set":             self.layout_set,
            "working_time_calendar":  self.working_time_calendar,
            "description":            self.description,
            "created_at":             self.created_at.isoformat() if self.created_at else None,
        }