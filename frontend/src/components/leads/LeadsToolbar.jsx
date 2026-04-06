import { useNavigate } from "react-router-dom";

const LeadsToolbar = ({ search, onSearch, selected, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="leads-toolbar">
      <div className="search-wrapper">
        <svg className="search-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="search-box"
          placeholder="Search here"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={() => onSearch("")}>✕</button>}
      </div>

      <div className="toolbar-right">
        {selected.size > 0 && (
          <button className="delete-btn" onClick={onDelete}>
            Delete
          </button>
        )}
        <button className="add-btn" onClick={() => navigate("/leads/create")}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>
    </div>
  );
};

export default LeadsToolbar;