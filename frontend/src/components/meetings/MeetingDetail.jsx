import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMeeting, deleteMeeting } from "../../api/meetings";

const STATUS_META = {
  "Planned":  { color: "#0369a1", bg: "#e0f2fe" },
  "Held":     { color: "#0a7c42", bg: "#dcf5e9" },
  "Not Held": { color: "#6b7280", bg: "#f3f4f6" },
};

const PLATFORM_META = {
  zoom:        { label: "Zoom",            color: "#2D8CFF" },
  google_meet: { label: "Google Meet",     color: "#00897B" },
  teams:       { label: "Microsoft Teams", color: "#5059C9" },
  webex:       { label: "Cisco Webex",     color: "#00BEF2" },
  other:       { label: "Other",           color: "#6b7280" },
};

const AVATAR_COLORS = [
  "#c0392b","#2980b9","#27ae60","#8e44ad",
  "#e67e22","#16a085","#d35400","#2c3e50",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ── Platform icon ── */
const PlatformIcon = ({ platform, size = 13 }) => {
  const icons = {
    zoom: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#2D8CFF">
        <path d="M15 10.5v3l4-3v6l-4-3v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v3.5z"/>
      </svg>
    ),
    google_meet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#00897B">
        <path d="M20 3H4a1 1 0 00-1 1v12a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 12H5V5h14v10z"/>
      </svg>
    ),
    teams: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#5059C9">
        <path d="M19.5 8.5A2.5 2.5 0 0017 6a2.5 2.5 0 00-2.5 2.5c0 .5.1.9.3 1.3A3 3 0 0117 9.5a3 3 0 013 3V17h1.5A1.5 1.5 0 0023 15.5v-4a3 3 0 00-3.5-3zM9 11a4 4 0 100-8 4 4 0 000 8zm6 2.5v-1A4.5 4.5 0 009 8a4.5 4.5 0 00-4.5 4.5v1A1.5 1.5 0 006 15h6a1.5 1.5 0 001.5-1.5zM7 16v5h4v-5H7z"/>
      </svg>
    ),
    webex: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#00BEF2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
  };
  return icons[platform] || null;
};

/* ── AttendeeChips ── */
const AttendeeChips = ({ items }) => {
  let list = [];
  if (Array.isArray(items)) {
    list = items;
  } else if (items && typeof items === "string") {
    list = items.split(",").map((s) => ({ id: s.trim(), name: s.trim() }));
  }

  list = list.filter((item) => {
    const name = typeof item === "string" ? item : item?.name;
    return name && name.trim() && !name.startsWith("{") && name !== "null";
  });

  if (list.length === 0) {
    return <span className="md-right-value">None</span>;
  }

  return (
    <div className="md-chips">
      {list.map((item, i) => {
        const label = typeof item === "string" ? item : (item.name || `#${item.id}`);
        return (
          <span key={item.id || i} className="md-chip">
            <span
              className="md-chip-dot"
              style={{ background: avatarColor(label) }}
            >
              {label.charAt(0).toUpperCase()}
            </span>
            {label}
          </span>
        );
      })}
    </div>
  );
};

/* ── Scheduler ── */
const Scheduler = ({ dateStart, timeStart, timeEnd, assignedUser }) => {
  const dateLabel = dateStart
    ? new Date(dateStart + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", day: "numeric", month: "long",
      })
    : "Today";

  const startH    = parseInt(timeStart?.split(":")[0] || "9", 10);
  const endH      = parseInt(timeEnd?.split(":")[0]   || "10", 10);
  const firstH    = Math.max(0, startH - 3);
  const hours     = Array.from({ length: 9 }, (_, i) =>
    String(firstH + i).padStart(2, "00") + ":00"
  );
  const total     = 9;
  const startPct  = ((startH - firstH) / total) * 100;
  const endPct    = ((endH   - firstH) / total) * 100;
  const width     = Math.max(endPct - startPct, 4);
  const nowH      = new Date().getHours() + new Date().getMinutes() / 60;
  const markerPct = ((nowH - firstH) / total) * 100;

  return (
    <div className="md-scheduler">
      <div className="md-sched-date">{dateLabel}</div>
      <div className="md-sched-grid">
        <div className="md-sched-time-row">
          <div className="md-sched-user-col" />
          {hours.map((h) => (
            <div key={h} className="md-sched-hour">{h}</div>
          ))}
        </div>
        <div className="md-sched-user-row">
          <div className="md-sched-user-col">
            <div className="md-sched-avatar">
              {(assignedUser || "J").charAt(0).toUpperCase()}
            </div>
            <span>{assignedUser || "User"}</span>
          </div>
          <div className="md-sched-track">
            {hours.map((_, i) => (
              <div key={i} className="md-sched-gridline"
                style={{ left: (i / total * 100) + "%" }} />
            ))}
            <div className="md-sched-block"
              style={{ left: startPct + "%", width: width + "%" }} />
            {markerPct > 0 && markerPct < 100 && (
              <div className="md-sched-marker" style={{ left: markerPct + "%" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── MeetingDetail ── */
const MeetingDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeeting(id)
      .then((r) => setMeeting(r))        // ✅ FIXED: was r.data
      .catch(() => setMeeting(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this meeting?")) return;
    try {
      await deleteMeeting(id);
      navigate("/meetings");
    } catch { alert("Failed to delete"); }
  };

  if (loading) return (
    <div className="md-loading"><div className="md-spinner" /> Loading...</div>
  );
  if (!meeting) return (
    <div className="md-loading">
      <p>Meeting not found.</p>
      <button onClick={() => navigate("/meetings")}>Back</button>
    </div>
  );

  const meta     = STATUS_META[meeting.status] || STATUS_META["Planned"];
  const platMeta = PLATFORM_META[meeting.platform] || null;

  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  return (
    <div className="md-page">
      <div className="md-scroll">

        {/* Topbar */}
        <div className="md-topbar">
          <div className="md-breadcrumb">
            <span className="md-bc-link" onClick={() => navigate("/meetings")}>Meetings</span>
            <span className="md-bc-sep">›</span>
            <span className="md-bc-current">{meeting.title}</span>
          </div>
          <div className="md-topbar-right">
            <button className="md-follow-btn">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Follow
            </button>
            <button className="md-invite-btn">Send Invitations</button>
            <button className="md-tentative-btn">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tentative
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="md-actionbar">
          <button className="md-edit-btn" onClick={() => navigate(`/meetings/${id}/edit`)}>
            Edit
          </button>
          <button className="md-more-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="5"  cy="12" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="md-content">

          {/* ── LEFT ── */}
          <div className="md-left">
            <div className="md-card">
              <div className="md-grid">

                <div className="md-field">
                  <span className="md-label">Name</span>
                  <span className="md-value">{meeting.title || "—"}</span>
                </div>

                <div className="md-field">
                  <span className="md-label">Parent</span>
                  <span className="md-value md-accent">{meeting.parent_name || "—"}</span>
                </div>

                <div className="md-field">
                  <span className="md-label">Status</span>
                  <span className="md-badge" style={{ background: meta.bg, color: meta.color }}>
                    {meeting.status}
                  </span>
                </div>

                <div className="md-field" />

                <div className="md-field">
                  <span className="md-label">Date Start</span>
                  <span className="md-value">
                    {meeting.date_start
                      ? new Date(meeting.date_start + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        }) + (meeting.time_start ? " · " + meeting.time_start : "")
                      : "—"}
                  </span>
                </div>

                <div className="md-field">
                  <span className="md-label">Date End</span>
                  <span className="md-value">
                    {meeting.date_end
                      ? new Date(meeting.date_end + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        }) + (meeting.time_end ? " · " + meeting.time_end : "")
                      : "—"}
                  </span>
                </div>

                <div className="md-field">
                  <span className="md-label">Duration</span>
                  <span className="md-value">{meeting.duration || "—"}</span>
                </div>

                <div className="md-field">
                  <span className="md-label">Reminders</span>
                  <span className="md-value">None</span>
                </div>

                {/* Meeting Link */}
                <div className="md-field md-field-full">
                  <span className="md-label">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2}
                      style={{ marginRight: 4, verticalAlign: "middle" }}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M14.828 14.828a4 4 0 015.656 0l-4 4a4 4 0 01-5.656-5.656l1.102-1.101"/>
                    </svg>
                    Meeting Link
                  </span>
                  {meeting.meeting_link ? (
                    <div className="md-link-row">
                      {platMeta && (
                        <span className="md-platform-badge"
                          style={{ background: platMeta.color + "18", color: platMeta.color }}>
                          <PlatformIcon platform={meeting.platform} size={11} />
                          {platMeta.label}
                        </span>
                      )}
                      <a href={meeting.meeting_link} target="_blank"
                        rel="noopener noreferrer" className="md-link-anchor">
                        {meeting.meeting_link}
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}
                          style={{ marginLeft: 4, verticalAlign: "middle" }}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <span className="md-value">None</span>
                  )}
                </div>

                <div className="md-field md-field-full">
                  <span className="md-label">Description</span>
                  <span className="md-value">{meeting.description || "None"}</span>
                </div>

              </div>
            </div>

            {/* Scheduler */}
            <div className="md-card">
              <h3 className="md-section-title">Scheduler</h3>
              <Scheduler
                dateStart={meeting.date_start}
                timeStart={meeting.time_start}
                timeEnd={meeting.time_end}
                assignedUser={meeting.assigned_user}
              />
            </div>

            {/* Stream */}
            <div className="md-card">
              <h3 className="md-section-title">Stream</h3>
              <input className="md-stream-input" placeholder="Write your comment here" />
              <p className="md-muted" style={{ marginTop: 12 }}>No activity yet.</p>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="md-right">
            <div className="md-card">

              <div className="md-right-section">
                <span className="md-right-label">Assigned User</span>
                <div className="md-assigned-row">
                  <div className="md-assigned-avatar"
                    style={{ background: avatarColor(meeting.assigned_user || "") }}>
                    {meeting.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className="md-assigned-name">{meeting.assigned_user || "None"}</span>
                </div>
              </div>

              <div className="md-divider" />

              <div className="md-right-section">
                <span className="md-right-label">Teams</span>
                <span className="md-right-value">{meeting.teams || "None"}</span>
              </div>

              <div className="md-divider" />

              <div className="md-right-section">
                <span className="md-right-label">Platform</span>
                {platMeta ? (
                  <span className="md-platform-badge"
                    style={{ background: platMeta.color + "18", color: platMeta.color }}>
                    <PlatformIcon platform={meeting.platform} size={11} />
                    {platMeta.label}
                  </span>
                ) : (
                  <span className="md-right-value">None</span>
                )}
              </div>

              <div className="md-divider" />

              <div className="md-right-section">
                <span className="md-right-label">Created</span>
                <span className="md-right-value">{fmtDate(meeting.created_at)}</span>
              </div>
              <div className="md-right-section">
                <span className="md-right-label">Modified</span>
                <span className="md-right-value">{fmtDate(meeting.updated_at)}</span>
              </div>

              <div className="md-divider" />

              <div className="md-right-section">
                <span className="md-right-label md-attendees-hdr">Attendees</span>
              </div>

              <div className="md-right-section">
                <span className="md-right-label">Users</span>
                <AttendeeChips items={meeting.attendees_users} />
              </div>

              <div className="md-right-section">
                <span className="md-right-label">Contacts</span>
                <AttendeeChips items={meeting.attendees_contacts} />
              </div>

              <div className="md-right-section">
                <span className="md-right-label">Leads</span>
                <AttendeeChips items={meeting.attendees_leads} />
              </div>

              <div className="md-right-section">
                <span className="md-right-label">Opportunities</span>
                <AttendeeChips items={meeting.attendees_opportunities} />
              </div>

              <div className="md-divider" />

              <button className="md-delete-btn" onClick={handleDelete}>
                Delete Meeting
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;