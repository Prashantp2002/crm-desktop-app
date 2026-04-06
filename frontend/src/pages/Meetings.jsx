import { useState, useEffect } from "react";
import "../styles/meetings.css";
import { getMyMeetings } from "../api/meetings";
import MeetingsToolbar from "../components/meetings/MeetingsToolbar";
import MeetingsTable   from "../components/meetings/MeetingsTable";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
  try {
    setLoading(true);

    const data = await getMyMeetings();

    console.log("API DATA:", data);

    setMeetings(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error(
      "ERROR:",
      err.response?.data || err.message
    );

    setMeetings([]); 
  } finally {
    setLoading(false);
  }
};

  const filtered = (meetings || []).filter((m) => {
    const ms = filter === "all" || m.status === filter;
    const ss = [m.title, m.status, m.parent_name, m.assigned_user]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    return ms && ss;
  });

  return (
    <div className="mt-page">
      <div className="mt-scroll">
        <div className="mt-header">
          <h2 className="mt-title">Meetings</h2>
        </div>
        <MeetingsToolbar
          search={search} onSearch={setSearch}
          filter={filter} onFilter={setFilter}
        />
        <div className="mt-table-wrap">
          <MeetingsTable
            meetings={filtered} loading={loading}
            search={search} onClearSearch={() => setSearch("")}
          />
        </div>
      </div>
    </div>
  );
};

export default Meetings;