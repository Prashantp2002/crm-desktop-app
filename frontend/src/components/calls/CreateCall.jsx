import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createCall, getCalls } from "../../api/calls";
import { getUsers }    from "../../api/users";
import { getTeams }    from "../../api/teams";
import { getContacts } from "../../api/contacts";
import { getLeads }    from "../../api/leads";
import { getAccounts } from "../../api/accounts";

const STATUSES     = ["Planned", "Held", "Not Held"];
const DIRECTIONS   = ["Outbound", "Inbound"];
const DURATIONS    = ["5m","10m","15m","30m","45m","1h","2h"];
const PARENT_TYPES = ["Account","Contact","Lead","Opportunity","Case"];
const HOURS        = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0") + ":00"
);

const today   = new Date().toISOString().split("T")[0];
const nowHour = String(new Date().getHours()).padStart(2, "0") + ":00";
const endHour = String(Math.min(new Date().getHours() + 1, 23)).padStart(2, "0") + ":00";

const EMPTY = {
  name: "", status: "Planned", direction: "Outbound",
  date_start: today, time_start: nowHour,
  date_end:   today, time_end:   endHour,
  duration: "5m", description: "",
  parent_type: "Account", parent_id: "", parent_name: "",
  assigned_user: "", assigned_user_id: "",
  teams: "", teams_id: "",
  attendees_users: "", attendees_contacts: "", attendees_leads: "",
};

