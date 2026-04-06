import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createMeeting, getMyMeetings } from "../../api/meetings";
import { getUsers }    from "../../api/users";
import { getTeams }    from "../../api/teams";
import { getContacts } from "../../api/contacts";
import { getLeads }    from "../../api/leads";
import { getAccounts } from "../../api/accounts";

const STATUSES     = ["Planned", "Held", "Not Held"];
const DURATIONS    = ["15m","30m","45m","1h","1h 30m","2h","3h"];
const PARENT_TYPES = ["Account","Contact","Lead","Opportunity","Case"];
const HOURS        = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0") + ":00"
);
const PLATFORMS = [
  { value: "",            label: "None"              },
  { value: "zoom",        label: "Zoom"              },
  { value: "google_meet", label: "Google Meet"       },
  { value: "teams",       label: "Microsoft Teams"   },
  { value: "webex",       label: "Cisco Webex"       },
  { value: "other",       label: "Other"             },
];

const today = new Date().toISOString().split("T")[0];
const nowH  = String(new Date().getHours()).padStart(2, "0") + ":00";
const endH  = String(Math.min(new Date().getHours() + 1, 23)).padStart(2, "0") + ":00";

const EMPTY = {
  title: "", status: "Planned",
  date_start: today, time_start: nowH,
  date_end:   today, time_end:   endH,
  duration: "1h", description: "",
  parent_type: "Account", parent_name: "",
  assigned_user: "", assigned_user_id: "",
  teams: "", meeting_link: "", platform: "",
  attendees_users:        [],
  attendees_contacts:     [],
  attendees_leads:        [],
  attendees_opportunities:[],
};

/* ─── normalize any record to have a .name field ─── */
const normalize = (arr, nameField = "name") =>
  (Array.isArray(arr) ? arr : []).map((o) => ({
    ...o,
    name: o[nameField] || o.name || o.full_name || o.title || "",
  }));

/* ─── avatar color ─── */
const COLORS = ["#c0392b","#2980b9","#27ae60","#8e44ad","#e67e22","#16a085","#d35400","#2c3e50"];
const colorFor = (name = "") => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];

