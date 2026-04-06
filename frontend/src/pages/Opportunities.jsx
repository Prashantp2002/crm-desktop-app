import { useState, useEffect } from "react";
import "../styles/opportunities.css";
import { getOpportunities, deleteOpportunity } from "../api/opportunities";
import OpportunitiesToolbar from "../components/opportunities/OpportunitiesToolbar";
import OpportunitiesTable   from "../components/opportunities/OpportunitiesTable";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(new Set());

  useEffect(() => { fetchOpportunities(); }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await getOpportunities();
      setOpportunities(res.data);
    } catch (err) {
      console.error("Failed to fetch opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = opportunities.filter((o) =>
    [o.name, o.email, o.phone, o.address_country, o.stage]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete selected opportunities?")) return;
    try {
      const ids = [...selected].map((i) => filtered[i].id);
      await Promise.all(ids.map((id) => deleteOpportunity(id)));
      setOpportunities((prev) => prev.filter((o) => !ids.includes(o.id)));
      setSelected(new Set());
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="opp-page">
      <div className="opp-scroll">

        <div className="opp-header">
          <div className="opp-title-row">
            <span className="opp-dot" />
            <h2 className="opp-title">Opportunities</h2>
          </div>
        </div>

        <OpportunitiesToolbar
          search={search}
          onSearch={setSearch}
          selected={selected}
          onDelete={handleDelete}
        />

        <div className="table-wrapper">
          <OpportunitiesTable
            opportunities={filtered}
            loading={loading}
            search={search}
            onClearSearch={() => setSearch("")}
            onSelectionChange={setSelected}
          />
        </div>

      </div>
    </div>
  );
};

export default Opportunities;