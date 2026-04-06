from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.account import Account

accounts_bp = Blueprint("accounts", __name__)


def _ensure_owner(account, user_id):
    return account and str(account.user_id) == str(user_id)


@accounts_bp.route("/accounts", methods=["GET"])
@accounts_bp.route("/accounts/my", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter(Account.user_id == user_id).order_by(Account.created_at.desc()).all()
    return jsonify([a.to_dict() for a in accounts]), 200


@accounts_bp.route("/accounts", methods=["POST"])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("name"):
        return jsonify({"error": "Account name is required"}), 400

    account = Account(
        user_id          = user_id,
        name             = data.get("name", "").strip(),
        website          = data.get("website", "").strip(),
        industry         = data.get("industry", "").strip(),
        email            = data.get("email", "").strip(),
        phone            = data.get("phone", "").strip(),
        type             = data.get("type", "Customer"),
        billing_street   = data.get("billing_street", "").strip(),
        billing_city     = data.get("billing_city", "").strip(),
        billing_state    = data.get("billing_state", "").strip(),
        billing_postal   = data.get("billing_postal", "").strip(),
        billing_country  = data.get("billing_country", "").strip(),
        shipping_street  = data.get("shipping_street", "").strip(),
        shipping_city    = data.get("shipping_city", "").strip(),
        shipping_state   = data.get("shipping_state", "").strip(),
        shipping_postal  = data.get("shipping_postal", "").strip(),
        shipping_country = data.get("shipping_country", "").strip(),
        assigned_user    = data.get("assigned_user", "").strip(),
        description      = data.get("description", "").strip(),
    )

    db.session.add(account)
    db.session.commit()

    return jsonify(account.to_dict()), 201


# PUT update account
@accounts_bp.route("/accounts/<int:account_id>", methods=["PUT"])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.get_or_404(account_id)
    if not _ensure_owner(account, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    data    = request.get_json()

    for field in [
        "name", "website", "industry", "email", "phone", "type",
        "billing_street", "billing_city", "billing_state", "billing_postal", "billing_country",
        "shipping_street", "shipping_city", "shipping_state", "shipping_postal", "shipping_country",
        "assigned_user", "description",
    ]:
        if field in data:
            setattr(account, field, data[field])

    db.session.commit()
    return jsonify(account.to_dict()), 200


# DELETE account
@accounts_bp.route("/accounts/<int:account_id>", methods=["DELETE"])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.get_or_404(account_id)
    if not _ensure_owner(account, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(account)
    db.session.commit()
    return jsonify({"message": "Account deleted"}), 200