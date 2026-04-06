from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.tasks import Task
from datetime import datetime

tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@tasks_bp.route("/tasks/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict()), 200


@tasks_bp.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data    = request.get_json()

    if not data.get("title"):
        return jsonify({"error": "Name is required"}), 400

    task = Task(
        user_id          = user_id,
        title            = data.get("title", "").strip(),
        status           = data.get("status", "Planned"),
        priority         = data.get("priority", "Normal"),
        date_start       = data.get("date_start", ""),
        date_end         = data.get("date_end", ""),
        time_start       = data.get("time_start", ""),
        time_end         = data.get("time_end", ""),
        description      = data.get("description", ""),
        parent_type      = data.get("parent_type", "Account"),
        parent_name      = data.get("parent_name", ""),
        assigned_user    = data.get("assigned_user", ""),
        assigned_user_id = data.get("assigned_user_id", ""),
        teams            = data.get("teams", ""),
        attachment       = data.get("attachment", ""),
        duration         = data.get("duration", ""),
    )

    # set due_date from date_end
    try:
        if data.get("date_end"):
            task.due_date = datetime.fromisoformat(data["date_end"])
    except Exception:
        pass

    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@tasks_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    for field in [
        "title", "status", "priority", "date_start", "date_end",
        "time_start", "time_end", "description", "parent_type",
        "parent_name", "assigned_user", "assigned_user_id",
        "teams", "attachment", "duration",
    ]:
        if field in data:
            setattr(task, field, data[field])

    try:
        if task.date_end:
            task.due_date = datetime.fromisoformat(task.date_end)
    except Exception:
        pass

    db.session.commit()
    return jsonify(task.to_dict()), 200


@tasks_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200