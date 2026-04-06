import { useNavigate } from "react-router-dom";

const TeamsToolbar = ({ search, onSearch, filter, onFilter }) => {
  const navigate = useNavigate();

  return (
    <div className="teams-toolbar">
      <div className="teams-toolbar-left">
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
          >
            <option value="all">All</option>
          </select>
        </div>
        <div className="teams-search-wrap">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.2}
            style={{ color: "#9ba8c4", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="teams-search-input"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      <button className="create-team-btn" onClick={() => navigate("/teams/create")}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Team
      </button>
    </div>
  );
};

export default TeamsToolbar;