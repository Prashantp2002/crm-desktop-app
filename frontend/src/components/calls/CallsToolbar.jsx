import { useNavigate } from "react-router-dom";

const CallsToolbar = ({ search, onSearch }) => {
  const navigate = useNavigate();

  return (
    <div className="calls-toolbar">
      <div className="calls-toolbar-left">
        <div className="calls-search-wrap">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.2}
            style={{ color: "#9ba8c4", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="calls-search-input"
            placeholder="Search calls..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button className="calls-search-clear" onClick={() => onSearch("")}>✕</button>
          )}
        </div>
      </div>
      <button className="create-call-btn" onClick={() => navigate("/calls/create")}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Log Call
      </button>
    </div>
  );
};

export default CallsToolbar;