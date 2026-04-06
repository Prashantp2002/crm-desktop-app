from extensions import db
class Email(db.Model):
    __tablename__ = "emails"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=False
    )

    receiver = db.Column(db.String(120))

    subject = db.Column(db.String(255))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )