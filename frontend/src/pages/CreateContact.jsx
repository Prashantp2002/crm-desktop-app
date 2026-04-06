import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createContact, getAccounts } from "../api/contacts";
import "../styles/create-contact.css";

const EMPTY_FORM = {
  full_name: "", email: "", dob: "", phone: "",
  address_city: "", address_state: "", address_postal: "",
  address_country: "", account_id: "", assigned_to: "",
  team: "", description: "", photo_url: "",
};

const CreateContact = () => {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);
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

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createContact({ ...form, photo_url: preview || "" });
      navigate("/contacts");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-contact-page">
      <div className="cc-scroll">
        <div className="cc-body">

          {/* ── LEFT ── */}
          <div className="cc-left">

            <div className="cc-field">
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Mr. Stanley Evans"
                className={`cc-input ${errors.full_name ? "cc-input-error" : ""}`}
              />
              {errors.full_name && <span className="cc-error">{errors.full_name}</span>}
            </div>

            <div className="cc-field">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="stanley.evans@mail.com"
                className="cc-input"
              />
            </div>

            <div className="cc-field">
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className="cc-input cc-date"
              />
            </div>

            <div className="cc-address-label">Address</div>
            <div className="cc-address-row">
              <input name="address_city"   value={form.address_city}   onChange={handleChange} placeholder="City"        className="cc-input" />
              <input name="address_state"  value={form.address_state}  onChange={handleChange} placeholder="State"       className="cc-input" />
              <input name="address_postal" value={form.address_postal} onChange={handleChange} placeholder="Postal Code" className="cc-input" />
            </div>

            <div className="cc-field">
              <input
                name="address_country"
                value={form.address_country}
                onChange={handleChange}
                placeholder="Country"
                className="cc-input"
              />
            </div>

            <div className="cc-field">
              <input
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                placeholder="Assigned to"
                className="cc-input"
              />
            </div>

            <div className="cc-field">
              <div className="cc-editor-toolbar">
                <span className="cc-toolbar-btn">↩</span>
                <span className="cc-toolbar-btn">↪</span>
                <span className="cc-toolbar-font">Sans Serif ∨</span>
                <span className="cc-toolbar-sep" />
                <span className="cc-toolbar-btn cc-bold">B</span>
                <span className="cc-toolbar-btn cc-italic">I</span>
                <span className="cc-toolbar-btn cc-underline">U</span>
                <span className="cc-toolbar-btn">≡∨</span>
                <span className="cc-toolbar-btn">☰</span>
                <span className="cc-toolbar-btn">≡</span>
                <div style={{ flex: 1 }} />
                <span className="cc-toolbar-btn">−</span>
                <span className="cc-toolbar-btn">⛶</span>
                <span className="cc-toolbar-btn">✕</span>
              </div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder=""
                className="cc-textarea"
                rows={5}
              />
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="cc-right">

            <div className="cc-photo-wrap">
              <div className="cc-photo-circle" onClick={() => fileRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="Contact" className="cc-photo-img" />
                ) : (
                  <div className="cc-photo-placeholder">
                    <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              <button className="cc-photo-add" onClick={() => fileRef.current?.click()}>Add new photo</button>
              {preview && <button className="cc-photo-remove" onClick={handleRemovePhoto}>Remove</button>}
            </div>

            <div className="cc-right-spacer" />

            {/* Phone */}
            <div className="cc-field cc-right-field">
              <div className="cc-input-chevron">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 124567890"
                  className="cc-input"
                />
                <svg className="cc-chevron" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Account — dropdown from DB */}
            <div className="cc-field cc-right-field">
              <div className="cc-select-wrapper">
                <select
                  name="account_id"
                  value={form.account_id}
                  onChange={handleChange}
                  className="cc-input cc-select"
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <svg className="cc-chevron" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Team */}
            <div className="cc-field cc-right-field">
              <input
                name="team"
                value={form.team}
                onChange={handleChange}
                placeholder="Teams"
                className="cc-input"
              />
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="cc-footer">
        <div className="cc-footer-left">
          <button className="cc-footer-icon-btn" title="Attachment">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="cc-footer-icon-btn" title="Link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m4.242-4.243a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button className="cc-footer-icon-btn" title="Emoji">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
        </div>
        <div className="cc-footer-right">
          <button className="cc-draft-btn" onClick={() => navigate("/contacts")} disabled={saving}>
            Save as Draft
          </button>
          <button className="cc-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContact;