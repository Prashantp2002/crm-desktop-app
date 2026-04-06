import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../../api/tasks";
import { getUsers }    from "../../api/users";
import { getTeams }    from "../../api/teams";
import { getAccounts } from "../../api/accounts";
import { getContacts } from "../../api/contacts";
import { getLeads }    from "../../api/leads";

const STATUSES     = ["Planned","Not Started","In Process","Completed","Cancelled"];
const PRIORITIES   = ["Normal","High","Low"];
const PARENT_TYPES = ["Account","Lead","Contact","Opportunity","Case"];
const HOURS        = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2,"0") + ":00"
);

const today = new Date().toISOString().split("T")[0];
const nowH  = String(new Date().getHours()).padStart(2,"0") + ":00";
const endH  = String(Math.min(new Date().getHours() + 1, 23)).padStart(2,"0") + ":00";

const EMPTY = {
  title: "", status: "Planned", priority: "Normal",
  date_start: today, time_start: nowH,
  date_end:   today, time_end:   endH,
  description: "", attachment: "",
  parent_type: "Account", parent_name: "",
  assigned_user: "", assigned_user_id: "",
  teams: "",
};

const COLORS = ["#c0392b","#2980b9","#27ae60","#8e44ad","#e67e22","#16a085"];
const colorFor = (n = "") => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];

const normalize = (arr, nameField = "name") =>
  (Array.isArray(arr) ? arr : []).map((o) => ({
    ...o,
    name: o[nameField] || o.name || o.full_name || "",
  }));

/* ── Parent Modal ── */
const ParentModal = ({ type, options, onSelect, onClose }) => {
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    (o.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tk-modal-overlay" onClick={onClose}>
      <div className="tk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tk-modal-header">
          <h3>{type}s</h3>
          <button className="tk-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="tk-modal-search">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.2}
            style={{ color: "#9ba8c4", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="tk-modal-table">
          <div className="tk-modal-thead">
            <div>Name</div>
            <div>Address</div>
          </div>
          <div className="tk-modal-tbody">
            {filtered.length === 0 ? (
              <div className="tk-modal-empty">No results found</div>
            ) : (
              filtered.map((o) => (
                <div key={o.id} className="tk-modal-row"
                  onClick={() => { onSelect(o); onClose(); }}>
                  <div className="tk-modal-name">{o.name}</div>
                  <div className="tk-modal-addr">
                    {o.billing_city || o.address_city || o.account_name || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="tk-modal-footer">
          <button className="tk-modal-create">Create</button>
          <div className="tk-modal-footer-right">
            <button className="tk-modal-draft">Save as Draft</button>
            <button className="tk-modal-save">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── SelectField ── */
const SelectField = ({ label, required, value, onSelect, options, placeholder = "Select" }) => {
  const [open, setOpen]     = useState(false);
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
    (o.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tk-sf" ref={ref}>
      {label && (
        <label className="tk-label">
          {label}{required && <span className="tk-req"> *</span>}
        </label>
      )}
      <div className={"tk-sb" + (open ? " open" : "")}>
        <div className="tk-sd" onClick={() => setOpen((v) => !v)}>
          {value
            ? <span className="tk-sv">{value}</span>
            : <span className="tk-sp">{placeholder}</span>}
        </div>
        <div className="tk-sbtns">
          <button className="tk-sbtn" type="button"
            onClick={() => setOpen((v) => !v)}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          {value && (
            <button className="tk-sbtn tk-sbtn-clear" type="button"
              onClick={() => { onSelect(null); setSearch(""); }}>
              ✕
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="tk-drop">
          <input className="tk-drop-search" placeholder="Search..."
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div className="tk-drop-list">
            {filtered.length === 0
              ? <div className="tk-drop-empty">No results</div>
              : filtered.map((o, i) => (
                  <div key={o.id || i} className="tk-drop-item"
                    onClick={() => { onSelect(o); setOpen(false); setSearch(""); }}>
                    <div className="tk-drop-av" style={{ background: colorFor(o.name) }}>
                      {(o.name || "?").charAt(0).toUpperCase()}
                    </div>
                    {o.name}
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

/* ── CreateTask ── */
const CreateTask = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [users,    setUsers]    = useState([]);
  const [teams,    setTeams]    = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads,    setLeads]    = useState([]);

  useEffect(() => {
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

    getUsers().then((r) => setUsers(normalize(r.data, "fullname").map((u) => ({ ...u, avatar: "#c0392b" })))).catch(() => {});
    getTeams().then((r) => setTeams(normalize(r.data, "name"))).catch(() => {});
    getAccounts().then((r) => setAccounts(normalize(r.data, "name"))).catch(() => {});
    getContacts().then((r) => setContacts(normalize(r.data, "full_name"))).catch(() => {});
    getLeads().then((r) => setLeads(normalize(r.data, "full_name"))).catch(() => {});
  }, []);

  const parentOptions = {
    Account:     accounts,
    Contact:     contacts,
    Lead:        leads,
    Opportunity: [],
    Case:        [],
  }[form.parent_type] || [];

  const set = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createTask(form);
      navigate("/tasks");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tk-create-page">
      <div className="tk-create-scroll">

        {/* Breadcrumb */}
        <div className="tk-create-bc">
          <span className="tk-bc-link" onClick={() => navigate("/tasks")}>Task</span>
          <span className="tk-bc-sep">›</span>
          <span className="tk-bc-curr">Create</span>
        </div>

        <div className="tk-create-form">

          {/* Row 1: Name + Status + Assigned User */}
          <div className="tk-create-row tk-create-row-3">
            <div className="tk-cf">
              <label className="tk-label">Name</label>
              <input name="title" value={form.title} onChange={set}
                className={"tk-input" + (errors.title ? " tk-input-err" : "")}
                placeholder="Task name" />
              {errors.title && <span className="tk-err">{errors.title}</span>}
            </div>
            <div className="tk-cf">
              <label className="tk-label">Status</label>
              <select name="status" value={form.status} onChange={set} className="tk-select">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="tk-cf">
              <SelectField
                label="Assigned User"
                value={form.assigned_user}
                options={users}
                onSelect={(o) => setForm((p) => ({
                  ...p,
                  assigned_user:    o?.name || "",
                  assigned_user_id: o?.id   || "",
                }))}
              />
            </div>
          </div>

          {/* Row 2: Date Start + Date End + Teams */}
          <div className="tk-create-row tk-create-row-3">
            <div className="tk-cf">
              <label className="tk-label">Date Start</label>
              <div className="tk-dt-row">
                <div className="tk-date-wrap">
                  <select name="date_start" value={form.date_start}
                    onChange={set} className="tk-select tk-date-sel">
                    <option value={today}>{today}</option>
                    <option value="">Date</option>
                  </select>
                  <input name="date_start" type="date" value={form.date_start}
                    onChange={set} className="tk-input tk-date-input" />
                </div>
                <input name="time_start" type="time" value={form.time_start}
                  onChange={set} className="tk-input tk-time-input" />
              </div>
            </div>
            <div className="tk-cf">
              <label className="tk-label">Date End</label>
              <div className="tk-dt-row">
                <div className="tk-date-wrap">
                  <input name="date_end" type="date" value={form.date_end}
                    onChange={set} className="tk-input tk-date-input" />
                </div>
                <input name="time_end" type="time" value={form.time_end}
                  onChange={set} className="tk-input tk-time-input" />
              </div>
            </div>
            <div className="tk-cf">
              <SelectField
                label="Teams"
                value={form.teams}
                options={teams}
                onSelect={(o) => setForm((p) => ({ ...p, teams: o?.name || "" }))}
              />
            </div>
          </div>

          {/* Row 3: Attachment + Priority + Parent */}
          <div className="tk-create-row tk-create-row-3">
            <div className="tk-cf">
              <label className="tk-label">Attachment</label>
              <div className="tk-attach-wrap">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <input name="attachment" value={form.attachment} onChange={set}
                  className="tk-input tk-attach-input" placeholder="information.png" />
              </div>
            </div>
            <div className="tk-cf">
              <label className="tk-label">Priority</label>
              <select name="priority" value={form.priority} onChange={set}
                className="tk-select">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="tk-cf">
              <label className="tk-label">Parent</label>
              <div className="tk-parent-row">
                <select name="parent_type" value={form.parent_type} onChange={set}
                  className="tk-select tk-parent-type">
                  {PARENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  className="tk-parent-select-btn"
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  <span className="tk-parent-val">
                    {form.parent_name || "Select"}
                  </span>
                  <div className="tk-parent-btns">
                    <span className="tk-parent-icon">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </span>
                    {form.parent_name && (
                      <span className="tk-parent-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((p) => ({ ...p, parent_name: "" }));
                        }}>
                        ✕
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="tk-cf">
            <label className="tk-label">Description</label>
            <div className="tk-editor-toolbar">
              <span className="tk-tb">↩</span>
              <span className="tk-tb">↪</span>
              <span className="tk-tb-font">Sans Serif ∨</span>
              <span className="tk-tb-sep" />
              <span className="tk-tb tk-bold">B</span>
              <span className="tk-tb tk-italic-btn">I</span>
              <span className="tk-tb tk-ul">U</span>
              <div style={{ flex: 1 }} />
              <span className="tk-tb">−</span>
              <span className="tk-tb">⛶</span>
              <span className="tk-tb">✕</span>
            </div>
            <textarea name="description" value={form.description} onChange={set}
              className="tk-textarea" rows={5} />
          </div>

          {/* Actions */}
          <div className="tk-create-actions">
            <button className="tk-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="tk-cancel-btn" onClick={() => navigate("/tasks")}>
              Cancel
            </button>
          </div>

        </div>
      </div>

      {/* Parent Modal */}
      {showModal && (
        <ParentModal
          type={form.parent_type}
          options={parentOptions}
          onSelect={(o) => setForm((p) => ({ ...p, parent_name: o.name }))}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CreateTask;