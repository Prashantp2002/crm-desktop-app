import { Users, Monitor, TrendingDown, TrendingUp } from "lucide-react";

const StatsCards = ({ stats }) => {

  const data = {
    members: stats?.members ?? 0,
    customers: stats?.total_customers ?? 0,
    active: stats?.active_now ?? 0
  };

  return (
    <div className="stats-cards">

      {/* MEMBERS */}
      <div className="stat-card">
        <div className="stat-icon members-icon">
          <Users size={22} />
        </div>

        <div className="stat-info">
          <p className="stat-label">Members</p>

          <h3 className="stat-value">
            {data.members.toLocaleString()}
          </h3>

          <span className="stat-change negative">
            <TrendingDown size={12} />
            0% this month
          </span>
        </div>
      </div>

      {/* TOTAL CUSTOMERS */}
      <div className="stat-card">
        <div className="stat-icon customers-icon">
          <Users size={22} />
        </div>

        <div className="stat-info">
          <p className="stat-label">Total Customers</p>

          <h3 className="stat-value">
            {data.customers.toLocaleString()}
          </h3>

          <span className="stat-change positive">
            <TrendingUp size={12} />
            0% this month
          </span>
        </div>
      </div>

      {/* ACTIVE NOW */}
      <div className="stat-card">
        <div className="stat-icon active-icon">
          <Monitor size={22} />
        </div>

        <div className="stat-info">
          <p className="stat-label">Active Now</p>

          <h3 className="stat-value">
            {data.active}
          </h3>
        </div>
      </div>

    </div>
  );
};

export default StatsCards;