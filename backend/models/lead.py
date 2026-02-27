from extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime)

    assigned_to = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"))