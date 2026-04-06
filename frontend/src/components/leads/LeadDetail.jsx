import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeads, deleteLead } from "../../api/leads";

const STATUS_META = {
  "New":        { color: "#0369a1", bg: "#e0f2fe" },
  "Assigned":   { color: "#4338ca", bg: "#ede9fe" },
  "In Process": { color: "#b45309", bg: "#fef3c7" },
  "Converted":  { color: "#0a7c42", bg: "#dcf5e9" },
  "Recycled":   { color: "#c0392b", bg: "#fdecea" },
  "Dead":       { color: "#6b7280", bg: "#f3f4f6" },
};

const LeadDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [lead, setLead]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res   = await getLeads();
        const found = res.data.find((l) => String(l.id) === String(id));
        setLead(found || null);
      } catch (err) {
        console.error("Failed to fetch lead", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await deleteLead(id);
      navigate("/leads");
    } catch (err) {
      alert("Failed to delete lead");
    }
  };

  if (loading) {
    return (
      <div className="ld-loading">
        <div className="ld-spinner" />
        Loading...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="ld-loading">
        <p>Lead not found.</p>
        <button className="ld-back-btn" onClick={() => navigate("/leads")}>Back to Leads</button>
      </div>
    );
  }

  const meta = STATUS_META[lead.status] || STATUS_META["New"];

  const formatAddress = (...parts) => parts.filter(Boolean).join(", ") || "None";

  return (
    <div className="ld-page">
      <div className="ld-scroll">

        {/* Breadcrumb */}
        <div className="ld-topbar">
          <div className="ld-breadcrumb">
            <span className="ld-dot" />
            <span className="ld-breadcrumb-link" onClick={() => navigate("/leads")}>Leads</span>
            <span className="ld-breadcrumb-sep">›</span>
            <span className="ld-breadcrumb-current">{lead.full_name}</span>
          </div>
          <div className="ld-topbar-actions">
            <button className="ld-edit-btn">Edit</button>
            <button className="ld-remove-btn" onClick={handleDelete}>Remove</button>
          </div>
        </div>

        <div className="ld-content">

          {/* ── LEFT ── */}
          <div className="ld-left">

            {/* Overview */}
            <div className="ld-card">
              <h3 className="ld-card-title">Overview</h3>
              <div className="ld-grid">
                <div className="ld-field">
                  <span className="ld-label">Name</span>
                  <span className="ld-value">{lead.full_name || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Account Name</span>
                  <span className="ld-value ld-value-accent">{lead.account_name || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Email</span>
                  <span className="ld-value">{lead.email || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Phone</span>
                  <span className="ld-value">{lead.phone || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Title</span>
                  <span className="ld-value">{lead.title || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Website</span>
                  {lead.website ? (
                    <a className="ld-link" href={"https://" + lead.website} target="_blank" rel="noreferrer">
                      {lead.website}
                    </a>
                  ) : (
                    <span className="ld-value">None</span>
                  )}
                </div>
                <div className="ld-field">
                  <span className="ld-label">Address</span>
                  <span className="ld-value">
                    {formatAddress(lead.address_street, lead.address_city, lead.address_state, lead.address_country)}
                  </span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Photo</span>
                  <span className="ld-value">None</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="ld-card">
              <h3 className="ld-card-title">Details</h3>
              <div className="ld-grid">
                <div className="ld-field">
                  <span className="ld-label">Status</span>
                  <span className="ld-status-badge" style={{ background: meta.bg, color: meta.color }}>
                    {lead.status || "New"}
                  </span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Source</span>
                  <span className="ld-value">{lead.source || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Opportunity Amount</span>
                  <span className="ld-value">{lead.opportunity_amount || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Campaign</span>
                  <span className="ld-value">{lead.campaign || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Industry</span>
                  <span className="ld-value">{lead.industry || "None"}</span>
                </div>
                <div className="ld-field">
                  <span className="ld-label">Description</span>
                  <span className="ld-value">{lead.description || "None"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="ld-right">

            <div className="ld-card">
              <h3 className="ld-card-section-title">Assigned User</h3>
              <div className="ld-assigned-row">
                <div className="ld-assigned-avatar">
                  {lead.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="ld-assigned-name">{lead.assigned_user || "None"}</span>
              </div>
              <div className="ld-meta-row">
                <span className="ld-meta-label">Teams</span>
                <span className="ld-meta-value">{lead.team || "None"}</span>
              </div>
              <div className="ld-meta-row">
                <span className="ld-meta-label">Created</span>
                <span className="ld-meta-value">
                  {lead.created_at
                    ? new Date(lead.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="ld-meta-row">
                <span className="ld-meta-label">Modified</span>
                <span className="ld-meta-value">
                  {lead.updated_at
                    ? new Date(lead.updated_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="ld-meta-row">
                <span className="ld-meta-label">Followers</span>
                <span className="ld-meta-value ld-value-accent">{lead.assigned_user || "None"}</span>
              </div>
            </div>

            <div className="ld-card">
              <h3 className="ld-card-section-title">Activities</h3>
              <p className="ld-empty-section">No activities yet.</p>
            </div>

            <div className="ld-card">
              <h3 className="ld-card-section-title">History</h3>
              <p className="ld-empty-section">No history yet.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetail;