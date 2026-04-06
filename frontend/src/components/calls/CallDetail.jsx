import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCall, deleteCall } from "../../api/calls";

const STATUS_META = {
  "Planned":  { color: "#0369a1", bg: "#e0f2fe" },
  "Held":     { color: "#0a7c42", bg: "#dcf5e9" },
  "Not Held": { color: "#6b7280", bg: "#f3f4f6" },
};

const toMins = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const CallDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [call, setCall]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCall(id)
      .then((res) => setCall(res.data))
      .catch(() => setCall(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this call?")) return;
    try {
      await deleteCall(id);
      navigate("/calls");
    } catch {
      alert("Failed to delete call");
    }
  };

  if (loading) {
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        Loading...
      </div>
    );
  }

  if (!call) {
    return (
      <div className="cd-loading">
        <p>Call not found.</p>
        <button onClick={() => navigate("/calls")}>Back to Calls</button>
      </div>
    );
  }

  const meta = STATUS_META[call.status] || STATUS_META["Planned"];

  const formatDateTime = (date, time) => {
    if (!date) return "None";
    return date + (time ? " " + time : "");
  };

  const formatDate = (d) => {
    if (!d) return "None";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  // ── Scheduler calculations ──
  const callStartMins = toMins(call.time_start);
  const callEndMins   = toMins(call.time_end);

  // Timeline always starts at 07:00
  const TIMELINE_START_HOUR = 7;

  // Timeline ends at least 1 hour after call end, minimum 14:00
  const callEndHour         = callEndMins ? Math.ceil(callEndMins / 60) : 14;
  const TIMELINE_END_HOUR   = Math.max(14, callEndHour + 1);

  const TIMELINE_START = TIMELINE_START_HOUR * 60;
  const TIMELINE_END   = TIMELINE_END_HOUR * 60;
  const TOTAL          = TIMELINE_END - TIMELINE_START;

  // Generate time labels dynamically
  const timeLabels = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
    timeLabels.push(`${String(h).padStart(2, "0")}:00`);
  }

  // Dynamic scheduler width based on number of hour labels
  const schedulerMinWidth = Math.max(560, timeLabels.length * 76);

  // Calculate block position
  const getBlockStyle = () => {
    if (callStartMins === null || callEndMins === null) return {};
    const left  = ((callStartMins - TIMELINE_START) / TOTAL) * 100;
    const width = ((callEndMins - callStartMins) / TOTAL) * 100;
    return {
      position: "absolute",
      left:  `${Math.max(0, left)}%`,
      width: `${Math.max(1, width)}%`,
    };
  };

  return (
    <div className="cd-page">
      <div className="cd-scroll">

        {/* Topbar */}
        <div className="cd-topbar">
          <div className="cd-breadcrumb">
            <span className="cd-bc-link" onClick={() => navigate("/calls")}>Calls</span>
            <span className="cd-bc-sep">›</span>
            <span className="cd-bc-current">{call.name}</span>
          </div>
          <div className="cd-topbar-right">
            <button className="cd-invite-btn">Send Invitations</button>
            <button className="cd-accepted-btn">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Accepted
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="cd-actionbar">
          <button className="cd-edit-btn">Edit</button>
          <button className="cd-more-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="cd-content">

          {/* ── LEFT ── */}
          <div className="cd-left">

            {/* Main card */}
            <div className="cd-card">
              <div className="cd-grid">
                <div className="cd-field">
                  <span className="cd-label">Name</span>
                  <span className="cd-value">{call.name || "None"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Parent</span>
                  <span className="cd-value cd-accent">{call.parent_name || "None"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Status</span>
                  <span className="cd-status-badge"
                    style={{ background: meta.bg, color: meta.color }}>
                    {call.status || "Planned"}
                  </span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Direction</span>
                  <span className="cd-value">{call.direction || "Outbound"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Date Start</span>
                  <span className="cd-value">
                    {formatDateTime(call.date_start, call.time_start)}
                  </span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Date End</span>
                  <span className="cd-value">
                    {formatDateTime(call.date_end, call.time_end)}
                  </span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Duration</span>
                  <span className="cd-value">{call.duration || "None"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Reminders</span>
                  <span className="cd-value">None</span>
                </div>
                <div className="cd-field cd-field-full">
                  <span className="cd-label">Description</span>
                  <span className="cd-value">{call.description || "None"}</span>
                </div>
              </div>
            </div>

            {/* Scheduler card */}
            <div className="cd-card">
              <h3 className="cd-section-title">Scheduler</h3>
              <div className="cd-scheduler" style={{ minWidth: schedulerMinWidth }}>
                <div className="cd-scheduler-header" style={{ minWidth: schedulerMinWidth }}>
                  <div className="cd-scheduler-date">
                    {call.date_start
                      ? new Date(call.date_start).toLocaleDateString("en-US", {
                          weekday: "short", day: "numeric", month: "long",
                        })
                      : "Today"}
                  </div>
                  <div className="cd-scheduler-times" style={{ minWidth: schedulerMinWidth }}>
                    {timeLabels.map((t) => (
                      <span key={t} className="cd-scheduler-time">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="cd-scheduler-row" style={{ minWidth: schedulerMinWidth }}>
                  <div className="cd-scheduler-user">
                    <div className="cd-scheduler-avatar">
                      {call.assigned_user?.charAt(0)?.toUpperCase() || "J"}
                    </div>
                    <span>{call.assigned_user || "Jack Adams"}</span>
                  </div>
                  <div className="cd-scheduler-track">
                    <div className="cd-scheduler-block" style={getBlockStyle()} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="cd-right">
            <div className="cd-card">

              {/* Assigned User */}
              <div className="cd-right-section">
                <span className="cd-right-label">Assigned User</span>
                <div className="cd-assigned-row">
                  <div className="cd-assigned-avatar">
                    {call.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className="cd-assigned-name">{call.assigned_user || "None"}</span>
                </div>
              </div>

              <div className="cd-divider" />

              {/* Teams */}
              <div className="cd-right-section">
                <span className="cd-right-label">Teams</span>
                <span className="cd-right-value">{call.teams || "None"}</span>
              </div>

              <div className="cd-divider" />

              {/* Created / Modified */}
              <div className="cd-right-section">
                <span className="cd-right-label">Created</span>
                <span className="cd-right-value">{formatDate(call.created_at)}</span>
              </div>

              <div className="cd-right-section">
                <span className="cd-right-label">Modified</span>
                <span className="cd-right-value">{formatDate(call.updated_at)}</span>
              </div>

              <div className="cd-divider" />

              {/* Attendees */}
              <div className="cd-right-section">
                <span className="cd-right-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  Attendees
                </span>
              </div>

              <div className="cd-right-section">
                <span className="cd-right-label">Users</span>
                <span className="cd-right-value cd-accent">
                  {call.attendees_users || "None"}
                </span>
              </div>

              <div className="cd-right-section">
                <span className="cd-right-label">Contacts</span>
                <span className="cd-right-value cd-accent">
                  {call.attendees_contacts || "None"}
                </span>
              </div>

              <div className="cd-right-section">
                <span className="cd-right-label">Leads</span>
                <span className="cd-right-value">
                  {call.attendees_leads || "None"}
                </span>
              </div>

              <div className="cd-divider" />

              <button className="cd-delete-btn" onClick={handleDelete}>
                Delete Call
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CallDetail;