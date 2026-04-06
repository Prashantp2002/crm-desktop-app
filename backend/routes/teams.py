from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.team import Team
from models.user import User

teams_bp = Blueprint("teams", __name__)


@teams_bp.route("/teams", methods=["GET"])
@jwt_required()
def get_teams():
    teams = Team.query.order_by(Team.name).all()
    return jsonify([t.to_dict() for t in teams]), 200


@teams_bp.route("/teams/<team_id>", methods=["GET"])
@jwt_required()
def get_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = team.to_dict()
    # attach users that belong to this team name
    users = User.query.filter(
        User.role != None
    ).all()
    data["users"] = [{
        "id":       u.id,
        "fullname": u.fullname,
        "username": u.username,
        "role":     u.role,
        "email":    u.email,
    } for u in users]
    return jsonify(data), 200


@teams_bp.route("/teams", methods=["POST"])
@jwt_required()
def create_team():
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    team = Team(
        name                  = data.get("name", "").strip(),
        roles                 = data.get("roles", "").strip(),
        position_list         = data.get("position_list", "").strip(),
        layout_set            = data.get("layout_set", "").strip(),
        working_time_calendar = data.get("working_time_calendar", "").strip(),
        description           = data.get("description", "").strip(),
    )
    db.session.add(team)
    db.session.commit()
    return jsonify(team.to_dict()), 201


@teams_bp.route("/teams/<team_id>", methods=["PUT"])
@jwt_required()
def update_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = request.get_json()
    for field in ["name", "roles", "position_list", "layout_set",
                  "working_time_calendar", "description"]:
        if field in data:
            setattr(team, field, data[field])
    db.session.commit()
    return jsonify(team.to_dict()), 200


@teams_bp.route("/teams/<team_id>", methods=["DELETE"])
@jwt_required()
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({"message": "Team deleted"}), 200