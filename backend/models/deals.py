from extensions import db
class Deal(db.Model):
    __tablename__ = "deals"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=False
    )

    customer_id = db.Column(db.Integer)

    deal_value = db.Column(db.Float)

    status = db.Column(db.String(50))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )