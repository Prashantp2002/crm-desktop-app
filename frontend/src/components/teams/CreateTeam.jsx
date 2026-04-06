import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teams";

const EMPTY_FORM = {
  name: "", roles: "", position_list: "",
  layout_set: "", working_time_calendar: "", description: "",
};

const CreateTeam = () => {
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
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setSaving(true);
      await createTeam(form);
      navigate("/teams");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ct-page">
      <div className="ct-scroll">

        {/* Breadcrumb */}
        <div className="ct-topbar">
          <div className="ct-breadcrumb">
            <span className="ct-bc-link" onClick={() => navigate("/teams")}>Teams</span>
            <span className="ct-bc-sep">›</span>
            <span className="ct-bc-current">create</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="ct-actionbar">
          <button className="ct-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="ct-cancel-btn" onClick={() => navigate("/teams")}>
            Cancel
          </button>
          <button className="ct-more-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="ct-form">

          {/* Name */}
          <div className="ct-field">
            <label className="ct-label">
              Name <span className="ct-req">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={"ct-input" + (errors.name ? " ct-input-err" : "")}
            />
            {errors.name && <span className="ct-err">{errors.name}</span>}
          </div>

          {/* Roles + Position List */}
          <div className="ct-row">
            <div className="ct-field">
              <label className="ct-label">Roles</label>
              <div className="ct-select-wrap">
                <input
                  name="roles"
                  value={form.roles}
                  onChange={handleChange}
                  placeholder="Select"
                  className="ct-input"
                />
                <button className="ct-select-arrow">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="ct-field">
              <label className="ct-label">Position List</label>
              <div className="ct-position-row">
                <input
                  name="position_list"
                  value={form.position_list}
                  onChange={handleChange}
                  placeholder="Type & press enter"
                  className="ct-input"
                />
                <button className="ct-add-btn">+</button>
              </div>
            </div>
          </div>

          {/* Layout Set + Working Time Calendar */}
          <div className="ct-row">
            <div className="ct-field">
              <label className="ct-label">Layout Set</label>
              <div className="ct-select-group">
                <input
                  name="layout_set"
                  value={form.layout_set}
                  onChange={handleChange}
                  placeholder="Select"
                  className="ct-input"
                />
                <button className="ct-icon-btn">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button className="ct-icon-btn ct-icon-btn-red">✕</button>
              </div>
            </div>
            <div className="ct-field">
              <label className="ct-label">Working Time Calendar</label>
              <div className="ct-select-group">
                <input
                  name="working_time_calendar"
                  value={form.working_time_calendar}
                  onChange={handleChange}
                  placeholder="Select"
                  className="ct-input"
                />
                <button className="ct-icon-btn">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button className="ct-icon-btn ct-icon-btn-red">✕</button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="ct-field">
            <label className="ct-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="ct-textarea"
              rows={4}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateTeam;