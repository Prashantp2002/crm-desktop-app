from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.opportunity import Opportunity

opportunities_bp = Blueprint("opportunities", __name__)


def _ensure_owner(opp, user_id):
    return opp and str(opp.user_id) == str(user_id)


@opportunities_bp.route("/opportunities", methods=["GET"])
@opportunities_bp.route("/opportunities/my", methods=["GET"])
@jwt_required()
def get_opportunities():
    user_id = get_jwt_identity()
    opps = Opportunity.query.filter(Opportunity.user_id == user_id).order_by(Opportunity.created_at.desc()).all()
    return jsonify([o.to_dict() for o in opps]), 200


@opportunities_bp.route("/opportunities", methods=["POST"])
@jwt_required()
def create_opportunity():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    opp = Opportunity(
        user_id        = user_id,
        name           = data.get("name", "").strip(),
        account_name   = data.get("account_name", "").strip(),
        stage          = data.get("stage", "Prospecting").strip(),
        amount         = data.get("amount", "").strip(),
        probability    = data.get("probability", "").strip(),
        close_date     = data.get("close_date", "").strip(),
        contacts       = data.get("contacts", "").strip(),
        lead_source    = data.get("lead_source", "").strip(),
        assigned_user  = data.get("assigned_user", "").strip(),
        team           = data.get("team", "").strip(),
        email          = data.get("email", "").strip(),
        phone          = data.get("phone", "").strip(),
        address_country= data.get("address_country", "").strip(),
        description    = data.get("description", "").strip(),
    )
    db.session.add(opp)
    db.session.commit()
    return jsonify(opp.to_dict()), 201


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["PUT"])
@jwt_required()
def update_opportunity(opp_id):
    user_id = get_jwt_identity()
    opp  = Opportunity.query.get_or_404(opp_id)
    if not _ensure_owner(opp, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    for field in [
        "name", "account_name", "stage", "amount", "probability",
        "close_date", "contacts", "lead_source", "assigned_user",
        "team", "email", "phone", "address_country", "description",
    ]:
        if field in data:
            setattr(opp, field, data[field])
    db.session.commit()
    return jsonify(opp.to_dict()), 200


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["DELETE"])
@jwt_required()
def delete_opportunity(opp_id):
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(opp_id)
    if not _ensure_owner(opp, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(opp)
    db.session.commit()
    return jsonify({"message": "Opportunity deleted"}), 200