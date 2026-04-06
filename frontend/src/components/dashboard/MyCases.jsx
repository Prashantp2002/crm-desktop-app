import React from "react";

const MyCases = ({ cases }) => {

  return (
    <div className="cases-card">

      <div className="cases-header">
        <h3>My Cases</h3>
      </div>

      <div className="cases-list">

        {cases && cases.length > 0 ? (

          cases.map((item) => (

            <div key={item.id} className="case-row">

              <div className="case-top">

                <span className="case-id">
                  #{item.id}
                </span>

                <span className="case-title">
                  {item.title}
                </span>

              </div>

              <div className="case-bottom">

                <span className={`badge status ${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>

                <span className={`badge priority ${item.priority?.toLowerCase()}`}>
                  {item.priority}
                </span>

              </div>

            </div>

          ))

        ) : (

          <p className="no-cases">
            No cases found
          </p>

        )}

      </div>

      <div className="cases-footer">
        Show more ▶
      </div>

    </div>
  );
};

export default MyCases;