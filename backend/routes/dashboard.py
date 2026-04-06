from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.customers import Customer
from models.call import Call
from models.deals import Deal
from models.emails import Email
from models.tasks import Task
from models.cases import Case
from models.meetings import Meeting

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard")
@jwt_required()
def dashboard():

    user_id = get_jwt_identity()
    print("NEW DASHBOARD ROUTE RUNNING")

    # GLOBAL STATS
    members = User.query.count()
    total_customers = Customer.query.count()
    active_now = Call.query.filter(Call.user_id == user_id).count()

    # USER COUNTS (user-scoped)
    calls = Call.query.filter(Call.user_id == user_id).count()
    emails = Email.query.filter(Email.user_id == user_id).count() if hasattr(Email, 'user_id') else 0
    deals = Deal.query.filter(Deal.user_id == user_id).count() if hasattr(Deal, 'user_id') else 0
    customers = Customer.query.filter(Customer.user_id == user_id).count() if hasattr(Customer, 'user_id') else 0
    pending_tasks = Task.query.filter(Task.user_id == user_id, Task.status=="Pending").count()
    cases_count = Case.query.filter(Case.user_id == user_id).count() if hasattr(Case, 'user_id') else 0
    meetings_count = Meeting.query.filter(Meeting.user_id == user_id).count()

    # TASK LIST
    tasks = Task.query.filter(Task.user_id == user_id).limit(5).all()
    tasks_list = [
        {
            "id": t.id,
            "title": t.title,
            "date": t.created_at.strftime("%d %b %Y") if t.created_at else "",
            "urgent": False
        }
        for t in tasks
    ]

    # CASE LIST
    cases = Case.query.filter(Case.user_id == user_id).limit(5).all() if hasattr(Case, 'user_id') else []
    cases_list = [
        {
            "id": c.id,
            "title": c.title,
            "status": c.status,
            "priority": c.priority
        }
        for c in cases
    ]

    # MEETINGS LIST
    meetings = Meeting.query.filter(Meeting.user_id == user_id).limit(5).all()
    meetings_list = [
        {
            "time":     m.meeting_time.strftime("%H:%M") if m.meeting_time else m.time_start or "",
            "date":     m.meeting_time.strftime("%b %d") if m.meeting_time else m.date_start or "",
            "title":    m.title or "",
            "details":  f"Meeting with {m.client_name or ''}",
            "platform": m.platform or "",
            "person":   m.client_name or "",
            "active":   True if i == 0 else False
        }
        for i, m in enumerate(meetings)
    ]

    return jsonify({
        "global": {
            "members": members,
            "total_customers": total_customers,
            "active_now": active_now
        },
        "user": {
            "calls": calls,
            "emails": emails,
            "deals": deals,
            "customers": customers,
            "pending_tasks": pending_tasks,
            "cases_count": cases_count,
            "meetings_count": meetings_count,
            "tasks_list": tasks_list,
            "cases_list": cases_list,
            "meetings_list": meetings_list
        }
    })