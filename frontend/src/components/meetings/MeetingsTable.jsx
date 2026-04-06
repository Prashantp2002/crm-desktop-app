import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_META = {
  "Planned":  { color: "#0369a1", bg: "#e0f2fe" },
  "Held":     { color: "#0a7c42", bg: "#dcf5e9" },
  "Not Held": { color: "#6b7280", bg: "#f3f4f6" },
};

const getInitials = (name) => {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1
    ? p[0].charAt(0).toUpperCase()
    : (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
};

const AVATAR_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#8b5cf6","#ec4899"];
const avatarColor   = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const MeetingsTable = ({ meetings, loading, search, onClearSearch }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [hovered,  setHovered]  = useState(null);

  const allChecked = selected.size === meetings.length && meetings.length > 0;

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(meetings.map((_, i) => i)));

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="mt-spinner" />
        Loading meetings...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="mt-table-scroll">
        <table className="mt-table">
          <thead>
            <tr>
              <th className="mt-col-check">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="mt-col-name">Name</th>
              <th className="mt-col-status">Status</th>
              <th className="mt-col-parent">Parent</th>
              <th className="mt-col-date">Date Start</th>
              <th className="mt-col-user">Assigned User</th>
              <th className="mt-col-action" />
            </tr>
          </thead>
          <tbody>
            {meetings.map((m, i) => {
              const meta = STATUS_META[m.status] || STATUS_META["Planned"];
              return (
                <React.Fragment key={m.id}>
                  <tr
                    className={[
                      selected.has(i) ? "row-selected" : "",
                      hovered === i   ? "row-hovered"  : "",
                    ].join(" ")}
                    onClick={() => navigate("/meetings/" + m.id)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="mt-col-check">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleRow(i)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="mt-col-name">
                      <span className="mt-name-link">{m.title || "—"}</span>
                    </td>
                    <td className="mt-col-status">
                      <span className="mt-badge"
                        style={{ background: meta.bg, color: meta.color }}>
                        {m.status || "Planned"}
                      </span>
                    </td>
                    <td className="mt-col-parent">
                      <span className="mt-parent">{m.parent_name || "—"}</span>
                    </td>
                    <td className="mt-col-date">
                      <span className="mt-date">
                        {m.date_start
                          ? m.date_start + (m.time_start ? " " + m.time_start : "")
                          : "—"}
                      </span>
                    </td>
                    <td className="mt-col-user">
                      {m.assigned_user ? (
                        <div className="mt-user-cell">
                          <div className="mt-avatar"
                            style={{ background: avatarColor(m.assigned_user) }}>
                            {getInitials(m.assigned_user)}
                          </div>
                          <span className="mt-user-name">{m.assigned_user}</span>
                        </div>
                      ) : <span className="mt-muted">—</span>}
                    </td>
                    <td className="mt-col-action">
                      <button className="mt-row-btn"
                        onClick={(e) => e.stopPropagation()}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {meetings.length === 0 && (
          <div className="mt-empty">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <p>No meetings found</p>
            {search && <button onClick={onClearSearch}>Clear search</button>}
          </div>
        )}
      </div>

      <div className="mt-footer">
        <span>{meetings.length} meetings</span>
        {selected.size > 0 && (
          <button className="mt-clear-btn" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingsTable;