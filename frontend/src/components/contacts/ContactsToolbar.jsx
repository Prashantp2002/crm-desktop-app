import { useNavigate } from "react-router-dom";

const ContactsToolbar = ({ search, onSearch }) => {
  const navigate = useNavigate();

  return (
    <div className="contacts-toolbar">
      <div className="search-wrapper">
        <svg
          className="search-icon"
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="search-box"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => onSearch("")}>
            ✕
          </button>
        )}
      </div>

      <div className="toolbar-right">
        <button
          className="add-btn"
          onClick={() => navigate("/contacts/create")}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Contact
        </button>
      </div>
    </div>
  );
};

export default ContactsToolbar;