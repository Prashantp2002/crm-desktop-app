const WeeklyUpdates = ({ stats }) => {

  const defaultData = {
    calls: 0,
    emails: 0,
    deals: 0,
    customers: 0,
    repeatedCustomers: 0,
    averageDeals: 0,
    estimatedCalls: 0,
    pendingTask: 0,
  };

  const d = stats
    ? {
        calls: stats.calls ?? 0,
        emails: stats.emails ?? 0,
        deals: stats.deals ?? 0,
        customers: stats.customers ?? 0,
        repeatedCustomers: stats.repeated_customers ?? 0,
        averageDeals: stats.average_deals ?? 0,
        estimatedCalls: stats.estimated_calls ?? 0,
        pendingTask: stats.pending_tasks ?? 0,
      }
    : defaultData;

  const topCards = [
    { value: d.calls, label: "CALLS", sub: "received in last 7 days." },
    { value: d.emails, label: "EMAILS", sub: "sent in last 7 days." },
    { value: d.deals, label: "DEALS", sub: "" },
    { value: d.customers, label: "CUSTOMERS", sub: "" },
  ];

  const bottomCards = [
    { value: d.repeatedCustomers, label: "Repeated Customers" },
    { value: d.averageDeals, label: "Average Deals" },
    { value: d.estimatedCalls, label: "Estimated Calls" },
    { value: d.pendingTask, label: "Pending Task" },
  ];

  return (
    <div className="weekly-updates">

      <h2 className="section-title">Weekly Updates</h2>

      <div className="weekly-grid">

        {topCards.map((card, i) => (
          <div className="weekly-card top-card" key={i}>

            <span className="weekly-value">
              {card.value}
            </span>

            <span className="weekly-label highlight">
              {card.label}
            </span>

            {card.sub && (
              <span className="weekly-sub">
                {card.sub}
              </span>
            )}

          </div>
        ))}

        {bottomCards.map((card, i) => (
          <div className="weekly-card bottom-card" key={i}>

            <span className="weekly-value">
              {card.value}
            </span>

            <span className="weekly-label">
              {card.label}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
};

export default WeeklyUpdates;