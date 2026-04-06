from extensions import db
class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=False
    )

    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )