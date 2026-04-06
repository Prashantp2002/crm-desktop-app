from pathlib import Path

# Accounts
Path('backend/routes/accounts.py').write_text('''from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.account import Account

accounts_bp = Blueprint("accounts", __name__)


def _ensure_owner(account, user_id):
    return account and str(account.user_id) == str(user_id)


@accounts_bp.route("/accounts", methods=["GET"])
@accounts_bp.route("/accounts/my", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter(Account.user_id == user_id).order_by(Account.created_at.desc()).all()
    return jsonify([a.to_dict() for a in accounts]), 200


@accounts_bp.route("/accounts", methods=["POST"])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "Account name is required"}), 400

    account = Account(
        user_id          = user_id,
        name             = data.get("name", "").strip(),
        website          = data.get("website", "").strip(),
        industry         = data.get("industry", "").strip(),
        email            = data.get("email", "").strip(),
        phone            = data.get("phone", "").strip(),
        type             = data.get("type", "Customer"),
        billing_street   = data.get("billing_street", "").strip(),
        billing_city     = data.get("billing_city", "").strip(),
        billing_state    = data.get("billing_state", "").strip(),
        billing_postal   = data.get("billing_postal", "").strip(),
        billing_country  = data.get("billing_country", "").strip(),
        shipping_street  = data.get("shipping_street", "").strip(),
        shipping_city    = data.get("shipping_city", "").strip(),
        shipping_state   = data.get("shipping_state", "").strip(),
        shipping_postal  = data.get("shipping_postal", "").strip(),
        shipping_country = data.get("shipping_country", "").strip(),
        assigned_user    = data.get("assigned_user", "").strip(),
        description      = data.get("description", "").strip(),
    )
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201


@accounts_bp.route("/accounts/<int:account_id>", methods=["PUT"])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.get_or_404(account_id)
    if not _ensure_owner(account, user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    for field in [
        "name", "website", "industry", "email", "phone", "type",
        "billing_street", "billing_city", "billing_state", "billing_postal", "billing_country",
        "shipping_street", "shipping_city", "shipping_state", "shipping_postal", "shipping_country",
        "assigned_user", "description",
    ]:
        if field in data:
            setattr(account, field, data[field])

    db.session.commit()
    return jsonify(account.to_dict()), 200


@accounts_bp.route("/accounts/<int:account_id>", methods=["DELETE"])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.get_or_404(account_id)
    if not _ensure_owner(account, user_id):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(account)
    db.session.commit()
    return jsonify({"message": "Account deleted"}), 200
''')

# Contacts
Path('backend/routes/contacts.py').write_text('''from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.contact import Contact
from models.account import Account

contacts_bp = Blueprint("contacts", __name__)


def _ensure_owner(contact, user_id):
    return contact and str(contact.user_id) == str(user_id)


@contacts_bp.route("/contacts", methods=["GET"])
@contacts_bp.route("/contacts/my", methods=["GET"])
@jwt_required()
def get_contacts():
    user_id = get_jwt_identity()
    contacts = Contact.query.filter(Contact.user_id == user_id).order_by(Contact.created_at.desc()).all()
    return jsonify([c.to_dict() for c in contacts]), 200


@contacts_bp.route("/contacts", methods=["POST"])
@jwt_required()
def create_contact():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get("full_name"):
        return jsonify({"error": "Full name is required"}), 400

    account_id = data.get("account_id")
    if not account_id and data.get("account_name"):
        acc = Account.query.filter_by(name=data["account_name"]).first()
        if acc:
            account_id = acc.id

    contact = Contact(
        user_id         = user_id,
        full_name       = data.get("full_name", "").strip(),
        email           = data.get("email", "").strip(),
        dob             = data.get("dob", "").strip(),
        phone           = data.get("phone", "").strip(),
        address_city    = data.get("address_city", "").strip(),
        address_state   = data.get("address_state", "").strip(),
        address_postal  = data.get("address_postal", "").strip(),
        address_country = data.get("address_country", "").strip(),
        account_id      = account_id,
        assigned_to     = data.get("assigned_to", "").strip(),
        team            = data.get("team", "").strip(),
        description     = data.get("description", "").strip(),
        photo_url       = data.get("photo_url", "").strip(),
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201


@contacts_bp.route("/contacts/<int:contact_id>", methods=["PUT"])
@jwt_required()
def update_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.get_or_404(contact_id)
    if not _ensure_owner(contact, user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    for field in [
        "full_name", "email", "dob", "phone",
        "address_city", "address_state", "address_postal", "address_country",
        "account_id", "assigned_to", "team", "description", "photo_url"
    ]:
        if field in data:
            setattr(contact, field, data[field])
    db.session.commit()
    return jsonify(contact.to_dict()), 200


@contacts_bp.route("/contacts/<int:contact_id>", methods=["DELETE"])
@jwt_required()
def delete_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.get_or_404(contact_id)
    if not _ensure_owner(contact, user_id):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted"}), 200
''')

