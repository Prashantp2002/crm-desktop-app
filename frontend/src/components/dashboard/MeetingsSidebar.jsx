import { Video, User } from "lucide-react";

const MeetingsSidebar = ({ meetings = [] }) => {
  return (
    <div className="meetings-sidebar">

      <h3 className="meetings-title">Meetings</h3>

      <div className="meetings-list">

        {meetings.length > 0 ? (

          meetings.slice(0, 3).map((m, i) => (

            <div key={i} className="meeting-row">

              {/* TIME COLUMN */}
              <div className="meeting-time-col">
                <span className="meeting-time">{m.time || "--:--"}</span>
                <span className="meeting-date">{m.date || "--"}</span>
              </div>

              {/* UNIFORM CARD */}
              <div className="meeting-card">

                <p className="meeting-title">
                  {m.title || "Untitled Meeting"}
                </p>

                <p className="meeting-details">
                  {m.details || "No details available"}
                </p>

                <div className="meeting-meta">

                  <span className="meeting-platform">
                    <Video size={12} /> {m.platform || "N/A"}
                  </span>

                  <span className="meeting-person">
                    <User size={12} /> {m.person || "Unknown"}
                  </span>

                </div>

              </div>

            </div>

          ))

        ) : (

          <p className="no-meetings">No meetings scheduled</p>

        )}

      </div>

      <button className="show-all-btn">Show All →</button>

    </div>
  );
};

export default MeetingsSidebar;