import { useState, useEffect } from "react";
import "../styles/users.css";
import { getUsers } from "../api/users";
import UsersToolbar from "../components/users/UsersToolbar";
import UsersTable   from "../components/users/UsersTable";

const Users = () => {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = [u.fullname, u.username, u.email, u.role]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="users-page">
      <div className="users-scroll">

        <div className="users-header">
          <h2 className="users-title">Users</h2>
        </div>

        <UsersToolbar
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
        />

        <UsersTable users={filtered} loading={loading} />

      </div>
    </div>
  );
};

export default Users;