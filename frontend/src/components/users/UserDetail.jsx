import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, deleteUser } from "../../api/users";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AVATAR_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e",
  "#14b8a6","#3b82f6","#8b5cf6","#ec4899",
];

const getAvatarColor = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const ROLE_META = {
  admin:    { label: "Administrator", color: "#6366f1", bg: "#eef2ff" },
  employee: { label: "Employee",      color: "#0369a1", bg: "#e0f2fe" },
  client:   { label: "Client",        color: "#0a7c42", bg: "#dcf5e9" },
};

const UserDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser(id)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      navigate("/users");
    } catch {
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="ud-loading">
        <div className="ud-spinner" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ud-loading">
        <p>User not found.</p>
        <button onClick={() => navigate("/users")}>Back to Users</button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.fullname);
  const meta        = ROLE_META[user.role] || ROLE_META.employee;

  const formatDate = (d) => {
    if (!d) return "None";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  return (
    <div className="ud-page">
      <div className="ud-scroll">

        {/* Breadcrumb */}
        <div className="ud-topbar">
          <div className="ud-breadcrumb">
            <span className="ud-bc-link" onClick={() => navigate("/users")}>Users</span>
            <span className="ud-bc-sep">›</span>
            <span className="ud-bc-current">{user.fullname}</span>
          </div>
          <div className="ud-topbar-actions">
            <button className="ud-edit-btn">Edit</button>
            <button className="ud-access-btn">Access</button>
            <button className="ud-more-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div className="ud-content">

          {/* ── LEFT ── */}
          <div className="ud-left">

            {/* Main fields */}
            <div className="ud-card">
              <div className="ud-grid">
                <div className="ud-field">
                  <span className="ud-label">User Name</span>
                  <span className="ud-value">{user.username || "None"}</span>
                </div>
                <div className="ud-field" />

                <div className="ud-field">
                  <span className="ud-label">Name</span>
                  <span className="ud-value">{user.fullname || "None"}</span>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Title</span>
                  <span className="ud-value">None</span>
                </div>

                <div className="ud-field">
                  <span className="ud-label">Email</span>
                  <a className="ud-link" href={"mailto:" + user.email}>{user.email || "None"}</a>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Phone</span>
                  <span className="ud-value">{user.phone || "None"}</span>
                </div>

                <div className="ud-field">
                  <span className="ud-label">Gender</span>
                  <span className="ud-value">Not Set</span>
                </div>
                <div className="ud-field" />
              </div>
            </div>

            {/* Teams & Access */}
            <div className="ud-card">
              <h3 className="ud-section-title">Teams and Access Control</h3>
              <div className="ud-grid">
                <div className="ud-field">
                  <span className="ud-label">Type</span>
                  <span className="ud-role-badge" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Is Active</span>
                  <div className="ud-checkbox-display">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Teams</span>
                  <span className="ud-value">None</span>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Default Team</span>
                  <span className="ud-value">None</span>
                </div>
                <div className="ud-field">
                  <span className="ud-label">Roles</span>
                  <span className="ud-value">None</span>
                </div>
              </div>
            </div>

            {/* Stream */}
            <div className="ud-card">
              <h3 className="ud-section-title">Stream</h3>
              <input className="ud-stream-input" placeholder={"Write a message to " + user.fullname} />
              <p className="ud-empty-section" style={{ marginTop: 12 }}>No activity yet.</p>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="ud-right">
            <div className="ud-card">
              <h3 className="ud-right-title">Avatar</h3>
              <div className="ud-avatar-lg" style={{ background: avatarColor }}>
                {getInitials(user.fullname)}
              </div>

              <div className="ud-right-meta">
                <div className="ud-meta-row">
                  <span className="ud-meta-label">Created At</span>
                  <span className="ud-meta-value">{formatDate(user.created_at)}</span>
                </div>
                <div className="ud-meta-row">
                  <span className="ud-meta-label">Last Access</span>
                  <span className="ud-meta-value">None</span>
                </div>
              </div>

              <button className="ud-delete-btn" onClick={handleDelete}>
                Delete User
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetail;