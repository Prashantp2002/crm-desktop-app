import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_META = {
  "New":        { color: "#0369a1", bg: "#e0f2fe" },
  "Assigned":   { color: "#4338ca", bg: "#ede9fe" },
  "In Process": { color: "#b45309", bg: "#fef3c7" },
  "Converted":  { color: "#0a7c42", bg: "#dcf5e9" },
  "Recycled":   { color: "#c0392b", bg: "#fdecea" },
  "Dead":       { color: "#6b7280", bg: "#f3f4f6" },
};

const LeadsTable = ({ leads, loading, search, onClearSearch, onSelectionChange }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [hovered, setHovered]   = useState(null);

  const allChecked = selected.size === leads.length && leads.length > 0;

  const toggleAll = () => {
    const next = allChecked ? new Set() : new Set(leads.map((_, i) => i));
    setSelected(next);
    onSelectionChange(next);
  };

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
    onSelectionChange(n);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner" />
        Loading leads...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="table-scroll">
        <table className="leads-table">
          <thead>
            <tr>
              <th className="col-check">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="col-name">Name</th>
              <th className="col-status">Status</th>
              <th className="col-phone">Phone</th>
              <th className="col-email">E-mail</th>
              <th className="col-country">Country</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => {
              const meta      = STATUS_META[lead.status] || STATUS_META["New"];
              const detailUrl = "/leads/" + lead.id;

              return (
                <tr
                  key={lead.id}
                  className={[
                    selected.has(i) ? "row-selected" : "",
                    hovered === i   ? "row-hovered"  : "",
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
                    <span className="lead-name">{lead.full_name || "—"}</span>
                  </td>

                  <td className="col-status">
                    <span
                      className="status-badge"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {lead.status || "New"}
                    </span>
                  </td>

                  <td className="col-phone">
                    <span className="lead-phone">{lead.phone || "—"}</span>
                  </td>

                  <td className="col-email">
                    <a
                      className="lead-email"
                      href={"mailto:" + lead.email}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lead.email || "—"}
                    </a>
                  </td>

                  <td className="col-country">
                    <span className="lead-country">
                      {lead.address_country || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="empty-state">
            <p>No leads found</p>
            {search && <button onClick={onClearSearch}>Clear search</button>}
          </div>
        )}
      </div>

      <div className="table-footer">
        <span>{leads.length} leads</span>
        {selected.size > 0 && (
          <button
            className="bulk-delete-btn"
            onClick={() => {
              setSelected(new Set());
              onSelectionChange(new Set());
            }}
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;