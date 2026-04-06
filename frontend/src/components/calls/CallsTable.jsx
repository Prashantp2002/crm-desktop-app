import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_META = {
  "Planned":   { color: "#0369a1", bg: "#e0f2fe" },
  "Held":      { color: "#0a7c42", bg: "#dcf5e9" },
  "Not Held":  { color: "#6b7280", bg: "#f3f4f6" },
};

const DIRECTION_META = {
  "Outbound": { color: "#6366f1", bg: "#eef2ff" },
  "Inbound":  { color: "#f59e0b", bg: "#fffbeb" },
};

const CallsTable = ({ calls, loading, search, onClearSearch }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [hovered,  setHovered]  = useState(null);

  const allChecked = selected.size === calls.length && calls.length > 0;

  const toggleAll = () =>
    allChecked
      ? setSelected(new Set())
      : setSelected(new Set(calls.map((_, i) => i)));

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner" />
        Loading calls...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="table-scroll">
        <table className="calls-table">
          <thead>
            <tr>
              <th className="col-check">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="col-name">Name</th>
              <th className="col-status">Status</th>
              <th className="col-direction">Direction</th>
              <th className="col-date">Date Start</th>
              <th className="col-duration">Duration</th>
              <th className="col-assigned">Assigned User</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c, i) => {
              const sMeta = STATUS_META[c.status]    || STATUS_META["Planned"];
              const dMeta = DIRECTION_META[c.direction] || DIRECTION_META["Outbound"];

              return (
                <React.Fragment key={c.id}>
                  <tr
                    className={[
                      selected.has(i) ? "row-selected" : "",
                      hovered === i   ? "row-hovered"  : "",
                    ].join(" ")}
                    onClick={() => navigate("/calls/" + c.id)}
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
                      <span className="call-name">{c.name || "—"}</span>
                    </td>
                    <td className="col-status">
                      <span className="calls-badge"
                        style={{ background: sMeta.bg, color: sMeta.color }}>
                        {c.status || "Planned"}
                      </span>
                    </td>
                    <td className="col-direction">
                      <span className="calls-badge"
                        style={{ background: dMeta.bg, color: dMeta.color }}>
                        {c.direction || "Outbound"}
                      </span>
                    </td>
                    <td className="col-date">
                      <span className="call-date">
                        {c.date_start
                          ? c.date_start + (c.time_start ? " " + c.time_start : "")
                          : "—"}
                      </span>
                    </td>
                    <td className="col-duration">
                      <span className="call-duration">{c.duration || "—"}</span>
                    </td>
                    <td className="col-assigned">
                      <span className="call-assigned">{c.assigned_user || "—"}</span>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {calls.length === 0 && (
          <div className="empty-state">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p>No calls found</p>
            {search && <button onClick={onClearSearch}>Clear search</button>}
          </div>
        )}
      </div>

      <div className="table-footer">
        <span>{calls.length} calls</span>
        {selected.size > 0 && (
          <button className="bulk-delete-btn" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};

export default CallsTable;