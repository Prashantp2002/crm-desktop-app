from extensions import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    status = db.Column(db.String(50), default="New")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))