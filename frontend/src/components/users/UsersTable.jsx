import { useNavigate } from "react-router-dom";

const ROLE_META = {
  admin:    { label: "Administrator", color: "#6366f1", bg: "#eef2ff" },
  employee: { label: "Employee",      color: "#0369a1", bg: "#e0f2fe" },
  client:   { label: "Client",        color: "#0a7c42", bg: "#dcf5e9" },
};

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

const UsersTable = ({ users, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="users-loading">
        <div className="users-spinner" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th className="u-col-check">
              <input type="checkbox" />
            </th>
            <th className="u-col-name">Name</th>
            <th className="u-col-username">User Name</th>
            <th className="u-col-title">Role</th>
            <th className="u-col-email">Email</th>
            <th className="u-col-active">Is Active</th>
            <th className="u-col-action"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const meta        = ROLE_META[u.role] || ROLE_META.employee;
            const avatarColor = getAvatarColor(u.fullname);

            return (
              <tr
                key={u.id}
                className="u-row"
                onClick={() => navigate("/users/" + u.id)}
              >
                <td className="u-col-check">
                  <input
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                <td className="u-col-name">
                  <div className="u-name-cell">
                    <div
                      className="u-avatar"
                      style={{ background: avatarColor }}
                    >
                      {getInitials(u.fullname)}
                    </div>
                    <span className="u-name-text">{u.fullname}</span>
                  </div>
                </td>

                <td className="u-col-username">
                  <span className="u-username">{u.username}</span>
                </td>

                <td className="u-col-title">
                  <span
                    className="u-role-badge"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </td>

                <td className="u-col-email">
                  <a
                    className="u-email"
                    href={"mailto:" + u.email}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {u.email || "—"}
                  </a>
                </td>

                <td className="u-col-active">
                  {u.is_active ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span style={{ color: "#d1d5db" }}>—</span>
                  )}
                </td>

                <td className="u-col-action">
                  <button
                    className="u-row-action"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="users-empty">
          <p>No users found</p>
        </div>
      )}

      <div className="users-footer">
        <span>{users.length} of {users.length} records</span>
      </div>
    </div>
  );
};

export default UsersTable;