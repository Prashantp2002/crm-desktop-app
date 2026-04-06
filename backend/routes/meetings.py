from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.meetings import Meeting
from models.user import User
from models.contact import Contact
from models.lead import Lead
from datetime import datetime
import json

meetings_bp = Blueprint("meetings", __name__)


def _resolve(ids_raw, model, name_fields):
    """Resolve list of IDs to [{id, name}] objects — supports both int and UUID string IDs"""
    if not ids_raw:
        return []

    # Normalize to list of strings
    if isinstance(ids_raw, list):
        ids = [str(v) for v in ids_raw if v is not None]
    elif isinstance(ids_raw, str):
        raw = ids_raw.strip()
        if raw.startswith("{") and raw.endswith("}"):
            raw = raw.strip("{}")
            ids = [v.strip() for v in raw.split(",") if v.strip()]
        else:
            try:
                parsed = json.loads(raw)
                ids = [str(v) for v in parsed] if isinstance(parsed, list) else []
            except Exception:
                ids = [v.strip() for v in raw.split(",") if v.strip()]
    else:
        ids = []

    if not ids:
        return []

    # Try int query first (for integer PKs), fall back to string (for UUIDs)
    try:
        int_ids = [int(i) for i in ids]
        rows = model.query.filter(model.id.in_(int_ids)).all()
    except (ValueError, TypeError):
        rows = model.query.filter(model.id.in_(ids)).all()

    result = []
    for row in rows:
        display = None
        for field in name_fields:
            display = getattr(row, field, None)
            if display:
                break
        result.append({"id": str(row.id), "name": display or f"#{row.id}"})
    return result


def _enrich(meeting):
    """Add resolved attendee names to meeting dict"""
    data = meeting.to_dict()
    data["attendees_users"] = _resolve(
        data.get("attendees_users"), User,
        ["fullname", "full_name", "username", "name"],
    )
    data["attendees_contacts"] = _resolve(
        data.get("attendees_contacts"), Contact,
        ["full_name", "fullname", "name", "first_name"],
    )
    data["attendees_leads"] = _resolve(
        data.get("attendees_leads"), Lead,
        ["full_name", "fullname", "name", "first_name"],
    )
    return data


def _user_is_attendee(meeting, user_id):
    """Check if user_id exists in attendees_users — supports both int and UUID"""
    try:
        ids = json.loads(meeting.attendees_users or "[]")
        return str(user_id) in [str(i) for i in ids]
    except Exception:
        return False


def _can_access_meeting(meeting, user_id):
    """Meeting is visible if user is creator, assigned user, or attendee."""
    if not meeting:
        return False
    if str(meeting.user_id) == str(user_id):
        return True
    if meeting.assigned_user_id and str(meeting.assigned_user_id) == str(user_id):
        return True
    if _user_is_attendee(meeting, user_id):
        return True
    return False


# ── ALL meetings (meetings list page) ──
@meetings_bp.route("/meetings", methods=["GET"])
@jwt_required()
def get_meetings():
    try:
        user_id = get_jwt_identity()
        all_meetings = Meeting.query.order_by(Meeting.created_at.desc()).all()

        my = []
        for m in all_meetings:
            if _can_access_meeting(m, user_id):
                my.append(_enrich(m))

        return jsonify(my), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── MY meetings — Dashboard sidebar & Calendar ──
# ⚠️ MUST be before /meetings/<int:meeting_id>
@meetings_bp.route("/meetings/my", methods=["GET"])
@jwt_required()
def get_my_meetings():
    return get_meetings()


@meetings_bp.route("/meetings/<int:meeting_id>", methods=["GET"])
@jwt_required()
def get_meeting(meeting_id):
    user_id = get_jwt_identity()
    m = Meeting.query.get_or_404(meeting_id)
    if not _can_access_meeting(m, user_id):
        return jsonify({"error": "Meeting not found"}), 404
    return jsonify(_enrich(m)), 200


@meetings_bp.route("/meetings", methods=["POST"])
@jwt_required()
def create_meeting():
    try:
        user_id = get_jwt_identity()
        data    = request.get_json()

        # ── DEBUG: remove after confirming it works ──
        print("=== ATTENDEES DEBUG ===")
        print("attendees_users:",         data.get("attendees_users"))
        print("attendees_contacts:",      data.get("attendees_contacts"))
        print("attendees_leads:",         data.get("attendees_leads"))
        print("attendees_opportunities:", data.get("attendees_opportunities"))
        print("======================")

        if not data.get("title"):
            return jsonify({"error": "Name is required"}), 400

        m = Meeting(
            user_id          = user_id,
            title            = data.get("title", "").strip(),
            client_name      = data.get("client_name", "").strip(),
            platform         = data.get("platform", "").strip(),
            meeting_link     = data.get("meeting_link", "").strip(),
            status           = data.get("status", "Planned"),
            date_start       = data.get("date_start", ""),
            date_end         = data.get("date_end", ""),
            time_start       = data.get("time_start", ""),
            time_end         = data.get("time_end", ""),
            duration         = data.get("duration", "1h"),
            description      = data.get("description", ""),
            parent_type      = data.get("parent_type", "Account"),
            parent_name      = data.get("parent_name", ""),
            assigned_user    = data.get("assigned_user", ""),
            assigned_user_id = data.get("assigned_user_id", ""),
            teams            = data.get("teams", ""),
        )

        # These now handle {id, name} dicts, plain IDs, and UUID strings
        m.set_attendees_users(data.get("attendees_users", []))
        m.set_attendees_contacts(data.get("attendees_contacts", []))
        m.set_attendees_leads(data.get("attendees_leads", []))
        m.set_attendees_opportunities(data.get("attendees_opportunities", []))

        try:
            if data.get("date_start") and data.get("time_start"):
                m.meeting_time = datetime.fromisoformat(
                    data["date_start"] + "T" + data["time_start"]
                )
        except Exception:
            pass

        db.session.add(m)
        db.session.commit()
        return jsonify(_enrich(m)), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@meetings_bp.route("/meetings/<int:meeting_id>", methods=["PUT"])
@jwt_required()
def update_meeting(meeting_id):
    try:
        user_id = get_jwt_identity()
        m = Meeting.query.get_or_404(meeting_id)
        if str(m.user_id) != str(user_id):
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        for field in [
            "title", "client_name", "platform", "meeting_link",
            "status", "date_start", "date_end", "time_start", "time_end",
            "duration", "description", "parent_type", "parent_name",
            "assigned_user", "assigned_user_id", "teams",
        ]:
            if field in data:
                setattr(m, field, data[field])

        if "attendees_users"         in data: m.set_attendees_users(data["attendees_users"])
        if "attendees_contacts"      in data: m.set_attendees_contacts(data["attendees_contacts"])
        if "attendees_leads"         in data: m.set_attendees_leads(data["attendees_leads"])
        if "attendees_opportunities" in data: m.set_attendees_opportunities(data["attendees_opportunities"])

        try:
            if m.date_start and m.time_start:
                m.meeting_time = datetime.fromisoformat(
                    m.date_start + "T" + m.time_start
                )
        except Exception:
            pass

        db.session.commit()
        return jsonify(_enrich(m)), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@meetings_bp.route("/meetings/<int:meeting_id>", methods=["DELETE"])
@jwt_required()
def delete_meeting(meeting_id):
    try:
        user_id = get_jwt_identity()
        m = Meeting.query.get_or_404(meeting_id)
        if str(m.user_id) != str(user_id):
            return jsonify({"error": "Unauthorized"}), 403
        db.session.delete(m)
        db.session.commit()
        return jsonify({"message": "Meeting deleted"}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500