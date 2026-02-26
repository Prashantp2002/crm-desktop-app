from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models.user import User
from flask_jwt_extended import create_access_token
from sqlalchemy import or_, func


auth_bp = Blueprint("auth", __name__)

# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if User.query.filter(
        (User.email == data["email"]) |
        (User.username == data["username"])
    ).first():
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(
        data["password"]
    ).decode("utf-8")

    new_user = User(
        fullname=data["fullname"],
        phone=data["phone"],
        email=data["email"],
        role=data["role"],
        username=data["username"],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    identifier = data.get("username").strip().lower()
    password = data.get("password")

    user = User.query.filter(
        or_(
            func.lower(User.username) == identifier,
            func.lower(User.email) == identifier
        )
    ).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role}
    )

    return jsonify({
        "token": access_token,
        "role": user.role,
        "username": user.username
    }), 200