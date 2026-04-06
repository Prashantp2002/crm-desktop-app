from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db, bcrypt
from models.user import User
from sqlalchemy import or_

users_bp = Blueprint("users", __name__)


@users_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    users = User.query.order_by(User.fullname).all()
    return jsonify([{
        "id":         u.id,
        "fullname":   u.fullname,
        "username":   u.username,
        "email":      u.email,
        "role":       u.role,
        "phone":      u.phone,
        "is_active":  True,
        "created_at": str(u.created_at),
    } for u in users]), 200


@users_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id":         user.id,
        "fullname":   user.fullname,
        "username":   user.username,
        "email":      user.email,
        "role":       user.role,
        "phone":      user.phone,
        "is_active":  True,
        "created_at": str(user.created_at),
    }), 200


@users_bp.route("/users", methods=["POST"])
@jwt_required()
def create_user():
    data = request.get_json()

    if not data.get("username") or not data.get("fullname"):
        return jsonify({"error": "Username and full name are required"}), 400

    if User.query.filter(
        or_(User.email    == data.get("email"),
            User.username == data.get("username"))
    ).first():
        return jsonify({"error": "Username or email already exists"}), 400

    hashed = bcrypt.generate_password_hash(
        data.get("password", "changeme123")
    ).decode("utf-8")

    user = User(
        fullname = data.get("fullname", "").strip(),
        username = data.get("username", "").strip(),
        email    = data.get("email", "").strip(),
        phone    = data.get("phone", "").strip(),
        role     = data.get("role", "employee"),
        password = hashed,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "id":       user.id,
        "fullname": user.fullname,
        "username": user.username,
        "email":    user.email,
        "role":     user.role,
        "phone":    user.phone,
    }), 201


@users_bp.route("/users/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    for field in ["fullname", "username", "email", "phone", "role"]:
        if field in data:
            setattr(user, field, data[field])

    if data.get("password"):
        user.password = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "User updated"}), 200


@users_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200