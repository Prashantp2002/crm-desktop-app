from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.contact import Contact
from models.account import Account

contacts_bp = Blueprint("contacts", __name__)


def _ensure_owner(contact, user_id):
    return contact and str(contact.user_id) == str(user_id)


@contacts_bp.route("/contacts", methods=["GET"])
@contacts_bp.route("/contacts/my", methods=["GET"])
@jwt_required()
def get_contacts():
    user_id = get_jwt_identity()
    contacts = Contact.query.filter(Contact.user_id == user_id).order_by(Contact.created_at.desc()).all()
    return jsonify([c.to_dict() for c in contacts]), 200


@contacts_bp.route("/contacts", methods=["POST"])
@jwt_required()
def create_contact():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("full_name"):
        return jsonify({"error": "Full name is required"}), 400

    account_id = data.get("account_id")
    if not account_id and data.get("account_name"):
        acc = Account.query.filter_by(name=data["account_name"]).first()
        if acc:
            account_id = acc.id

    contact = Contact(
        user_id         = user_id,
        full_name       = data.get("full_name", "").strip(),
        email           = data.get("email", "").strip(),
        dob             = data.get("dob", "").strip(),
        phone           = data.get("phone", "").strip(),
        address_city    = data.get("address_city", "").strip(),
        address_state   = data.get("address_state", "").strip(),
        address_postal  = data.get("address_postal", "").strip(),
        address_country = data.get("address_country", "").strip(),
        account_id      = account_id,
        assigned_to     = data.get("assigned_to", "").strip(),
        team            = data.get("team", "").strip(),
        description     = data.get("description", "").strip(),
        photo_url       = data.get("photo_url", "").strip(),
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201


@contacts_bp.route("/contacts/<int:contact_id>", methods=["PUT"])
@jwt_required()
def update_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.get_or_404(contact_id)
    if not _ensure_owner(contact, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    data    = request.get_json()
    for field in [
        "full_name", "email", "dob", "phone",
        "address_city", "address_state", "address_postal", "address_country",
        "account_id", "assigned_to", "team", "description", "photo_url"
    ]:
        if field in data:
            setattr(contact, field, data[field])
    db.session.commit()
    return jsonify(contact.to_dict()), 200


@contacts_bp.route("/contacts/<int:contact_id>", methods=["DELETE"])
@jwt_required()
def delete_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.get_or_404(contact_id)
    if not _ensure_owner(contact, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted"}), 200