/* ════════════════════════════════
   SINGLE SELECT FIELD
════════════════════════════════ */
const SelectField = ({
  label, required, value, onSelect,
  options = [], nameKey = "name", placeholder = "Select",
}) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter((o) =>
    (o[nameKey] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cm-select-field" ref={ref}>
      {label && (
        <label className="cm-label">
          {label}{required && <span className="cm-req"> *</span>}
        </label>
      )}
      <div className={"cm-select-box" + (open ? " open" : "")}>
        <div className="cm-select-display" onClick={() => setOpen((v) => !v)}>
          {value
            ? <span className="cm-select-val">{value}</span>
            : <span className="cm-select-ph">{placeholder}</span>
          }
        </div>
        <div className="cm-select-btns">
          <button className="cm-sel-btn" type="button"
            onClick={() => setOpen((v) => !v)}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          {value && (
            <button className="cm-sel-btn cm-sel-clear" type="button"
              onClick={() => { onSelect(null); setSearch(""); }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="cm-dropdown">
          <input
            className="cm-dd-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="cm-dd-list">
            {filtered.length === 0 ? (
              <div className="cm-dd-empty">No results</div>
            ) : (
              filtered.map((o, i) => (
                <div key={o.id || i} className="cm-dd-item"
                  onClick={() => { onSelect(o); setOpen(false); setSearch(""); }}>
                  <div className="cm-dd-avatar"
                    style={{ background: colorFor(o[nameKey]) }}>
                    {(o[nameKey] || "?").charAt(0).toUpperCase()}
                  </div>
                  <span>{o[nameKey] || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════
   MULTI SELECT FIELD
════════════════════════════════ */
const MultiSelectField = ({
  label, values = [], onAdd, onRemove,
  options = [], nameKey = "name", placeholder = "Add...",
}) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectedIds = new Set(values.map((v) => v.id));
  const filtered    = options
    .filter((o) => !selectedIds.has(o.id))
    .filter((o) => (o[nameKey] || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="cm-select-field cm-multi-field" ref={ref}>
      {label && <label className="cm-label">{label}</label>}
      <div className={"cm-multi-box" + (open ? " open" : "")}
        onClick={() => setOpen(true)}>
        <div className="cm-multi-tags">
          {values.map((v) => (
            <span key={v.id} className="cm-tag">
              <span className="cm-tag-dot" style={{ background: colorFor(v[nameKey]) }}>
                {(v[nameKey] || "?").charAt(0).toUpperCase()}
              </span>
              {v[nameKey]}
              <button className="cm-tag-remove" type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(v); }}>
                ✕
              </button>
            </span>
          ))}
          <input
            className="cm-multi-input"
            placeholder={values.length === 0 ? placeholder : ""}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
        </div>
        <button className="cm-sel-btn" type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div className="cm-dropdown">
          <div className="cm-dd-list">
            {filtered.map((o, i) => (
              <div key={o.id || i} className="cm-dd-item"
                onClick={() => { onAdd(o); setSearch(""); }}>
                <div className="cm-dd-avatar"
                  style={{ background: colorFor(o[nameKey]) }}>
                  {(o[nameKey] || "?").charAt(0).toUpperCase()}
                </div>
                <span>{o[nameKey] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════
   SCHEDULER
════════════════════════════════ */
const Scheduler = ({ dateStart, timeStart, timeEnd, assignedUser, existingMeetings = [] }) => {
  const startH    = parseInt(timeStart?.split(":")[0] || "9", 10);
  const firstH    = Math.max(0, startH - 3);
  const total     = 9;
  const hours     = Array.from({ length: total }, (_, i) =>
    String(firstH + i).padStart(2, "0") + ":00"
  );
  const endH_     = parseInt(timeEnd?.split(":")[0] || String(startH + 1), 10);
  const startPct  = ((startH - firstH) / total) * 100;
  const width     = Math.max(((endH_ - startH) / total) * 100, 4);
  const nowFrac   = new Date().getHours() + new Date().getMinutes() / 60;
  const markerPct = ((nowFrac - firstH) / total) * 100;

  const dateLabel = dateStart
    ? new Date(dateStart + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "long", day: "numeric",
      })
    : "Today";

  const blocks = existingMeetings
    .filter((m) => m.date_start === dateStart)
    .map((m) => {
      const mh = parseInt(m.time_start?.split(":")[0] || "9",  10);
      const eh = parseInt(m.time_end?.split(":")[0]   || String(mh + 1), 10);
      return {
        left:  Math.max(0, ((mh - firstH) / total) * 100),
        width: Math.max(2, ((eh - mh) / total) * 100),
        title: m.title,
      };
    });

  return (
    <div className="cm-scheduler">
      <div className="cm-sched-date">{dateLabel}</div>
      <div className="cm-sched-grid">
        {/* Time header */}
        <div className="cm-sched-time-row">
          <div className="cm-sched-label-col" />
          {hours.map((h) => (
            <div key={h} className="cm-sched-hour">{h}</div>
          ))}
        </div>
        {/* User row */}
        <div className="cm-sched-user-row">
          <div className="cm-sched-label-col">
            <div className="cm-sched-avatar">
              {(assignedUser || "U").charAt(0).toUpperCase()}
            </div>
            <span className="cm-sched-uname">{assignedUser || "—"}</span>
          </div>
          <div className="cm-sched-track">
            {hours.map((_, i) => (
              <div key={i} className="cm-sched-gridline"
                style={{ left: (i / total * 100) + "%" }} />
            ))}
            {blocks.map((b, i) => (
              <div key={i} className="cm-sched-existing"
                style={{ left: b.left + "%", width: b.width + "%" }}
                title={b.title} />
            ))}
            <div className="cm-sched-new"
              style={{ left: startPct + "%", width: width + "%" }} />
            {markerPct > 0 && markerPct < 100 && (
              <div className="cm-sched-marker"
                style={{ left: markerPct + "%" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════
   PLATFORM ICON
════════════════════════════════ */
const PlatformIcon = ({ platform }) => {
  const icons = {
    zoom: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#2D8CFF">
        <path d="M15 10.5v3l4-3v6l-4-3v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v3.5z"/>
      </svg>
    ),
    google_meet: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#00897B">
        <path d="M20 3H4a1 1 0 00-1 1v12a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 12H5V5h14v10z"/>
      </svg>
    ),
    teams: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#5059C9">
        <path d="M19.5 8.5A2.5 2.5 0 0017 6a2.5 2.5 0 00-2.5 2.5c0 .5.1.9.3 1.3A3 3 0 0117 9.5a3 3 0 013 3V17h1.5A1.5 1.5 0 0023 15.5v-4a3 3 0 00-3.5-3z"/>
      </svg>
    ),
    webex: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#00BEF2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
  };
  return icons[platform] || null;
};

/* ════════════════════════════════
   CREATE MEETING
════════════════════════════════ */
const CreateMeeting = () => {
  const navigate = useNavigate();
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* data from DB */
  const [users,            setUsers]            = useState([]);
  const [teams,            setTeams]            = useState([]);
  const [contacts,         setContacts]         = useState([]);
  const [leads,            setLeads]            = useState([]);
  const [accounts,         setAccounts]         = useState([]);
  const [opportunities,    setOpportunities]    = useState([]);
  const [existingMeetings, setExistingMeetings] = useState([]);

  useEffect(() => {
    /* logged-in user → pre-fill assigned user */
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((u) => setForm((p) => ({
        ...p,
        assigned_user:    u.fullname || u.username || "",
        assigned_user_id: u.id || "",
      })))
      .catch(() => {});

    /* existing meetings for scheduler */
    getMyMeetings()
     .then((r) => setExistingMeetings(Array.isArray(r) ? r : []))
     .catch(() => setExistingMeetings([]));

    /* users — fullname → name */
    getUsers()
      .then((r) => setUsers(
        normalize(r.data, "fullname").map((u) => ({ ...u, avatar: "#c0392b" }))
      ))
      .catch(() => setUsers([]));

    /* teams — name already correct */
    getTeams()
      .then((r) => setTeams(normalize(r.data, "name")))
      .catch(() => setTeams([]));

    /* contacts — full_name → name */
    getContacts()
      .then((r) => setContacts(normalize(r.data, "full_name")))
      .catch(() => setContacts([]));

    /* leads — full_name → name */
    getLeads()
      .then((r) => setLeads(normalize(r.data, "full_name")))
      .catch(() => setLeads([]));

    /* accounts — name already correct */
    getAccounts()
      .then((r) => setAccounts(normalize(r.data, "name")))
      .catch(() => setAccounts([]));
  }, []);

  /* parent options based on selected type */
  const parentOptions = {
    Account:     accounts,
    Contact:     contacts,
    Lead:        leads,
    Opportunity: opportunities,
    Case:        [],
  }[form.parent_type] || [];

  const set = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const addToMulti     = (field, item) =>
    setForm((p) => ({
      ...p,
      [field]: p[field].some((x) => x.id === item.id)
        ? p[field]
        : [...p[field], item],
    }));

  const removeFromMulti = (field, item) =>
    setForm((p) => ({
      ...p,
      [field]: p[field].filter((x) => x.id !== item.id),
    }));

  const handleSave = async () => {
  const errs = {};
  if (!form.title.trim()) errs.title = "Name is required";
  if (!form.date_start.trim()) errs.date_start = "Required";
  if (!form.date_end.trim()) errs.date_end = "Required";

  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

  try {
    setSaving(true);
    console.log("DEBUG attendees_contacts:",
      form.attendees_contacts.map(c => c.id)
    );

    await createMeeting({
      ...form,

      
      attendees_users: form.attendees_users.map(u => u.id),
      attendees_contacts: form.attendees_contacts.map(c => c.id),
      attendees_leads: form.attendees_leads.map(l => l.id),
      attendees_opportunities: form.attendees_opportunities.map(o => o.id),
    });

    navigate("/meetings");
  } catch (err) {
    alert(err.response?.data?.error || "Failed to save");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="cm-page">
      <div className="cm-scroll">

        {/* Breadcrumb */}
        <div className="cm-topbar">
          <div className="cm-breadcrumb">
            <span className="cm-bc-link" onClick={() => navigate("/meetings")}>
              Meetings
            </span>
            <span className="cm-bc-sep">›</span>
            <span className="cm-bc-curr">create</span>
          </div>
        </div>

        {/* Actions */}
        <div className="cm-actionbar">
          <button className="cm-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="cm-cancel-btn" onClick={() => navigate("/meetings")}>
            Cancel
          </button>
          <button className="cm-more-btn" type="button">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="cm-body">

          {/* ── LEFT FORM ── */}
          <div className="cm-form">

            {/* Name + Parent */}
            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">
                  Name <span className="cm-req">*</span>
                </label>
                <input
                  name="title" value={form.title} onChange={set}
                  className={"cm-input" + (errors.title ? " cm-input-err" : "")}
                  placeholder="Meeting name"
                />
                {errors.title && <span className="cm-err">{errors.title}</span>}
              </div>

              <div className="cm-field">
                <label className="cm-label">Parent</label>
                <div className="cm-parent-row">
                  <select
                    name="parent_type" value={form.parent_type} onChange={set}
                    className="cm-select cm-parent-type-sel"
                  >
                    {PARENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <SelectField
                    value={form.parent_name}
                    options={parentOptions}
                    onSelect={(o) => setForm((p) => ({
                      ...p,
                      parent_name: o?.name || "",
                    }))}
                    placeholder="Select"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">Status</label>
                <select name="status" value={form.status} onChange={set}
                  className="cm-select">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="cm-field" />
            </div>

            {/* Date Start + Date End */}
            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">
                  Date Start <span className="cm-req">*</span>
                </label>
                <div className="cm-dt-row">
                  <div className="cm-date-wrap">
                    <input name="date_start" type="date" value={form.date_start}
                      onChange={set}
                      className={"cm-input" + (errors.date_start ? " cm-input-err" : "")}
                    />
                    <span className="cm-fi">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                    </span>
                  </div>
                  <div className="cm-time-wrap">
                    <select name="time_start" value={form.time_start}
                      onChange={set} className="cm-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="cm-fi cm-fi-r">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9"/>
                        <path strokeLinecap="round" d="M12 7v5l3 3"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div className="cm-field">
                <label className="cm-label">
                  Date End <span className="cm-req">*</span>
                </label>
                <div className="cm-dt-row">
                  <div className="cm-date-wrap">
                    <input name="date_end" type="date" value={form.date_end}
                      onChange={set}
                      className={"cm-input" + (errors.date_end ? " cm-input-err" : "")}
                    />
                    <span className="cm-fi">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                    </span>
                  </div>
                  <div className="cm-time-wrap">
                    <select name="time_end" value={form.time_end}
                      onChange={set} className="cm-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="cm-fi cm-fi-r">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9"/>
                        <path strokeLinecap="round" d="M12 7v5l3 3"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration + Reminders */}
            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">Duration</label>
                <select name="duration" value={form.duration}
                  onChange={set} className="cm-select">
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="cm-field">
                <label className="cm-label">Reminders</label>
                <button className="cm-reminder-btn" type="button">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Meeting Link + Platform */}
            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">Meeting Link</label>
                <div className="cm-link-row">
                  <div className="cm-platform-icon-wrap">
                    <PlatformIcon platform={form.platform} />
                  </div>
                  <input
                    name="meeting_link" value={form.meeting_link} onChange={set}
                    className="cm-input cm-link-input"
                    placeholder="https://..."
                    type="url"
                  />
                  {form.meeting_link && (
                    <a href={form.meeting_link} target="_blank"
                      rel="noopener noreferrer" className="cm-link-open">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <div className="cm-field">
                <label className="cm-label">Platform</label>
                <select name="platform" value={form.platform}
                  onChange={set} className="cm-select">
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="cm-field">
              <label className="cm-label">Description</label>
              <textarea
                name="description" value={form.description} onChange={set}
                className="cm-textarea" rows={4}
              />
            </div>

            {/* Scheduler */}
            <div className="cm-field">
              <label className="cm-label cm-section-lbl">Scheduler</label>
              <Scheduler
                dateStart={form.date_start}
                timeStart={form.time_start}
                timeEnd={form.time_end}
                assignedUser={form.assigned_user}
                existingMeetings={existingMeetings.filter(
                  (m) => m.assigned_user === form.assigned_user
                )}
              />
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="cm-right">
            <div className="cm-right-card">

              <SelectField
                label="Assigned User" required
                value={form.assigned_user}
                options={users}
                onSelect={(o) => setForm((p) => ({
                  ...p,
                  assigned_user:    o?.name || "",
                  assigned_user_id: o?.id   || "",
                }))}
              />

              <div className="cm-rg">
                <SelectField
                  label="Teams"
                  value={form.teams}
                  options={teams}
                  onSelect={(o) => setForm((p) => ({
                    ...p, teams: o?.name || "",
                  }))}
                />
              </div>

              <div className="cm-attendees-hdr">Attendees</div>

              <div className="cm-rg">
                <MultiSelectField
                  label="Users"
                  values={form.attendees_users}
                  options={users}
                  onAdd={(o)    => addToMulti("attendees_users", o)}
                  onRemove={(o) => removeFromMulti("attendees_users", o)}
                  placeholder="Add users..."
                />
              </div>

              <div className="cm-rg">
                <MultiSelectField
                  label="Contacts"
                  values={form.attendees_contacts}
                  options={contacts}
                  onAdd={(o)    => addToMulti("attendees_contacts", o)}
                  onRemove={(o) => removeFromMulti("attendees_contacts", o)}
                  placeholder="Add contacts..."
                />
              </div>

              <div className="cm-rg">
                <MultiSelectField
                  label="Leads"
                  values={form.attendees_leads}
                  options={leads}
                  onAdd={(o)    => addToMulti("attendees_leads", o)}
                  onRemove={(o) => removeFromMulti("attendees_leads", o)}
                  placeholder="Add leads..."
                />
              </div>

              <div className="cm-rg">
                <MultiSelectField
                  label="Opportunities"
                  values={form.attendees_opportunities}
                  options={opportunities}
                  onAdd={(o)    => addToMulti("attendees_opportunities", o)}
                  onRemove={(o) => removeFromMulti("attendees_opportunities", o)}
                  placeholder="Add opportunities..."
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;