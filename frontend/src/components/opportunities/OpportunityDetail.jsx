import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOpportunities, deleteOpportunity } from "../../api/opportunities";

const STATUS_META = {
  "Prospecting":  { color: "#0369a1", bg: "#e0f2fe" },
  "Qualification":{ color: "#4338ca", bg: "#ede9fe" },
  "Proposal":     { color: "#7c3aed", bg: "#f3e8ff" },
  "Negotiation":  { color: "#b45309", bg: "#fef3c7" },
  "Closed Won":   { color: "#0a7c42", bg: "#dcf5e9" },
  "Closed Lost":  { color: "#6b7280", bg: "#f3f4f6" },
  "New":          { color: "#c0392b", bg: "#fdecea" },
};

const OpportunityDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [opp, setOpp]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res   = await getOpportunities();
        const found = res.data.find((o) => String(o.id) === String(id));
        setOpp(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this opportunity?")) return;
    try {
      await deleteOpportunity(id);
      navigate("/opportunities");
    } catch {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="od-loading">
        <div className="od-spinner" />
        Loading...
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="od-loading">
        <p>Opportunity not found.</p>
        <button className="od-back-btn" onClick={() => navigate("/opportunities")}>Back</button>
      </div>
    );
  }

  const meta = STATUS_META[opp.stage] || STATUS_META["New"];

  const formatDate = (d) => {
    if (!d) return "None";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch { return d; }
  };

  return (
    <div className="od-page">
      <div className="od-scroll">

        {/* Breadcrumb */}
        <div className="od-topbar">
          <div className="od-breadcrumb">
            <span className="od-dot" />
            <span className="od-breadcrumb-link" onClick={() => navigate("/opportunities")}>
              Opportunities
            </span>
            <span className="od-breadcrumb-sep">›</span>
            <span className="od-breadcrumb-current">{opp.name}</span>
          </div>
          <div className="od-topbar-actions">
            <button className="od-edit-btn">Edit</button>
            <button className="od-remove-btn" onClick={handleDelete}>Remove</button>
          </div>
        </div>

        <div className="od-content">

          {/* ── LEFT ── */}
          <div className="od-left">
            <div className="od-card">
              <div className="od-grid">
                <div className="od-field">
                  <span className="od-label">Name</span>
                  <span className="od-value">{opp.name || "None"}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Account Name</span>
                  <span className="od-value od-value-accent">{opp.account_name || "None"}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Stage</span>
                  <span className="od-status-badge" style={{ background: meta.bg, color: meta.color }}>
                    {opp.stage || "None"}
                  </span>
                </div>
                <div className="od-field">
                  <span className="od-label">Amount</span>
                  <span className="od-value">{opp.amount ? "$" + opp.amount : "None"}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Probability, %</span>
                  <span className="od-value">{opp.probability || "None"}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Close Date</span>
                  <span className="od-value">{formatDate(opp.close_date)}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Contacts</span>
                  <span className="od-value">{opp.contacts || "None"}</span>
                </div>
                <div className="od-field">
                  <span className="od-label">Lead Source</span>
                  <span className="od-value">{opp.lead_source || "None"}</span>
                </div>
                <div className="od-field od-field-full">
                  <span className="od-label">Description</span>
                  <span className="od-value">{opp.description || "None"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="od-right">
            <div className="od-card">
              <h3 className="od-card-section-title">Assigned User</h3>
              <div className="od-assigned-row">
                <div className="od-assigned-avatar">
                  {opp.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="od-assigned-name">{opp.assigned_user || "None"}</span>
              </div>
              <div className="od-meta-row">
                <span className="od-meta-label">Teams</span>
                <span className="od-meta-value">{opp.team || "None"}</span>
              </div>
              <div className="od-meta-row">
                <span className="od-meta-label">Created</span>
                <span className="od-meta-value">
                  {opp.created_at
                    ? new Date(opp.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="od-meta-row">
                <span className="od-meta-label">Modified</span>
                <span className="od-meta-value">
                  {opp.updated_at
                    ? new Date(opp.updated_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="od-meta-row">
                <span className="od-meta-label">Followers</span>
                <span className="od-meta-value od-value-accent">{opp.assigned_user || "None"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;