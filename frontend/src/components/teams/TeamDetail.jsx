import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeam, deleteTeam } from "../../api/teams";

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

const TeamDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [team, setTeam]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam(id)
      .then((res) => setTeam(res.data))
      .catch(() => setTeam(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this team?")) return;
    try {
      await deleteTeam(id);
      navigate("/teams");
    } catch {
      alert("Failed to delete team");
    }
  };

  if (loading) {
    return (
      <div className="td-loading">
        <div className="td-spinner" />
        Loading...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="td-loading">
        <p>Team not found.</p>
        <button onClick={() => navigate("/teams")}>Back to Teams</button>
      </div>
    );
  }

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
    <div className="td-page">
      <div className="td-scroll">

        {/* Breadcrumb */}
        <div className="td-topbar">
          <div className="td-breadcrumb">
            <span className="td-bc-link" onClick={() => navigate("/teams")}>Teams</span>
            <span className="td-bc-sep">›</span>
            <span className="td-bc-current">{team.name}</span>
          </div>
          <div className="td-topbar-actions">
            <button className="td-edit-btn">Edit</button>
            <button className="td-more-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div className="td-content">

          {/* ── LEFT ── */}
          <div className="td-left">

            {/* Main card */}
            <div className="td-card">
              <div className="td-grid">
                <div className="td-field td-field-full">
                  <span className="td-label">Name</span>
                  <span className="td-value">{team.name}</span>
                </div>
                <div className="td-field">
                  <span className="td-label">Roles</span>
                  <span className="td-value td-accent">{team.roles || "None"}</span>
                </div>
                <div className="td-field">
                  <span className="td-label">Position List</span>
                  <span className="td-value">{team.position_list || "None"}</span>
                </div>
                <div className="td-field">
                  <span className="td-label">Layout Set</span>
                  <span className="td-value">{team.layout_set || "None"}</span>
                </div>
                <div className="td-field">
                  <span className="td-label">Working Time Calendar</span>
                  <span className="td-value td-accent">
                    {team.working_time_calendar || "None"}
                  </span>
                </div>
                <div className="td-field td-field-full">
                  <span className="td-label">Description</span>
                  <span className="td-value">{team.description || "None"}</span>
                </div>
              </div>
            </div>

            {/* Users card */}
            <div className="td-card">
              <div className="td-card-header">
                <h3 className="td-section-title">Users</h3>
                <button className="td-card-more">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <table className="td-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>User Name</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {(team.users || []).map((u) => (
                    <tr
                      key={u.id}
                      className="td-user-row"
                      onClick={() => navigate("/users/" + u.id)}
                    >
                      <td>
                        <div className="td-user-name-cell">
                          <div
                            className="td-user-avatar"
                            style={{ background: getAvatarColor(u.fullname) }}
                          >
                            {getInitials(u.fullname)}
                          </div>
                          <span className="td-user-name-link">{u.fullname}</span>
                        </div>
                      </td>
                      <td><span className="td-user-username">{u.username}</span></td>
                      <td>
                        <button className="td-user-action">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="td-right">
            <div className="td-card">
              <div className="td-meta-row">
                <span className="td-meta-label">Created At</span>
                <span className="td-meta-value">{formatDate(team.created_at)}</span>
              </div>
              <div className="td-meta-row">
                <span className="td-meta-label">Created</span>
                <span className="td-meta-value">{formatDate(team.created_at)}</span>
              </div>
              <button className="td-delete-btn" onClick={handleDelete}>
                Delete Team
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamDetail;