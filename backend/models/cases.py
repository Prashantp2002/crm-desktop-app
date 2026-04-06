from extensions import db
class Case(db.Model):
    __tablename__ = "cases"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(db.String(255))

    status = db.Column(db.String(50))

    priority = db.Column(db.String(50))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )