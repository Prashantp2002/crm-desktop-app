import { useState, useEffect } from "react";
import "../styles/accounts.css";
import { getAccounts, createAccount } from "../api/accounts";
import AccountsToolbar from "../components/accounts/AccountsToolbar";
import AccountsTable   from "../components/accounts/AccountsTable";
import AddAccountModal from "../components/accounts/AddAccountModal";

const EMPTY_FORM = {
  name: "", website: "", industry: "", email: "", phone: "", type: "Customer",
  billing_street: "", billing_city: "", billing_state: "", billing_postal: "", billing_country: "",
  shipping_street: "", shipping_city: "", shipping_state: "", shipping_postal: "", shipping_country: "",
  assigned_user: "", description: "",
};

const Accounts = () => {
  const [accounts, setAccounts]     = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = accounts.filter((a) =>
    [a.name, a.website, a.industry, a.type, a.billing_country]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Account name is required";
    if (!form.type)        errs.type = "Please select a type";
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    try {
      setSaving(true);
      const res = await createAccount(form);
      setAccounts((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  return (
    <div className="accounts-page">
      <div className="accounts-scroll">

        {/* Header */}
        <div className="accounts-header">
          <div className="accounts-title-row">
            <div className="accounts-title-accent" />
            <h2 className="accounts-title">Accounts</h2>
            <span className="accounts-count">{filtered.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <AccountsToolbar
          search={search}
          onSearch={setSearch}
          onAdd={() => setShowModal(true)}
        />

        {/* Table */}
        <div className="table-wrapper">
          <AccountsTable
            accounts={filtered}
            loading={loading}
            search={search}
            onClearSearch={() => setSearch("")}
          />
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <AddAccountModal
          form={form}
          formErrors={formErrors}
          saving={saving}
          onChange={handleFormChange}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Accounts;