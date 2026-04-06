import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContacts } from "../../api/contacts";
import "../../styles/contact-detail.css";

const getInitials = (fullName) => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const ContactDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res   = await getContacts();
        const found = res.data.find((c) => String(c.id) === String(id));
        setContact(found || null);
      } catch (err) {
        console.error("Failed to fetch contact", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  if (loading) {
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        Loading...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="cd-loading">
        <p>Contact not found.</p>
        <button className="cd-back-btn" onClick={() => navigate("/contacts")}>
          Back to Contacts
        </button>
      </div>
    );
  }

  const formatAddress = (...parts) =>
    parts.filter(Boolean).join(", ") || "None";

  return (
    <div className="cd-page">
      <div className="cd-scroll">

        {/* Breadcrumb */}
        <div className="cd-topbar">
          <div className="cd-breadcrumb">
            <span className="cd-dot" />
            <span
              className="cd-breadcrumb-link"
              onClick={() => navigate("/contacts")}
            >
              Contacts
            </span>
            <span className="cd-breadcrumb-sep">›</span>
            <span className="cd-breadcrumb-current">{contact.full_name}</span>
          </div>
          <button className="cd-edit-btn">Edit</button>
        </div>

        <div className="cd-content">

          {/* ── LEFT ── */}
          <div className="cd-left">

            {/* Overview */}
            <div className="cd-card">
              <h3 className="cd-card-title">Overview</h3>
              <div className="cd-grid">
                <div className="cd-field">
                  <span className="cd-label">Name</span>
                  <span className="cd-value">{contact.full_name || "None"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Accounts</span>
                  <span className="cd-value cd-value-accent">
                    {contact.account_name || "None"}
                  </span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Email</span>
                  <a className="cd-link" href={"mailto:" + contact.email}>
                    {contact.email || "None"}
                  </a>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Phone</span>
                  <span className="cd-value">{contact.phone || "None"}</span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Address</span>
                  <span className="cd-value">
                    {formatAddress(
                      contact.address_city,
                      contact.address_state,
                      contact.address_postal,
                      contact.address_country
                    )}
                  </span>
                </div>
                <div className="cd-field">
                  <span className="cd-label">Photo</span>
                  {contact.photo_url ? (
                    <img
                      src={contact.photo_url}
                      alt={contact.full_name}
                      className="cd-photo"
                    />
                  ) : (
                    <div className="cd-avatar-lg">
                      {getInitials(contact.full_name)}
                    </div>
                  )}
                </div>
                <div className="cd-field">
                  <span className="cd-label">Birthday</span>
                  <span className="cd-value">
                    {contact.dob
                      ? new Date(contact.dob).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "None"}
                  </span>
                </div>
                <div className="cd-field cd-field-full">
                  <span className="cd-label">Description</span>
                  <span className="cd-value">{contact.description || "None"}</span>
                </div>
              </div>
            </div>

            {/* Stream */}
            <div className="cd-card">
              <h3 className="cd-card-title">Stream</h3>
              <div className="cd-stream-input">
                <input
                  placeholder="Write your comment here"
                  className="cd-comment-input"
                />
              </div>
              <p className="cd-empty-section">No activity yet.</p>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="cd-right">

            {/* Assigned User */}
            <div className="cd-card">
              <h3 className="cd-card-section-title">Assigned User</h3>
              <div className="cd-assigned-row">
                <div className="cd-assigned-avatar">
                  {contact.assigned_to?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="cd-assigned-name">
                  {contact.assigned_to || "None"}
                </span>
              </div>
              <div className="cd-meta-row">
                <span className="cd-meta-label">Teams</span>
                <span className="cd-meta-value">{contact.team || "None"}</span>
              </div>
              <div className="cd-meta-row">
                <span className="cd-meta-label">Created</span>
                <span className="cd-meta-value">
                  {contact.created_at
                    ? new Date(contact.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="cd-meta-row">
                <span className="cd-meta-label">Followers</span>
                <span className="cd-meta-value cd-value-accent">
                  {contact.assigned_to || "None"}
                </span>
              </div>
            </div>

            {/* Activities */}
            <div className="cd-card">
              <h3 className="cd-card-section-title">Activities</h3>
              <p className="cd-empty-section">No activities yet.</p>
            </div>

            {/* History */}
            <div className="cd-card">
              <h3 className="cd-card-section-title">History</h3>
              <p className="cd-empty-section">No history yet.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactDetail;