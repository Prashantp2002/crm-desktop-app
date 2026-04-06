from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.meetings import Meeting
from models.tasks import Task
from models.call import Call

calendar_bp = Blueprint("calendar", __name__)


def _user_is_attendee(meeting, user_id):
    import json
    try:
        ids = json.loads(meeting.attendees_users or "[]")
        return str(user_id) in [str(i) for i in ids]
    except Exception:
        return False


def _can_access_meeting(meeting, user_id):
    return (
        str(meeting.user_id) == str(user_id)
        or str(meeting.assigned_user_id) == str(user_id)
        or _user_is_attendee(meeting, user_id)
    )


@calendar_bp.route("/calendar/events", methods=["GET"])
@jwt_required()
def get_calendar_events():
    user_id = get_jwt_identity()
    events = []

    # ── Meetings ──
    meetings = Meeting.query.order_by(Meeting.date_start.asc()).all()
    for m in meetings:
        if not _can_access_meeting(m, user_id):
            continue
        if not m.meeting_time:
            continue
        events.append({
            "id": f"meeting-{m.id}",
            "type": "meeting",
            "title": m.title or "Meeting",
            "start": m.meeting_time.isoformat(),
            "end": None,
            "color": "#3b82f6",
            "bg": "#dbeafe",
            "all_day": False,
            "client": m.client_name,
            "platform": m.platform,
        })

    # ── Calls ──
    calls = Call.query.filter(Call.user_id == user_id).all()
    for c in calls:
        if not c.date_start:
            continue

        try:
            start_str = f"{c.date_start}T{c.time_start or '00:00'}:00"
            end_str = f"{c.date_end}T{c.time_end or '00:00'}:00" if c.date_end else None
        except Exception:
            continue

        events.append({
            "id": f"call-{c.id}",
            "type": "call",
            "title": c.name or "Call",
            "start": start_str,
            "end": end_str,
            "color": "#f97316",
            "bg": "#ffedd5",
            "all_day": False,
        })

    # ── Tasks ──
    tasks = Task.query.filter(Task.user_id == user_id).all()
    for t in tasks:
        if not t.due_date:
            continue

        events.append({
            "id": f"task-{t.id}",
            "type": "task",
            "title": t.title or "Task",
            "start": t.due_date.isoformat(),
            "end": None,
            "color": "#10b981",
            "bg": "#d1fae5",
            "all_day": True,
        })

    return jsonify(events), 200