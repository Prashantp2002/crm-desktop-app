from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.call import Call

calls_bp = Blueprint("calls", __name__)


def _ensure_owner(call, user_id):
    return call and str(call.user_id) == str(user_id)


@calls_bp.route("/calls", methods=["GET"])
@calls_bp.route("/calls/my", methods=["GET"])
@jwt_required()
def get_calls():
    user_id = get_jwt_identity()
    calls = Call.query.filter(Call.user_id == user_id).order_by(Call.created_at.desc()).all()
    return jsonify([c.to_dict() for c in calls]), 200


@calls_bp.route("/calls/<call_id>", methods=["GET"])
@jwt_required()
def get_call(call_id):
    user_id = get_jwt_identity()
    call = Call.query.get_or_404(call_id)
    if not _ensure_owner(call, user_id):
        return jsonify({"error": "Not found"}), 404
    return jsonify(call.to_dict()), 200


@calls_bp.route("/calls", methods=["POST"])
@jwt_required()
def create_call():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    call = Call(
        user_id            = user_id,
        name               = data.get("name", "").strip(),
        status             = data.get("status", "Planned"),
        direction          = data.get("direction", "Outbound"),
        date_start         = data.get("date_start", ""),
        date_end           = data.get("date_end", ""),
        time_start         = data.get("time_start", ""),
        time_end           = data.get("time_end", ""),
        duration           = data.get("duration", "5m"),
        description        = data.get("description", ""),
        parent_type        = data.get("parent_type", "Account"),
        parent_name        = data.get("parent_name", ""),
        assigned_user      = data.get("assigned_user", ""),
        teams              = data.get("teams", ""),
        attendees_users    = data.get("attendees_users", ""),
        attendees_contacts = data.get("attendees_contacts", ""),
        attendees_leads    = data.get("attendees_leads", ""),
    )
    db.session.add(call)
    db.session.commit()
    return jsonify(call.to_dict()), 201


@calls_bp.route("/calls/<call_id>", methods=["PUT"])
@jwt_required()
def update_call(call_id):
    user_id = get_jwt_identity()
    call = Call.query.get_or_404(call_id)
    if not _ensure_owner(call, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    for field in [
        "name", "status", "direction", "date_start", "date_end",
        "time_start", "time_end", "duration", "description",
        "parent_type", "parent_name", "assigned_user", "teams",
        "attendees_users", "attendees_contacts", "attendees_leads",
    ]:
        if field in data:
            setattr(call, field, data[field])
    db.session.commit()
    return jsonify(call.to_dict()), 200


@calls_bp.route("/calls/<call_id>", methods=["DELETE"])
@jwt_required()
def delete_call(call_id):
    user_id = get_jwt_identity()
    call = Call.query.get_or_404(call_id)
    if not _ensure_owner(call, user_id):
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(call)
    db.session.commit()
    return jsonify({"message": "Call deleted"}), 200