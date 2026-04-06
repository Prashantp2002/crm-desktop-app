import { useNavigate } from "react-router-dom";

const TeamsTable = ({ teams, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="teams-loading">
        <div className="teams-spinner" />
        Loading teams...
      </div>
    );
  }

  return (
    <div className="teams-table-wrap">
      <table className="teams-table">
        <thead>
          <tr>
            <th className="t-col-check">
              <input type="checkbox" />
            </th>
            <th className="t-col-name">Name</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr
              key={t.id}
              className="t-row"
              onClick={() => navigate("/teams/" + t.id)}
            >
              <td className="t-col-check">
                <input type="checkbox" onClick={(e) => e.stopPropagation()} />
              </td>
              <td className="t-col-name">
                <span className="t-name-link">{t.name}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {teams.length === 0 && (
        <div className="teams-empty">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <p>No teams found</p>
        </div>
      )}

      <div className="teams-footer">
        <span>{teams.length === 0 ? "0" : "1"}–{teams.length} / {teams.length}</span>
      </div>
    </div>
  );
};

export default TeamsTable;