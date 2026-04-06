from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.lead import Lead

leads_bp = Blueprint("leads", __name__)


def _ensure_owner(lead, user_id):
    return lead and str(lead.user_id) == str(user_id)


@leads_bp.route("/leads", methods=["GET"])
@leads_bp.route("/leads/my", methods=["GET"])
@jwt_required()
def get_leads():
    user_id = get_jwt_identity()
    leads = Lead.query.filter(Lead.user_id == user_id).order_by(Lead.created_at.desc()).all()
    return jsonify([l.to_dict() for l in leads]), 200


@leads_bp.route("/leads", methods=["POST"])
@jwt_required()
def create_lead():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("first_name"):
        return jsonify({"error": "First name is required"}), 400

    lead = Lead(
        user_id            = user_id,
        salutation         = data.get("salutation", "").strip(),
        first_name         = data.get("first_name", "").strip(),
        last_name          = data.get("last_name", "").strip(),
        account_name       = data.get("account_name", "").strip(),
        email              = data.get("email", "").strip(),
        phone              = data.get("phone", "").strip(),
        phone_type         = data.get("phone_type", "Mobile").strip(),
        website            = data.get("website", "").strip(),
        address_street     = data.get("address_street", "").strip(),
        address_city       = data.get("address_city", "").strip(),
        address_state      = data.get("address_state", "").strip(),
        address_postal     = data.get("address_postal", "").strip(),
        address_country    = data.get("address_country", "").strip(),
        industry           = data.get("industry", "").strip(),
        status             = data.get("status", "New").strip(),
        opportunity_amount = data.get("opportunity_amount", "").strip(),
        source             = data.get("source", "").strip(),
        campaign           = data.get("campaign", "").strip(),
        assigned_user      = data.get("assigned_user", "").strip(),
        team               = data.get("team", "").strip(),
        title              = data.get("title", "").strip(),
        description        = data.get("description", "").strip(),
    )
    db.session.add(lead)
    db.session.commit()
    return jsonify(lead.to_dict()), 201


@leads_bp.route("/leads/<int:lead_id>", methods=["PUT"])
@jwt_required()
def update_lead(lead_id):
    user_id = get_jwt_identity()
    lead = Lead.query.get_or_404(lead_id)
    if not _ensure_owner(lead, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    for field in [
        "salutation", "first_name", "last_name", "account_name",
        "email", "phone", "phone_type", "website",
        "address_street", "address_city", "address_state",
        "address_postal", "address_country", "industry",
        "status", "opportunity_amount", "source", "campaign",
        "assigned_user", "team", "title", "description",
    ]:
        if field in data:
            setattr(lead, field, data[field])
    db.session.commit()
    return jsonify(lead.to_dict()), 200


@leads_bp.route("/leads/<int:lead_id>", methods=["DELETE"])
@jwt_required()
def delete_lead(lead_id):
    user_id = get_jwt_identity()
    lead = Lead.query.get_or_404(lead_id)
    if not _ensure_owner(lead, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(lead)
    db.session.commit()
    return jsonify({"message": "Lead deleted"}), 200