/* ── SelectField ── */
const SelectField = ({ label, required, value, onSelect, options, nameKey = "name", placeholder = "Select" }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter((o) =>
    (o[nameKey] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cc-select-field" ref={ref}>
      {label && (
        <label className="cc-label">
          {label}{required && <span className="cc-req"> *</span>}
        </label>
      )}
      <div className={"cc-select-box" + (open ? " open" : "")}>
        <div className="cc-select-display" onClick={() => setOpen(!open)}>
          {value
            ? <span className="cc-select-val">{value}</span>
            : <span className="cc-select-placeholder">{placeholder}</span>
          }
        </div>
        <div className="cc-select-btns">
          <button className="cc-select-icon-btn" onClick={() => setOpen(!open)} type="button">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          {value && (
            <button className="cc-select-icon-btn cc-select-clear"
              onClick={() => { onSelect(null); setSearch(""); }} type="button">✕
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="cc-dropdown">
          <input
            className="cc-dropdown-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="cc-dropdown-list">
            {filtered.length === 0
              ? <div className="cc-dropdown-empty">No results</div>
              : filtered.map((o, i) => (
                  <div key={i} className="cc-dropdown-item"
                    onClick={() => { onSelect(o); setOpen(false); setSearch(""); }}>
                    {o.avatar && (
                      <div className="cc-dropdown-avatar" style={{ background: o.avatar }}>
                        {(o[nameKey] || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{o[nameKey] || "—"}</span>
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Scheduler ── */
const Scheduler = ({ dateStart, timeStart, assignedUser, userCalls }) => {
  const startHour  = parseInt(timeStart?.split(":")[0] || "8", 10);
  const hours      = Array.from({ length: 9 }, (_, i) => {
    const h = Math.max(0, Math.min(23, startHour - 3 + i));
    return String(h).padStart(2, "0") + ":00";
  });

  const firstHour = parseInt(hours[0], 10);
  const lastHour  = parseInt(hours[hours.length - 1], 10) + 1;
  const totalSpan = lastHour - firstHour;

  const markerPct = ((startHour - firstHour) / totalSpan) * 100;

  const dateLabel = dateStart
    ? new Date(dateStart + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "long", day: "numeric",
      })
    : "Today";

  /* Convert userCalls to scheduler blocks */
  const blocks = (userCalls || [])
    .filter((c) => c.date_start === dateStart)
    .map((c) => {
      const ch = parseInt(c.time_start?.split(":")[0] || "9", 10);
      const cm = parseInt(c.time_start?.split(":")[1] || "0", 10);
      const eh = parseInt(c.time_end?.split(":")[0]   || ch + 1, 10);
      const em = parseInt(c.time_end?.split(":")[1]   || "0", 10);

      const startFrac = (ch + cm / 60 - firstHour) / totalSpan;
      const endFrac   = (eh + em / 60 - firstHour) / totalSpan;

      return {
        id:    c.id,
        name:  c.name,
        left:  Math.max(0, startFrac * 100),
        width: Math.max(1, (endFrac - startFrac) * 100),
      };
    });

  return (
    <div className="cc-scheduler">
      <div className="cc-sched-date">{dateLabel}</div>
      <div className="cc-sched-grid">

        {/* Time header */}
        <div className="cc-sched-time-row">
          <div className="cc-sched-label-col" />
          {hours.map((h) => (
            <div key={h} className="cc-sched-hour">{h}</div>
          ))}
        </div>

        {/* User row */}
        <div className="cc-sched-user-row">
          <div className="cc-sched-label-col">
            <div className="cc-sched-avatar">
              {(assignedUser || "U").charAt(0).toUpperCase()}
            </div>
            <span className="cc-sched-user-name">{assignedUser || "—"}</span>
          </div>

          <div className="cc-sched-track">
            {/* Hour grid lines */}
            {hours.map((_, i) => (
              <div key={i} className="cc-sched-gridline"
                style={{ left: (i / hours.length * 100) + "%" }} />
            ))}

            {/* Scheduled call blocks */}
            {blocks.map((b) => (
              <div key={b.id} className="cc-sched-busy"
                style={{ left: b.left + "%", width: b.width + "%" }}
                title={b.name}
              />
            ))}

            {/* Current time marker */}
            <div className="cc-sched-marker" style={{ left: markerPct + "%" }} />
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── CreateCall ── */
const CreateCall = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const [users,    setUsers]    = useState([]);
  const [teams,    setTeams]    = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads,    setLeads]    = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [userCalls, setUserCalls] = useState([]);

  /* Load logged-in user + all dropdown data */
  useEffect(() => {
    const token = localStorage.getItem("token");

    /* Get logged-in user */
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((u) => {
        setLoggedUser(u);
        setForm((p) => ({
          ...p,
          assigned_user:    u.fullname || u.username,
          assigned_user_id: u.id,
        }));
      })
      .catch(() => {});

    /* Get existing calls for scheduler */
    getCalls()
      .then((r) => setUserCalls(r.data))
      .catch(() => {});

    getUsers()
      .then((r) => setUsers(r.data.map((u) => ({
        ...u, name: u.fullname, avatar: "#c0392b",
      }))))
      .catch(() => {});

    getTeams()
      .then((r) => setTeams(r.data))
      .catch(() => {});

    getContacts()
      .then((r) => setContacts(r.data.map((c) => ({ ...c, name: c.full_name }))))
      .catch(() => {});

    getLeads()
      .then((r) => setLeads(r.data.map((l) => ({
        ...l, name: l.full_name || ((l.first_name || "") + " " + (l.last_name || "")).trim(),
      }))))
      .catch(() => {});

    getAccounts()
      .then((r) => setAccounts(r.data))
      .catch(() => {});
  }, []);

  const parentOptions = {
    Account:     accounts,
    Contact:     contacts,
    Lead:        leads,
    Opportunity: [],
    Case:        [],
  }[form.parent_type] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim())       errs.name      = "Name is required";
    if (!form.date_start.trim()) errs.date_start = "Required";
    if (!form.date_end.trim())   errs.date_end   = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createCall(form);
      navigate("/calls");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save call");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc-page">
      <div className="cc-scroll">

        {/* Breadcrumb */}
        <div className="cc-topbar">
          <div className="cc-breadcrumb">
            <span className="cc-bc-link" onClick={() => navigate("/calls")}>Calls</span>
            <span className="cc-bc-sep">›</span>
            <span className="cc-bc-current">create</span>
          </div>
        </div>

        {/* Actions */}
        <div className="cc-actionbar">
          <button className="cc-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="cc-cancel-btn" onClick={() => navigate("/calls")}>Cancel</button>
          <button className="cc-more-btn" type="button">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="cc-body">

          {/* ── LEFT FORM ── */}
          <div className="cc-form">

            {/* Name + Parent */}
            <div className="cc-row">
              <div className="cc-field">
                <label className="cc-label">Name <span className="cc-req">*</span></label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  className={"cc-input" + (errors.name ? " cc-input-err" : "")}
                />
                {errors.name && <span className="cc-err">{errors.name}</span>}
              </div>

              <div className="cc-field">
                <label className="cc-label">Parent</label>
                <div className="cc-parent-row">
                  <select
                    name="parent_type" value={form.parent_type}
                    onChange={handleChange} className="cc-select cc-parent-type-sel"
                  >
                    {PARENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <SelectField
                    value={form.parent_name}
                    options={parentOptions}
                    onSelect={(o) => setForm((p) => ({
                      ...p, parent_id: o?.id || "", parent_name: o?.name || "",
                    }))}
                    placeholder="Select"
                  />
                </div>
              </div>
            </div>

            {/* Status + Direction */}
            <div className="cc-row">
              <div className="cc-field">
                <label className="cc-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="cc-select">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="cc-field">
                <label className="cc-label">Direction</label>
                <select name="direction" value={form.direction} onChange={handleChange} className="cc-select">
                  {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Date Start + Date End */}
            <div className="cc-row">
              <div className="cc-field">
                <label className="cc-label">Date Start <span className="cc-req">*</span></label>
                <div className="cc-datetime-row">
                  <div className="cc-date-wrap">
                    <input
                      name="date_start" type="date" value={form.date_start}
                      onChange={handleChange}
                      className={"cc-input" + (errors.date_start ? " cc-input-err" : "")}
                    />
                    <span className="cc-field-icon">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                    </span>
                  </div>
                  <div className="cc-time-wrap">
                    <select name="time_start" value={form.time_start} onChange={handleChange} className="cc-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="cc-field-icon cc-field-icon-right">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9"/>
                        <path strokeLinecap="round" d="M12 7v5l3 3"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div className="cc-field">
                <label className="cc-label">Date End <span className="cc-req">*</span></label>
                <div className="cc-datetime-row">
                  <div className="cc-date-wrap">
                    <input
                      name="date_end" type="date" value={form.date_end}
                      onChange={handleChange}
                      className={"cc-input" + (errors.date_end ? " cc-input-err" : "")}
                    />
                    <span className="cc-field-icon">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                    </span>
                  </div>
                  <div className="cc-time-wrap">
                    <select name="time_end" value={form.time_end} onChange={handleChange} className="cc-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="cc-field-icon cc-field-icon-right">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9"/>
                        <path strokeLinecap="round" d="M12 7v5l3 3"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration + Reminders */}
            <div className="cc-row">
              <div className="cc-field">
                <label className="cc-label">Duration</label>
                <select name="duration" value={form.duration} onChange={handleChange} className="cc-select">
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="cc-field">
                <label className="cc-label">Reminders</label>
                <div>
                  <button className="cc-reminder-btn" type="button">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="cc-field">
              <label className="cc-label">Description</label>
              <textarea
                name="description" value={form.description}
                onChange={handleChange} className="cc-textarea" rows={4}
              />
            </div>

            {/* Scheduler */}
            <div className="cc-field">
              <label className="cc-label cc-section-lbl">Scheduler</label>
              <Scheduler
                dateStart={form.date_start}
                timeStart={form.time_start}
                assignedUser={form.assigned_user}
                userCalls={userCalls.filter((c) =>
                  c.assigned_user === form.assigned_user
                )}
              />
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="cc-right">
            <div className="cc-right-card">

              <SelectField
                label="Assigned User"
                required
                value={form.assigned_user}
                options={users}
                onSelect={(o) => setForm((p) => ({
                  ...p,
                  assigned_user:    o?.name || "",
                  assigned_user_id: o?.id   || "",
                }))}
              />

              <div className="cc-right-gap">
                <SelectField
                  label="Teams"
                  value={form.teams}
                  options={teams}
                  onSelect={(o) => setForm((p) => ({
                    ...p, teams: o?.name || "", teams_id: o?.id || "",
                  }))}
                />
              </div>

              <div className="cc-attendees-header">Attendees</div>

              <div className="cc-right-gap">
                <SelectField
                  label="Users"
                  value={form.attendees_users}
                  options={users}
                  onSelect={(o) => setForm((p) => ({
                    ...p, attendees_users: o?.name || "",
                  }))}
                />
              </div>

              <div className="cc-right-gap">
                <SelectField
                  label="Contacts"
                  value={form.attendees_contacts}
                  options={contacts}
                  onSelect={(o) => setForm((p) => ({
                    ...p, attendees_contacts: o?.name || "",
                  }))}
                />
              </div>

              <div className="cc-right-gap">
                <SelectField
                  label="Leads"
                  value={form.attendees_leads}
                  options={leads}
                  onSelect={(o) => setForm((p) => ({
                    ...p, attendees_leads: o?.name || "",
                  }))}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateCall;