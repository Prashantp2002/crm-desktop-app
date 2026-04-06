import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOpportunity } from "../../api/opportunities";
import { getAccounts } from "../../api/accounts";

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const LEAD_SOURCES = ["Call", "Email", "Existing Customer", "Partner", "Public Relation", "Website", "Campaign", "Others"];

const EMPTY_FORM = {
  name: "", account_name: "", stage: "Prospecting", amount: "",
  probability: "", close_date: "", contacts: "", lead_source: "",
  assigned_user: "", team: "", email: "", phone: "",
  address_country: "", description: "",
};

const CreateOpportunity = () => {
  const navigate      = useNavigate();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    getAccounts()
      .then((res) => setAccounts(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createOpportunity(form);
      navigate("/opportunities");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save opportunity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="co-page">
      <div className="co-scroll">

        {/* Breadcrumb */}
        <div className="co-topbar">
          <div className="co-breadcrumb">
            <span className="co-breadcrumb-link" onClick={() => navigate("/opportunities")}>
              Opportunities
            </span>
            <span className="co-breadcrumb-sep">›</span>
            <span className="co-breadcrumb-current">Create</span>
          </div>
          <button className="co-back-btn" onClick={() => navigate("/opportunities")}>Back</button>
        </div>

        <div className="co-body">

          {/* Row 1 — Name + Account */}
          <div className="co-row">
            <div className="co-field">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className={"co-input" + (errors.name ? " co-input-error" : "")}
              />
              {errors.name && <span className="co-error">{errors.name}</span>}
            </div>
            <div className="co-field">
              <select name="account_name" value={form.account_name} onChange={handleChange} className="co-select">
                <option value="">Account</option>
                {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 — Stage + Amount */}
          <div className="co-row">
            <div className="co-field">
              <select name="stage" value={form.stage} onChange={handleChange} className="co-select">
                <option value="">Stage</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="co-field">
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="co-input"
              />
            </div>
          </div>

          {/* Row 3 — Probability + Close Date */}
          <div className="co-row">
            <div className="co-field">
              <input
                name="probability"
                value={form.probability}
                onChange={handleChange}
                placeholder="Probability"
                className="co-input"
              />
            </div>
            <div className="co-field">
              <input
                name="close_date"
                type="date"
                value={form.close_date}
                onChange={handleChange}
                className="co-input co-date"
              />
            </div>
          </div>

          {/* Row 4 — Contacts + Lead Source */}
          <div className="co-row">
            <div className="co-field">
              <input
                name="contacts"
                value={form.contacts}
                onChange={handleChange}
                placeholder="Contacts"
                className="co-input"
              />
            </div>
            <div className="co-field">
              <select name="lead_source" value={form.lead_source} onChange={handleChange} className="co-select">
                <option value="">Lead Source</option>
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 5 — Assigned User + Teams */}
          <div className="co-row">
            <div className="co-field">
              <input
                name="assigned_user"
                value={form.assigned_user}
                onChange={handleChange}
                placeholder="Assigned User"
                className="co-input"
              />
            </div>
            <div className="co-field">
              <input
                name="team"
                value={form.team}
                onChange={handleChange}
                placeholder="Teams"
                className="co-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="co-field">
            <div className="co-editor-toolbar">
              <span className="co-toolbar-btn">↩</span>
              <span className="co-toolbar-btn">↪</span>
              <span className="co-toolbar-font">Sans Serif ∨</span>
              <span className="co-toolbar-sep" />
              <span className="co-toolbar-btn co-bold">B</span>
              <span className="co-toolbar-btn co-italic">I</span>
              <span className="co-toolbar-btn co-underline">U</span>
              <div style={{ flex: 1 }} />
              <span className="co-toolbar-btn">−</span>
              <span className="co-toolbar-btn">⛶</span>
              <span className="co-toolbar-btn">✕</span>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder=""
              className="co-textarea"
              rows={4}
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="co-footer">
        <div className="co-footer-left">
          <button className="co-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="co-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m4.242-4.243a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button className="co-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
        </div>
        <div className="co-footer-right">
          <button className="co-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOpportunity;