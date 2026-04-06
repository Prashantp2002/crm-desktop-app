from extensions import db
from datetime import datetime
import json


class Meeting(db.Model):
    __tablename__ = "meetings"
    __table_args__ = {"extend_existing": True}

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title            = db.Column(db.String(255))
    client_name      = db.Column(db.String(100))
    meeting_time     = db.Column(db.DateTime)
    platform         = db.Column(db.String(50))
    meeting_link     = db.Column(db.String(500))
    created_at       = db.Column(db.DateTime, server_default=db.func.now())
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status           = db.Column(db.String(50), default="Planned")
    date_start       = db.Column(db.String(30))
    date_end         = db.Column(db.String(30))
    time_start       = db.Column(db.String(10))
    time_end         = db.Column(db.String(10))
    duration         = db.Column(db.String(20), default="1h")
    description      = db.Column(db.Text)
    parent_type      = db.Column(db.String(50), default="Account")
    parent_name      = db.Column(db.String(200))
    assigned_user    = db.Column(db.String(100))
    assigned_user_id = db.Column(db.String(36))
    teams            = db.Column(db.String(200))

    attendees_users         = db.Column(db.Text, default="[]")
    attendees_contacts      = db.Column(db.Text, default="[]")
    attendees_leads         = db.Column(db.Text, default="[]")
    attendees_opportunities = db.Column(db.Text, default="[]")

    @staticmethod
    def _parse_ids(value):
        """Parse stored JSON string back to list of string IDs"""
        if not value:
            return []
        if isinstance(value, list):
            return [str(v) for v in value]
        if isinstance(value, str) and value.startswith("{") and value.endswith("}"):
            value = value.strip("{}")
            return [v.strip() for v in value.split(",") if v.strip()]
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(v) for v in parsed]
        except Exception:
            pass
        return [v.strip() for v in value.split(",") if v.strip()]

    @staticmethod
    def _dump_ids(value):
        """Accept list of ints, strings, or {id, name} dicts from frontend"""
        if not value:
            return "[]"
        ids = []
        for v in value:
            if isinstance(v, dict):
                raw_id = v.get("id")
            else:
                raw_id = v
            if raw_id is not None:
                ids.append(str(raw_id))
        return json.dumps(ids)

    def set_attendees_users(self, ids):
        self.attendees_users = self._dump_ids(ids)

    def set_attendees_contacts(self, ids):
        self.attendees_contacts = self._dump_ids(ids)

    def set_attendees_leads(self, ids):
        self.attendees_leads = self._dump_ids(ids)

    def set_attendees_opportunities(self, ids):
        self.attendees_opportunities = self._dump_ids(ids)

    def get_attendees_users(self):
        return self._parse_ids(self.attendees_users)

    def get_attendees_contacts(self):
        return self._parse_ids(self.attendees_contacts)

    def get_attendees_leads(self):
        return self._parse_ids(self.attendees_leads)

    def get_attendees_opportunities(self):
        return self._parse_ids(self.attendees_opportunities)

    def to_dict(self):
        return {
            "id":               self.id,
            "user_id":          self.user_id,
            "title":            self.title,
            "name":             self.title,
            "client_name":      self.client_name,
            "platform":         self.platform,
            "meeting_link":     self.meeting_link,
            "status":           self.status or "Planned",
            "date_start":       self.date_start,
            "date_end":         self.date_end,
            "time_start":       self.time_start,
            "time_end":         self.time_end,
            "duration":         self.duration or "1h",
            "description":      self.description,
            "parent_type":      self.parent_type or "Account",
            "parent_name":      self.parent_name,
            "assigned_user":    self.assigned_user,
            "assigned_user_id": self.assigned_user_id,
            "teams":            self.teams,
            "meeting_time":     self.meeting_time.isoformat() if self.meeting_time else None,
            "attendees_users":         self.get_attendees_users(),
            "attendees_contacts":      self.get_attendees_contacts(),
            "attendees_leads":         self.get_attendees_leads(),
            "attendees_opportunities": self.get_attendees_opportunities(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }