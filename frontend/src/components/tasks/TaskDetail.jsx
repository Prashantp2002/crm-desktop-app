import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTask, deleteTask } from "../../api/tasks";
import { updateTask } from "../../api/tasks";


const STATUS_META = {
  "Planned":     { color: "#0369a1", bg: "#e0f2fe" },
  "Not Started": { color: "#6b7280", bg: "#f3f4f6" },
  "In Process":  { color: "#b45309", bg: "#fef3c7" },
  "Completed":   { color: "#0a7c42", bg: "#dcf5e9" },
  "Cancelled":   { color: "#ef4444", bg: "#fef2f2" },
};

const PRIORITY_META = {
  "Normal": { color: "#374151", bg: "#f3f4f6" },
  "High":   { color: "#c0392b", bg: "#fdecea" },
  "Low":    { color: "#0369a1", bg: "#e0f2fe" },
};

const TaskDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [task, setTask]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    getTask(id)
      .then((r) => setTask(r.data))
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      navigate("/tasks");
    } catch { alert("Failed to delete"); }
  };

  if (loading) return (
    <div className="tk-loading"><div className="tk-spinner" /> Loading...</div>
  );

  if (!task) return (
    <div className="tk-loading">
      <p>Task not found.</p>
      <button onClick={() => navigate("/tasks")}>Back</button>
    </div>
  );

  const sMeta = STATUS_META[task.status]   || STATUS_META["Planned"];
  const pMeta = PRIORITY_META[task.priority] || PRIORITY_META["Normal"];

  const fmtDate = (d) => {
    if (!d) return "None";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric",
      });
    } catch { return d; }
  };

  const fmtDateTime = (d) => {
    if (!d) return "None";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  return (
    <div className="tk-detail-page">
      <div className="tk-detail-scroll">

        {/* Breadcrumb */}
        <div className="tk-detail-topbar">
          <div className="tk-bc">
            <span className="tk-bc-link" onClick={() => navigate("/tasks")}>Tasks</span>
            <span className="tk-bc-sep">›</span>
            <span className="tk-bc-curr">{task.title}</span>
          </div>
          <button className="tk-edit-btn">Edit</button>
        </div>

        <div className="tk-detail-content">

          {/* ── MAIN CARD ── */}
          <div className="tk-main-card">

            {/* Row 1: Name + Parent */}
            <div className="tk-detail-grid">
              <div className="tk-df">
                <span className="tk-dl">Name</span>
                <span className="tk-dv tk-dv-lg">{task.title || "—"}</span>
              </div>
              <div className="tk-df">
                <span className="tk-dl">Parent</span>
                <span className="tk-dv">{task.parent_name || "None"}</span>
              </div>

              <div className="tk-df">
                <span className="tk-dl">Status</span>
                <span className="tk-dv">{task.status || "—"}</span>
              </div>
              <div className="tk-df">
                <span className="tk-dl">Status</span>
                <span className="tk-badge"
                  style={{ background: sMeta.bg, color: sMeta.color }}>
                  {task.status}
                </span>
              </div>

              <div className="tk-df">
                <span className="tk-dl">Date Start</span>
                <span className="tk-dv">
                  {task.date_start
                    ? fmtDate(task.date_start + "T12:00:00")
                      + (task.time_start ? " " + task.time_start : "")
                    : "—"}
                </span>
              </div>
              <div className="tk-df">
                <span className="tk-dl">Date Due</span>
                <span className="tk-dv">
                  {task.date_end
                    ? fmtDate(task.date_end + "T12:00:00")
                      + (task.time_end ? " " + task.time_end : "")
                    : "—"}
                </span>
              </div>

              <div className="tk-df">
                <span className="tk-dl">Attachments</span>
                <span className="tk-dv tk-italic">{task.attachment || "None"}</span>
              </div>
              <div className="tk-df" />

              <div className="tk-df tk-df-full">
                <span className="tk-dl">Description</span>
                <span className="tk-dv tk-italic">{task.description || "None"}</span>
              </div>
            </div>

            {/* Timeline bar */}
            {(task.time_start || task.time_end) && (
              <div className="tk-timeline">
                <span className="tk-tl-start">{task.time_start || "—"}</span>
                <div className="tk-tl-bar">
                  <div className="tk-tl-fill" />
                </div>
                <span className="tk-tl-end">{task.time_end || "—"}</span>
                <span className="tk-tl-label">End</span>
              </div>
            )}

            {/* Meta row */}
            <div className="tk-meta-row">
              <div className="tk-mf">
                <span className="tk-ml">Assigned User</span>
                <span className="tk-mv tk-mv-accent">{task.assigned_user || "None"}</span>
              </div>
              <div className="tk-mf">
                <span className="tk-ml">Created</span>
                <span className="tk-mv">{fmtDateTime(task.created_at)}</span>
              </div>
              <div className="tk-mf">
                <span className="tk-ml">Team</span>
                <span className="tk-mv">{task.teams || "None"}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="tk-action-row">
              <button className="tk-edit-sm">Edit</button>
              <div className="tk-more-wrap">
                <button className="tk-more-sm"
                  onClick={() => setShowMore((v) => !v)}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <circle cx="5"  cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
                {showMore && (
                  <div className="tk-more-menu">
                    <button onClick={handleDelete}>Remove</button>
                    <button>Duplicate</button>
                    <button onClick={() => {
                      updateTask && navigate("/tasks");
                    }}>Complete</button>
                    <button>View Followers</button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="tk-right-card">
            <div className="tk-rs">
              <span className="tk-rl">Assigned User</span>
              <div className="tk-assigned-row">
                <div className="tk-av">
                  {task.assigned_user?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="tk-an">{task.assigned_user || "None"}</span>
              </div>
            </div>
            <div className="tk-divider" />
            <div className="tk-rs">
              <span className="tk-rl">Teams</span>
              <span className="tk-rv">{task.teams || "None"}</span>
            </div>
            <div className="tk-divider" />
            <div className="tk-rs">
              <span className="tk-rl">Created</span>
              <span className="tk-rv">{fmtDateTime(task.created_at)}</span>
            </div>
            <div className="tk-rs">
              <span className="tk-rl">Followers</span>
              <span className="tk-rv tk-rv-accent">{task.assigned_user || "None"}</span>
            </div>
            <div className="tk-divider" />
            <div className="tk-rs">
              <span className="tk-rl">Priority</span>
              <span className="tk-badge"
                style={{ background: pMeta.bg, color: pMeta.color }}>
                {task.priority || "Normal"}
              </span>
            </div>
          </div>

        </div>

        {/* Stream */}
        <div className="tk-stream-card">
          <h3 className="tk-stream-title">Stream</h3>
          <input className="tk-stream-input"
            placeholder="Write your comment here" />
        </div>

      </div>
    </div>
  );
};

export default TaskDetail;