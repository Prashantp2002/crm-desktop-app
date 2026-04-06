import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/users";

const EMPTY_FORM = {
  username: "", fullname: "", title: "", email: "",
  phone: "", role: "employee", password: "", confirm_password: "",
};

const CreateUser = () => {
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
    if (!form.username.trim())  errs.username = "Username is required";
    if (!form.fullname.trim())  errs.fullname = "Full name is required";
    if (!form.password.trim())  errs.password = "Password is required";
    if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setSaving(true);
      await createUser({
        username: form.username,
        fullname: form.fullname,
        email:    form.email,
        phone:    form.phone,
        role:     form.role,
        password: form.password,
      });
      navigate("/users");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cu-page">
      <div className="cu-scroll">

        {/* Breadcrumb */}
        <div className="cu-topbar">
          <div className="cu-breadcrumb">
            <span className="cu-bc-link" onClick={() => navigate("/users")}>Users</span>
            <span className="cu-bc-sep">›</span>
            <span className="cu-bc-current">create</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="cu-actionbar">
          <button className="cu-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="cu-cancel-btn" onClick={() => navigate("/users")}>Cancel</button>
          <button className="cu-more-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="cu-body">

          {/* ── LEFT FORM ── */}
          <div className="cu-form">

            {/* Username */}
            <div className="cu-field-group">
              <label className="cu-label">
                User Name <span className="cu-req">*</span>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={"cu-input" + (errors.username ? " cu-input-err" : "")}
              />
              {errors.username && <span className="cu-err">{errors.username}</span>}
            </div>

            {/* Name row */}
            <div className="cu-field-row">
              <div className="cu-field-group">
                <label className="cu-label">
                  Name <span className="cu-req">*</span>
                </label>
                <div className="cu-name-row">
                  <select name="salutation" className="cu-select cu-sal">
                    <option value="">--</option>
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                  </select>
                  <input
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={"cu-input" + (errors.fullname ? " cu-input-err" : "")}
                  />
                </div>
                {errors.fullname && <span className="cu-err">{errors.fullname}</span>}
              </div>
              <div className="cu-field-group">
                <label className="cu-label">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="cu-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="cu-field-group">
              <label className="cu-label">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="cu-input"
              />
            </div>

            {/* Phone */}
            <div className="cu-field-group">
              <label className="cu-label">Phone</label>
              <div className="cu-phone-row">
                <select className="cu-select cu-phone-type">
                  <option>Mobile</option>
                  <option>Office</option>
                  <option>Home</option>
                  <option>Fax</option>
                </select>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="cu-input"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="cu-field-group">
              <label className="cu-label">Gender</label>
              <select name="gender" className="cu-select">
                <option value="">Not Set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Teams section */}
            <div className="cu-section-title">Teams and Access Control</div>

            <div className="cu-field-row">
              <div className="cu-field-group">
                <label className="cu-label">Type</label>
                <select name="role" value={form.role} onChange={handleChange} className="cu-select">
                  <option value="admin">Administrator</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="cu-field-group">
                <label className="cu-label">Is Active</label>
                <div className="cu-checkbox-wrap">
                  <input type="checkbox" defaultChecked className="cu-checkbox" />
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="cu-section-title">Password</div>

            <div className="cu-field-group">
              <label className="cu-label">
                Password <span className="cu-req">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={"cu-input" + (errors.password ? " cu-input-err" : "")}
              />
              {errors.password && <span className="cu-err">{errors.password}</span>}
            </div>

            <div className="cu-field-group">
              <label className="cu-label">Confirm Password</label>
              <input
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={handleChange}
                className={"cu-input" + (errors.confirm_password ? " cu-input-err" : "")}
              />
              {errors.confirm_password && <span className="cu-err">{errors.confirm_password}</span>}
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="cu-right">
            <div className="cu-right-card">
              <h3 className="cu-right-title">Avatar</h3>
              <div className="cu-avatar-placeholder">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 7l1-1a2 2 0 012.828 2.828L18 10.828" />
                </svg>
              </div>
              <div className="cu-field-group" style={{ marginTop: 12 }}>
                <label className="cu-label">Avatar Color</label>
                <input type="color" className="cu-color-input" defaultValue="#3b82f6" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateUser;