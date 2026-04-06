const INDUSTRIES = [
  "Apparel & Accessories", "Electronics", "Food & Beverage",
  "Healthcare", "Finance", "Technology", "Real Estate",
  "Education", "Manufacturing", "Retail", "Other",
];

const TYPES = ["Customer", "Partner", "Reseller", "Investor", "Prospect"];

const AddAccountModal = ({ form, formErrors, saving, onChange, onSave, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-title-accent" />
            <h3 className="modal-title">Add Account</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Basic Info */}
          <div className="form-section">
            <p className="form-section-label">Basic Information</p>
            <div className="form-grid-3">
              <div className="form-field">
                <label>Account Name <span className="required">*</span></label>
                <input name="name" value={form.name} onChange={onChange} placeholder="e.g. Acme Corp" className={formErrors.name ? "input-error" : ""} />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>
              <div className="form-field">
                <label>Website</label>
                <input name="website" value={form.website} onChange={onChange} placeholder="e.g. acme.com" />
              </div>
              <div className="form-field">
                <label>Industry</label>
                <select name="industry" value={form.industry} onChange={onChange}>
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid-3" style={{ marginTop: 12 }}>
              <div className="form-field">
                <label>Email</label>
                <input name="email" value={form.email} onChange={onChange} placeholder="contact@acme.com" />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="+91 9876543210" />
              </div>
              <div className="form-field">
                <label>Type <span className="required">*</span></label>
                <select name="type" value={form.type} onChange={onChange} className={formErrors.type ? "input-error" : ""}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {formErrors.type && <span className="field-error">{formErrors.type}</span>}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="form-section">
            <div className="form-address-grid">

              {/* Billing */}
              <div>
                <p className="form-section-label">Billing Address</p>
                <div className="form-field">
                  <label>Street</label>
                  <input name="billing_street" value={form.billing_street} onChange={onChange} placeholder="Street address" />
                </div>
                <div className="form-grid-3" style={{ marginTop: 10 }}>
                  <div className="form-field">
                    <label>City</label>
                    <input name="billing_city" value={form.billing_city} onChange={onChange} placeholder="City" />
                  </div>
                  <div className="form-field">
                    <label>State</label>
                    <input name="billing_state" value={form.billing_state} onChange={onChange} placeholder="State" />
                  </div>
                  <div className="form-field">
                    <label>Postal</label>
                    <input name="billing_postal" value={form.billing_postal} onChange={onChange} placeholder="Code" />
                  </div>
                </div>
                <div className="form-field" style={{ marginTop: 10 }}>
                  <label>Country</label>
                  <input name="billing_country" value={form.billing_country} onChange={onChange} placeholder="Country" />
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="form-section-label">Shipping Address</p>
                <div className="form-field">
                  <label>Street</label>
                  <input name="shipping_street" value={form.shipping_street} onChange={onChange} placeholder="Street address" />
                </div>
                <div className="form-grid-3" style={{ marginTop: 10 }}>
                  <div className="form-field">
                    <label>City</label>
                    <input name="shipping_city" value={form.shipping_city} onChange={onChange} placeholder="City" />
                  </div>
                  <div className="form-field">
                    <label>State</label>
                    <input name="shipping_state" value={form.shipping_state} onChange={onChange} placeholder="State" />
                  </div>
                  <div className="form-field">
                    <label>Postal</label>
                    <input name="shipping_postal" value={form.shipping_postal} onChange={onChange} placeholder="Code" />
                  </div>
                </div>
                <div className="form-field" style={{ marginTop: 10 }}>
                  <label>Country</label>
                  <input name="shipping_country" value={form.shipping_country} onChange={onChange} placeholder="Country" />
                </div>
              </div>

            </div>
          </div>

          {/* Additional */}
          <div className="form-section">
            <p className="form-section-label">Additional</p>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Assigned User</label>
                <input name="assigned_user" value={form.assigned_user} onChange={onChange} placeholder="Username or name" />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={onChange} placeholder="Notes about this account..." rows={3} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Account"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddAccountModal;