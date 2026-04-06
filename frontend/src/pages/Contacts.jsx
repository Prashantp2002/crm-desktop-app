import { useState, useEffect } from "react";
import "../styles/contacts.css";
import { getContacts } from "../api/contacts";
import ContactsToolbar from "../components/contacts/ContactsToolbar";
import ContactsTable   from "../components/contacts/ContactsTable";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getContacts();
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) =>
    [c.full_name, c.email, c.phone, c.account_name]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="contacts-page">
      <div className="contacts-scroll">

        <div className="contacts-header">
          <div className="contacts-title-row">
            <div className="contacts-title-accent" />
            <h2 className="contacts-title">Contacts</h2>
            <span className="contacts-count">{filtered.length}</span>
          </div>
        </div>

        <ContactsToolbar
          search={search}
          onSearch={setSearch}
        />

        <div className="table-wrapper">
          <ContactsTable
            contacts={filtered}
            loading={loading}
            search={search}
            onClearSearch={() => setSearch("")}
          />
        </div>

      </div>
    </div>
  );
};

export default Contacts;