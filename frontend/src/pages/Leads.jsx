import { useState, useEffect } from "react";
import "../styles/leads.css";
import { getLeads, deleteLead } from "../api/leads";
import LeadsToolbar from "../components/leads/LeadsToolbar";
import LeadsTable   from "../components/leads/LeadsTable";

const Leads = () => {
  const [leads, setLeads]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await getLeads();
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter((l) =>
    [l.full_name, l.email, l.phone, l.address_country, l.status]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete selected leads?")) return;
    try {
      const ids = [...selected].map((i) => filtered[i].id);
      await Promise.all(ids.map((id) => deleteLead(id)));
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
      setSelected(new Set());
    } catch (err) {
      alert("Failed to delete leads");
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-scroll">

        <div className="leads-header">
          <div className="leads-title-row">
            <span className="leads-dot" />
            <h2 className="leads-title">Leads</h2>
          </div>
        </div>

        <LeadsToolbar
          search={search}
          onSearch={setSearch}
          selected={selected}
          onDelete={handleDelete}
        />

        <div className="table-wrapper">
          <LeadsTable
            leads={filtered}
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

export default Leads;