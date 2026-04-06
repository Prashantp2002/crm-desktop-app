import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/tasks.css";
import { getTasks } from "../api/tasks";

const STATUS_META = {
  "Planned":     { color: "#0369a1", bg: "#e0f2fe" },
  "Not Started": { color: "#6b7280", bg: "#f3f4f6" },
  "In Process":  { color: "#b45309", bg: "#fef3c7" },
  "Completed":   { color: "#0a7c42", bg: "#dcf5e9" },
  "Cancelled":   { color: "#ef4444", bg: "#fef2f2" },
  "Pending":     { color: "#b45309", bg: "#fef3c7" },
};

/* ── Task Analysis ── */
const TaskAnalysis = ({ tasks }) => {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProcess = tasks.filter((t) => t.status === "In Process" || t.status === "Pending").length;
  const planned   = tasks.filter((t) => t.status === "Planned").length;

  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="tk-analysis">
      <div className="tk-analysis-header">
        <h3 className="tk-analysis-title">Task Analysis</h3>
      </div>
      <div className="tk-analysis-total">
        <span className="tk-at-label">Total Task</span>
        <span className="tk-at-num">{total}</span>
      </div>

      <div className="tk-venn">
        <div className="tk-venn-circle tk-venn-c1">
          <span>{pct(inProcess)}%</span>
        </div>
        <div className="tk-venn-circle tk-venn-c2">
          <span>{pct(completed)}%</span>
        </div>
        <div className="tk-venn-circle tk-venn-c3">
          <span>{pct(planned)}%</span>
        </div>
      </div>

      <div className="tk-venn-legend">
        <div className="tk-vl-item">
          <span className="tk-vl-dot" style={{ background: "#f8b4a8" }} />
          <span>Incomplete</span>
        </div>
        <div className="tk-vl-item">
          <span className="tk-vl-dot" style={{ background: "#a8d8b9" }} />
          <span>Completed</span>
        </div>
        <div className="tk-vl-item">
          <span className="tk-vl-dot" style={{ background: "#d4eaad" }} />
          <span>Planned</span>
        </div>
      </div>
    </div>
  );
};

/* ── Today's Tasks ── */
const TodaysTasks = ({ tasks }) => {
  const today      = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(
    (t) => t.date_end === today || t.date_start === today
  );
  const left = todayTasks.filter(
    (t) => t.status !== "Completed" && t.status !== "Cancelled"
  );

  return (
    <div className="tk-today">
      <div className="tk-today-header">
        <div>
          <span className="tk-today-label">Todays</span>
          <div className="tk-today-sub">
            <span className="tk-today-left">
              {String(left.length).padStart(2, "0")} Left
            </span>
          </div>
        </div>
        <div className="tk-today-count-wrap">
          <span className="tk-today-count">
            {String(todayTasks.length).padStart(2, "0")}
          </span>
          <span className="tk-today-total-label">Total Task</span>
        </div>
      </div>

      <ul className="tk-today-list">
        {left.slice(0, 5).map((t) => (
          <li key={t.id} className="tk-today-item">
            <span className="tk-today-dot" />
            {t.title}
          </li>
        ))}
        {left.length === 0 && (
          <li className="tk-today-empty">No pending tasks today 🎉</li>
        )}
      </ul>
    </div>
  );
};

/* ── Main Tasks Page ── */
const Tasks = () => {
  const navigate = useNavigate();
  const [tasks,    setTasks]    = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [hovered,  setHovered]  = useState(null);

  useEffect(() => {
    getTasks()
      .then((r) => setTasks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) =>
    [t.title, t.status, t.assigned_user]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const allChecked =
    selected.size === filtered.length && filtered.length > 0;

  const toggleAll = () =>
    setSelected(
      allChecked ? new Set() : new Set(filtered.map((_, i) => i))
    );

  const toggleRow = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  const fmtDate = (t) => {
    const d =
      t.date_end || (t.due_date ? t.due_date.split("T")[0] : null);
    if (!d) return "—";
    try {
      return (
        new Date(d + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) + (t.time_end ? " " + t.time_end : "")
      );
    } catch {
      return d;
    }
  };

  return (
    <div className="tk-page">
      <div className="tk-page-inner">

        {/* ── LEFT: table ── */}
        <div className="tk-left-panel">

          {/* Topbar */}
          <div className="tk-topbar">
            <h2 className="tk-page-title">Tasks</h2>
            <button
              className="tk-create-btn"
              onClick={() => navigate("/tasks/create")}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>

          {/* Search */}
          <div className="tk-toolbar">
            <div className="tk-search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.2}
                style={{ color: "#9ba8c4", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="tk-search-input"
                placeholder="Search here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="tk-result-count">
              {filtered.length} task{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="tk-table-wrap">
            {loading ? (
              <div className="tk-table-loading">
                <div className="tk-spinner" /> Loading tasks...
              </div>
            ) : (
              <>
                <table className="tk-table">
                  <thead>
                    <tr>
                      <th className="tk-tc-check">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleAll}
                        />
                      </th>
                      <th className="tk-tc-name">Name</th>
                      <th className="tk-tc-status">Status</th>
                      <th className="tk-tc-date">Date</th>
                      <th className="tk-tc-user">Assigned User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, i) => {
                      const meta =
                        STATUS_META[t.status] || STATUS_META["Not Started"];
                      return (
                        <tr
                          key={t.id}
                          className={[
                            selected.has(i) ? "tk-row-sel" : "",
                            hovered === i   ? "tk-row-hov" : "",
                          ].join(" ")}
                          onClick={() => navigate("/tasks/" + t.id)}
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(null)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="tk-tc-check">
                            <input
                              type="checkbox"
                              checked={selected.has(i)}
                              onChange={() => toggleRow(i)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="tk-tc-name">
                            <div className="tk-tname-wrap">
                              <span className="tk-tname-dot" />
                              <span className="tk-tname">{t.title || "—"}</span>
                            </div>
                          </td>
                          <td className="tk-tc-status">
                            <span
                              className="tk-tbadge"
                              style={{
                                background: meta.bg,
                                color: meta.color,
                              }}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="tk-tc-date">
                            <span className="tk-tdate">{fmtDate(t)}</span>
                          </td>
                          <td className="tk-tc-user">
                            {t.assigned_user ? (
                              <div className="tk-user-cell">
                                <div className="tk-user-av">
                                  {t.assigned_user.charAt(0).toUpperCase()}
                                </div>
                                <span className="tk-tuser">{t.assigned_user}</span>
                              </div>
                            ) : (
                              <span className="tk-tuser tk-tuser-empty">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="tk-empty">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks found</p>
                  </div>
                )}
              </>
            )}
          </div>

        </div>{/* /tk-left-panel */}

        {/* ── RIGHT: widgets ── */}
        <div className="tk-right-panel">
          <TaskAnalysis tasks={tasks} />
          <TodaysTasks  tasks={tasks} />
        </div>

      </div>
    </div>
  );
};

export default Tasks;