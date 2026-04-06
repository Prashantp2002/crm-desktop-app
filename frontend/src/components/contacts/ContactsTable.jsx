import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const getInitials = (fullName) => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const AVATAR_COLORS = [
  { bg: "#dcf5e9", color: "#0a7c42" },
  { bg: "#ede9fe", color: "#4338ca" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#f3e8ff", color: "#7c3aed" },
  { bg: "#fdecea", color: "#c0392b" },
];

const getAvatarColor = (name) => {
  const idx =
    (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const ContactsTable = ({
  contacts,
  loading,
  search,
  onClearSearch,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [hovered, setHovered] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const allChecked =
    selected.size === contacts.length &&
    contacts.length > 0;

  const toggleAll = () =>
    allChecked
      ? setSelected(new Set())
      : setSelected(new Set(contacts.map((_, i) => i)));

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  const toggleExpand = (i, e) => {
    e.stopPropagation();
    setExpanded(expanded === i ? null : i);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner" />
        Loading contacts...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      
      <div className="table-scroll">
        <table className="contacts-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th className="col-name">Name</th>
              <th className="col-account">Account</th>
              <th className="col-email">Email</th>
              <th className="col-phone">Phone</th>
              <th className="col-action"></th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((c, i) => {
              const fullName = c.full_name || "—";
              const avatarColor = getAvatarColor(c.full_name);
              const isExpanded = expanded === i;
              const detailUrl = "/contacts/" + c.id;

              return (
                <React.Fragment key={c.id}>
                  {/* MAIN ROW */}
                  <tr
                    className={[
                      selected.has(i) ? "row-selected" : "",
                      hovered === i ? "row-hovered" : "",
                    ].join(" ")}
                    onClick={() => navigate(detailUrl)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleRow(i)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    <td className="col-name">
                      <div className="name-cell">
                        <div
                          className="contact-avatar"
                          style={{
                            background: avatarColor.bg,
                            color: avatarColor.color,
                          }}
                        >
                          {getInitials(c.full_name)}
                        </div>
                        <div className="contact-name-info">
                          <span className="name-text">{fullName}</span>
                          {c.assigned_to && (
                            <span className="contact-title">
                              {c.assigned_to}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="col-account">
                      <span className="account-text">
                        {c.account_name || "—"}
                      </span>
                    </td>

                    <td className="col-email">
                      <a
                        className="email-link"
                        href={"mailto:" + c.email}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.email || "—"}
                      </a>
                    </td>

                    <td className="col-phone">
                      <span className="phone-text">
                        {c.phone || "—"}
                      </span>
                    </td>

                    <td className="col-action">
                      <button
                        className={
                          "expand-btn" +
                          (isExpanded ? " expanded" : "")
                        }
                        onClick={(e) => toggleExpand(i, e)}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED ROW */}
                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <div className="expanded-content">
                          <div className="expanded-item">
                            <span className="expanded-label">Phone</span>
                            <span className="expanded-value">{c.phone || "—"}</span>
                          </div>

                          <div className="expanded-item">
                            <span className="expanded-label">City</span>
                            <span className="expanded-value">{c.address_city || "—"}</span>
                          </div>

                          <div className="expanded-item">
                            <span className="expanded-label">Country</span>
                            <span className="expanded-value">{c.address_country || "—"}</span>
                          </div>

                          <div className="expanded-item">
                            <span className="expanded-label">Created</span>
                            <span className="expanded-value">
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {contacts.length === 0 && (
          <div className="empty-state">
            <p>No contacts found</p>
            {search && (
              <button onClick={onClearSearch}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <div className="table-footer">
        <span>{contacts.length} contacts</span>
        {selected.size > 0 && (
          <button
            className="bulk-delete-btn"
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactsTable;