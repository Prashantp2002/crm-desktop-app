import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccounts } from "../../api/accounts";
import "../../styles/account-detail.css";

const TYPE_META = {
  Customer: { color: "#0a7c42", bg: "#dcf5e9" },
  Partner:  { color: "#4338ca", bg: "#ede9fe" },
  Reseller: { color: "#b45309", bg: "#fef3c7" },
  Investor: { color: "#0369a1", bg: "#e0f2fe" },
  Prospect: { color: "#7c3aed", bg: "#f3e8ff" },
};

const AccountDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res   = await getAccounts();
        const found = res.data.find((a) => String(a.id) === String(id));
        setAccount(found || null);
      } catch (err) {
        console.error("Failed to fetch account", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-spinner" />
        Loading...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="ad-loading">
        <p>Account not found.</p>
        <button className="ad-back-btn" onClick={() => navigate("/accounts")}>
          Back to Accounts
        </button>
      </div>
    );
  }

  const meta = TYPE_META[account.type] || TYPE_META.Customer;

  const formatAddress = (...parts) =>
    parts.filter(Boolean).join(", ") || "None";

  return (
    <div className="ad-page">
      <div className="ad-scroll">

        {/* Breadcrumb */}
        <div className="ad-topbar">
          <div className="ad-breadcrumb">
            <span className="ad-dot" />
            <span className="ad-breadcrumb-link" onClick={() => navigate("/accounts")}>
              Accounts
            </span>
            <span className="ad-breadcrumb-sep">›</span>
            <span className="ad-breadcrumb-current">{account.name}</span>
          </div>
          <button className="ad-edit-btn">Edit</button>
        </div>

        <div className="ad-content">

          {/* ── LEFT ── */}
          <div className="ad-left">

            {/* Overview */}
            <div className="ad-card">
              <h3 className="ad-card-title">Overview</h3>
              <div className="ad-grid">
                <div className="ad-field">
                  <span className="ad-label">Name</span>
                  <span className="ad-value">{account.name || "None"}</span>
                </div>
                <div className="ad-field">
                  <span className="ad-label">Website</span>
                  {account.website ? (
                    <a className="ad-link" href={`https://${account.website}`} target="_blank" rel="noreferrer">
                      {account.website}
                    </a>
                  ) : (
                    <span className="ad-value">None</span>
                  )}
                </div>
                <div className="ad-field">
                  <span className="ad-label">Email</span>
                  <span className="ad-value">{account.email || "None"}</span>
                </div>
                <div className="ad-field">
                  <span className="ad-label">Phone</span>
                  <span className="ad-value">{account.phone || "None"}</span>
                </div>
                <div className="ad-field">
                  <span className="ad-label">Billing Address</span>
                  <span className="ad-value">
                    {formatAddress(
                      account.billing_street,
                      account.billing_city,
                      account.billing_state,
                      account.billing_postal,
                      account.billing_country
                    )}
                  </span>
                </div>
                <div className="ad-field">
                  <span className="ad-label">Shipping Address</span>
                  <span className="ad-value">
                    {formatAddress(
                      account.shipping_street,
                      account.shipping_city,
                      account.shipping_state,
                      account.shipping_postal,
                      account.shipping_country
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="ad-card">
              <h3 className="ad-card-title">Details</h3>
              <div className="ad-grid">
                <div className="ad-field">
                  <span className="ad-label">Type</span>
                  <span className="ad-type-badge" style={{ background: meta.bg, color: meta.color }}>
                    {account.type || "None"}
                  </span>
                </div>
                <div className="ad-field">
                  <span className="ad-label">Industry</span>
                  <span className="ad-value">{account.industry || "None"}</span>
                </div>
                <div className="ad-field ad-field-full">
                  <span className="ad-label">Description</span>
                  <span className="ad-value">{account.description || "None"}</span>
                </div>
              </div>
            </div>

            {/* Stream */}
            <div className="ad-card">
              <h3 className="ad-card-title">Stream</h3>
              <div className="ad-stream-input">
                <input
                  placeholder="Write your comment here"
                  className="ad-comment-input"
                />
              </div>
              <p className="ad-empty-section">No activity yet.</p>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="ad-right">

            {/* Assigned User */}
            <div className="ad-card">
              <h3 className="ad-card-section-title">Assigned User</h3>
              <div className="ad-assigned-row">
                <div className="ad-assigned-avatar">
                  {account.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="ad-assigned-name">
                  {account.assigned_user || "None"}
                </span>
              </div>
              <div className="ad-meta-row">
                <span className="ad-meta-label">Teams</span>
                <span className="ad-meta-value">None</span>
              </div>
              <div className="ad-meta-row">
                <span className="ad-meta-label">Created</span>
                <span className="ad-meta-value">
                  {account.created_at
                    ? new Date(account.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Activities */}
            <div className="ad-card">
              <h3 className="ad-card-section-title">Activities</h3>
              <p className="ad-empty-section">No activities yet.</p>
            </div>

            {/* History */}
            <div className="ad-card">
              <h3 className="ad-card-section-title">History</h3>
              <p className="ad-empty-section">No history yet.</p>
            </div>

            {/* Tasks */}
            <div className="ad-card">
              <h3 className="ad-card-section-title">Tasks</h3>
              <p className="ad-empty-section">No tasks yet.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountDetail;