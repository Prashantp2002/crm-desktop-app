import { useState, useEffect } from "react";
import "../styles/teams.css";
import { getTeams } from "../api/teams";
import TeamsToolbar from "../components/teams/TeamsToolbar";
import TeamsTable   from "../components/teams/TeamsTable";

const Teams = () => {
  const [teams, setTeams]   = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="teams-page">
      <div className="teams-scroll">
        <div className="teams-header">
          <h2 className="teams-title">Teams</h2>
        </div>
        <TeamsToolbar
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
        />
        <TeamsTable teams={filtered} loading={loading} />
      </div>
    </div>
  );
};

export default Teams;