# Leads
Path('backend/routes/leads.py').write_text('''from flask import Blueprint, request, jsonify
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
''')

# Opportunities
Path('backend/routes/opportunities.py').write_text('''from flask import Blueprint, request, jsonify
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
        user_id         = user_id,
        name            = data.get("name", "").strip(),
        account_name    = data.get("account_name", "").strip(),
        stage           = data.get("stage", "Prospecting").strip(),
        amount          = data.get("amount", "").strip(),
        probability     = data.get("probability", "").strip(),
        close_date      = data.get("close_date", "").strip(),
        contacts        = data.get("contacts", "").strip(),
        lead_source     = data.get("lead_source", "").strip(),
        assigned_user   = data.get("assigned_user", "").strip(),
        team            = data.get("team", "").strip(),
        email           = data.get("email", "").strip(),
        phone           = data.get("phone", "").strip(),
        address_country = data.get("address_country", "").strip(),
        description     = data.get("description", "").strip(),
    )
    db.session.add(opp)
    db.session.commit()
    return jsonify(opp.to_dict()), 201


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["PUT"])
@jwt_required()
def update_opportunity(opp_id):
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(opp_id)
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
''')

# Calls
Path('backend/routes/calls.py').write_text('''from flask import Blueprint, request, jsonify
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
''')

# Tasks
Path('backend/routes/tasks.py').write_text('''from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.tasks import Task
from datetime import datetime

tasks_bp = Blueprint("tasks", __name__)


def _ensure_owner(task, user_id):
    return task and str(task.user_id) == str(user_id)


@tasks_bp.route("/tasks", methods=["GET"])
@tasks_bp.route("/tasks/my", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter(Task.user_id == user_id).all()

    result = [
        {
            "id": task.id,
            "title": task.title,
            "priority": getattr(task, "priority", "low"),
            "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            "user_id": task.user_id
        }
        for task in tasks
    ]

    return jsonify(result), 200


@tasks_bp.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get("title")
    due_date = data.get("due_date")

    if not title or not due_date:
        return jsonify({"error": "Missing fields"}), 400

    new_task = Task(
        user_id=user_id,
        title=title,
        status="Pending",
        due_date=datetime.strptime(due_date, "%Y-%m-%d")
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({"message": "Task created successfully"}), 201
''')

# Calendar
Path('backend/routes/calendar.py').write_text('''from flask import Blueprint, jsonify
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
''')

# Dashboard
Path('backend/routes/dashboard.py').write_text('''from flask import Blueprint, jsonify
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

    meetings = Meeting.query.filter(Meeting.user_id == user_id).limit(5).all()
    meetings_list = [
        {
            "time": m.meeting_time.strftime("%H:%M") if m.meeting_time else m.time_start or "",
            "date": m.meeting_time.strftime("%b %d") if m.meeting_time else m.date_start or "",
            "title": m.title or "",
            "details": f"Meeting with {m.client_name or ''}",
            "platform": m.platform or "",
            "person": m.client_name or "",
            "active": True if i == 0 else False
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
''')

print('routes patch complete')
