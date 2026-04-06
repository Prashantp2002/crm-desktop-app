import { useNavigate } from "react-router-dom";

const MeetingsToolbar = ({ search, onSearch, filter, onFilter }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-toolbar">
      <div className="mt-toolbar-left">
        <div className="mt-filter-wrap">
          <select
            className="mt-filter-select"
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Planned">Planned</option>
            <option value="Held">Held</option>
            <option value="Not Held">Not Held</option>
          </select>
        </div>
        <div className="mt-search-wrap">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.2}
            style={{ color: "#9ba8c4", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="mt-search-input"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button className="mt-search-clear" onClick={() => onSearch("")}>✕</button>
          )}
        </div>
      </div>
      <button className="mt-create-btn" onClick={() => navigate("/meetings/create")}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Meeting
      </button>
    </div>
  );
};

export default MeetingsToolbar;