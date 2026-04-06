
import { useState, useEffect } from "react";
import "../styles/calls.css";
import { getCalls } from "../api/calls";
import CallsToolbar from "../components/calls/CallsToolbar";
import CallsTable   from "../components/calls/CallsTable";

const Calls = () => {
  const [calls, setCalls]   = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCalls(); }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const res = await getCalls();
      setCalls(res.data);
    } catch (err) {
      console.error("Failed to fetch calls", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = calls.filter((c) =>
    [c.name, c.status, c.direction, c.assigned_user]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="calls-page">
      <div className="calls-scroll">
        <div className="calls-header">
          <div className="calls-title-row">
            <span className="calls-dot" />
            <h2 className="calls-title">Calls</h2>
          </div>
        </div>
        <CallsToolbar search={search} onSearch={setSearch} />
        <div className="table-wrapper">
          <CallsTable
            calls={filtered}
            loading={loading}
            search={search}
            onClearSearch={() => setSearch("")}
          />
        </div>
      </div>
    </div>
  );
};

export default Calls;