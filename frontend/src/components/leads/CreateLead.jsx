import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLead } from "../../api/leads";

const SALUTATIONS  = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const PHONE_TYPES  = ["Mobile", "Office", "Fax", "Other"];
const INDUSTRIES   = ["Agriculture", "Apparel & Accessories", "Electronics", "Finance", "Food & Beverage", "Healthcare", "Manufacturing", "Real Estate", "Retail", "Technology", "Other"];
const STATUSES     = ["New", "Assigned", "In Process", "Converted", "Recycled", "Dead"];
const SOURCES      = ["Call", "Email", "Existing customer", "Partner", "Public relation", "Website", "Campaign", "Others"];

const EMPTY_FORM = {
  salutation: "", first_name: "", last_name: "", account_name: "",
  email: "", phone: "", phone_type: "Mobile", website: "",
  address_street: "", address_city: "", address_state: "",
  address_postal: "", address_country: "", industry: "",
  status: "New", opportunity_amount: "", source: "",
  campaign: "", assigned_user: "", team: "", title: "", description: "",
};

const CreateLead = () => {
  const navigate     = useNavigate();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createLead(form);
      navigate("/leads");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cl-page">
      <div className="cl-scroll">

        {/* Breadcrumb */}
        <div className="cl-topbar">
          <div className="cl-breadcrumb">
            <span className="cl-breadcrumb-link" onClick={() => navigate("/leads")}>Leads</span>
            <span className="cl-breadcrumb-sep">›</span>
            <span className="cl-breadcrumb-current">Add Lead</span>
          </div>
          <button className="cl-back-btn" onClick={() => navigate("/leads")}>Back</button>
        </div>

        <div className="cl-body">

          {/* Row 1 — Name + Account */}
          <div className="cl-row">
            <div className="cl-field cl-field-name">
              <label>Name <span className="cl-required">*</span></label>
              <div className="cl-name-row">
                <select name="salutation" value={form.salutation} onChange={handleChange} className="cl-select cl-salutation">
                  <option value="">--</option>
                  {SALUTATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" className={"cl-input" + (errors.first_name ? " cl-input-error" : "")} />
                <input name="last_name"  value={form.last_name}  onChange={handleChange} placeholder="Last Name"  className="cl-input" />
              </div>
              {errors.first_name && <span className="cl-error">{errors.first_name}</span>}
            </div>
            <div className="cl-field">
              <label>Account Name</label>
              <input name="account_name" value={form.account_name} onChange={handleChange} placeholder="Account Name" className="cl-input" />
            </div>
          </div>

          {/* Row 2 — Email + Phone + Website */}
          <div className="cl-row cl-row-3">
            <div className="cl-field">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="cl-input" />
            </div>
            <div className="cl-field">
              <label>Phone</label>
              <div className="cl-phone-row">
                <select name="phone_type" value={form.phone_type} onChange={handleChange} className="cl-select cl-phone-type">
                  {PHONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="cl-input" />
              </div>
            </div>
            <div className="cl-field">
              <label>Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="Website" className="cl-input" />
            </div>
          </div>

          {/* Row 3 — Address + Industry + Status */}
          <div className="cl-address-section">
            <div className="cl-field cl-field-full">
              <label>Address</label>
              <input name="address_street" value={form.address_street} onChange={handleChange} placeholder="Street" className="cl-input" />
            </div>
            <div className="cl-row cl-row-3" style={{ marginTop: 10 }}>
              <input name="address_city"   value={form.address_city}   onChange={handleChange} placeholder="City"        className="cl-input" />
              <input name="address_state"  value={form.address_state}  onChange={handleChange} placeholder="State"       className="cl-input" />
              <input name="address_postal" value={form.address_postal} onChange={handleChange} placeholder="Postal Code" className="cl-input" />
            </div>
            <div className="cl-row" style={{ marginTop: 10 }}>
              <input name="address_country" value={form.address_country} onChange={handleChange} placeholder="Country" className="cl-input" />
              <div className="cl-field">
                <select name="industry" value={form.industry} onChange={handleChange} className="cl-select">
                  <option value="">Industry</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
            <div className="cl-row" style={{ marginTop: 10 }}>
              <div className="cl-field">
                <select name="status" value={form.status} onChange={handleChange} className="cl-select">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <input name="opportunity_amount" value={form.opportunity_amount} onChange={handleChange} placeholder="Opportunity Amount" className="cl-input" />
            </div>
          </div>

          {/* Row 4 — Assigned + Source + Team + Campaign */}
          <div className="cl-row">
            <div className="cl-field">
              <label>Assigned User</label>
              <input name="assigned_user" value={form.assigned_user} onChange={handleChange} placeholder="Assigned User" className="cl-input" />
            </div>
            <div className="cl-field">
              <select name="source" value={form.source} onChange={handleChange} className="cl-select">
                <option value="">Source</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="cl-row">
            <div className="cl-field">
              <input name="team" value={form.team} onChange={handleChange} placeholder="Teams" className="cl-input" />
            </div>
            <div className="cl-field">
              <input name="campaign" value={form.campaign} onChange={handleChange} placeholder="Campaign" className="cl-input" />
            </div>
          </div>

          {/* Description */}
          <div className="cl-field">
            <div className="cl-editor-toolbar">
              <span className="cl-toolbar-btn">↩</span>
              <span className="cl-toolbar-btn">↪</span>
              <span className="cl-toolbar-font">Sans Serif ∨</span>
              <span className="cl-toolbar-sep" />
              <span className="cl-toolbar-btn cl-bold">B</span>
              <span className="cl-toolbar-btn cl-italic">I</span>
              <span className="cl-toolbar-btn cl-underline">U</span>
              <div style={{ flex: 1 }} />
              <span className="cl-toolbar-btn">−</span>
              <span className="cl-toolbar-btn">⛶</span>
              <span className="cl-toolbar-btn">✕</span>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder=""
              className="cl-textarea"
              rows={4}
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="cl-footer">
        <div className="cl-footer-left">
          <button className="cl-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="cl-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m4.242-4.243a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button className="cl-footer-icon-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
        </div>
        <div className="cl-footer-right">
          <button className="cl-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLead;