import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
  Customer: { color: "#0a7c42", bg: "#dcf5e9", dot: "#22c55e" },
  Partner: { color: "#4338ca", bg: "#ede9fe", dot: "#818cf8" },
  Reseller: { color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  Investor: { color: "#0369a1", bg: "#e0f2fe", dot: "#38bdf8" },
  Prospect: { color: "#7c3aed", bg: "#f3e8ff", dot: "#a78bfa" },
};

const countryFlag = (country) => {
  const flags = {
    "United States": "🇺🇸",
    France: "🇫🇷",
    Germany: "🇩🇪",
    "United Kingdom": "🇬🇧",
    Poland: "🇵🇱",
    Italy: "🇮🇹",
    India: "🇮🇳",
  };
  return flags[country] || "🌐";
};

const AccountsTable = ({ accounts, loading, search, onClearSearch }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [hovered, setHovered] = useState(null);

  const allChecked =
    selected.size === accounts.length && accounts.length > 0;

  const toggleAll = () =>
    allChecked
      ? setSelected(new Set())
      : setSelected(new Set(accounts.map((_, i) => i)));

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  return (
    <>
      <div className="table-scroll">
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner" />
            Loading accounts...
          </div>
        ) : (
          <>
            <table className="accounts-table">
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
                  <th className="col-web">Website</th>
                  <th className="col-industry">Industry</th>
                  <th className="col-type">Type</th>
                  <th className="col-country">Country</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((acc, i) => {
                  const meta =
                    TYPE_META[acc.type] || TYPE_META.Customer;

                  const websiteUrl = "https://" + acc.website;
                  const detailUrl = "/accounts/" + acc.id;

                  return (
                    <tr
                      key={acc.id}
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
                            className="name-avatar"
                            style={{
                              background: meta.bg,
                              color: meta.color,
                            }}
                          >
                            {acc.name.charAt(0)}
                          </div>
                          <span className="name-text">
                            {acc.name}
                          </span>
                        </div>
                      </td>

                      <td className="col-web">
                        <a
                          className="website-link"
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.828 14.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          {acc.website}
                        </a>
                      </td>

                      <td className="col-industry">
                        <span className="industry-text">
                          {acc.industry}
                        </span>
                      </td>

                      <td className="col-type">
                        <span
                          className="type-badge"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                          }}
                        >
                          <span
                            className="type-dot"
                            style={{ background: meta.dot }}
                          />
                          {acc.type}
                        </span>
                      </td>

                      <td className="col-country">
                        <span className="country-cell">
                          <span className="country-flag">
                            {countryFlag(acc.billing_country)}
                          </span>
                          {acc.billing_country || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {accounts.length === 0 && (
              <div className="empty-state">
                <p>No accounts found</p>
                {search && (
                  <button onClick={onClearSearch}>
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="table-footer">
        <span>{accounts.length} accounts</span>
        {selected.size > 0 && (
          <button
            className="bulk-delete-btn"
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </button>
        )}
      </div>
    </>
  );
};

export default AccountsTable;