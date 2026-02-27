import React from "react";
import "./Dashboard.css";
import {
  FiHome,
  FiUsers,
  FiPhone,
  FiMail,
  FiCalendar,
  FiSearch,
  FiBell,
  FiSettings,
  FiPlus
} from "react-icons/fi";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-d">D</span> DigitalDose
        </div>

        <div className="menu-section">
          <p className="menu-title">Home</p>
          <div className="menu-item active"><FiHome /> Home</div>
        </div>

        <div className="menu-section">
          <p className="menu-heading">CRM</p>
          <div className="menu-item">Accounts</div>
          <div className="menu-item">Contacts</div>
          <div className="menu-item">Leads</div>
          <div className="menu-item">Opportunities</div>
          <div className="menu-item">Marketing</div>
        </div>

        <div className="menu-section">
          <p className="menu-heading">Activities</p>
          <div className="menu-item"><FiMail /> Emails</div>
          <div className="menu-item"><FiCalendar /> Calendar</div>
          <div className="menu-item">More</div>
        </div>

        <div className="menu-section">
          <p className="menu-heading">Support</p>
          <div className="menu-item">Cases</div>
          <div className="menu-item">Knowledge Base</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Top Header */}
        <div className="topbar">
          <h2>Dashboard</h2>

          <div className="topbar-right">
            <div className="search-box">
              <FiSearch />
              <input type="text" placeholder="Search" />
            </div>
            <FiPlus className="icon" />
            <FiBell className="icon" />
            <FiSettings className="icon" />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <span className="tab active">My Homepage</span>
          <span className="tab">My Sales</span>
          <span className="tab">Sales Analytics</span>
          <span className="tab">Call Center Data</span>
          <span className="tab">Sales Manager</span>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <p>Members</p>
            <h3>1,893</h3>
            <span className="down">1% this month</span>
          </div>

          <div className="summary-card">
            <p>Total Customers</p>
            <h3>1,000</h3>
            <span className="up">16% this month</span>
          </div>

          <div className="summary-card">
            <p>Active Now</p>
            <h3>189</h3>
          </div>
        </div>

        {/* Weekly Updates */}
        <h3 className="section-title">Weekly Updates</h3>

        <div className="weekly-grid">
          <div className="stat-box"><h2>24</h2><p><b>CALLS</b> received in last 7 days.</p></div>
          <div className="stat-box"><h2>18</h2><p><b>EMAILS</b> sent in last 7 days.</p></div>
          <div className="stat-box"><h2>136</h2><p><b>DEALS</b></p></div>
          <div className="stat-box"><h2>11</h2><p><b>CUSTOMERS</b></p></div>
          <div className="stat-box"><h2>9</h2><p>Repeated Customers</p></div>
          <div className="stat-box"><h2>87</h2><p>Average Deals</p></div>
          <div className="stat-box"><h2>55</h2><p>Estimated Calls</p></div>
          <div className="stat-box"><h2>10</h2><p>Pending Task</p></div>
        </div>

        {/* Bottom Panels */}
        <div className="bottom-panels">
          
          <div className="panel">
            <div className="panel-header">
              <h4>Tasks To Do</h4>
              <span>View All</span>
            </div>
            <ul>
              <li>Meeting with partners</li>
              <li>Web conference agenda</li>
              <li>Lunch with Steve</li>
              <li>Weekly meeting</li>
              <li>Add new services</li>
            </ul>
            <div className="add-task">Add new task →</div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h4>My Cases</h4>
            </div>
            <ul>
              <li>Discount issue - Pending</li>
              <li>IG issue - New</li>
              <li>Customer Reviews - Assigned</li>
              <li>Website Check - New</li>
            </ul>
            <div className="show-more">Show more →</div>
          </div>

        </div>

      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        <h4>Meetings</h4>
        <div className="meeting-card highlight">
          <h5>Pitch to Client</h5>
          <p>Google Meet</p>
          <span>Brooklyn Williamson</span>
        </div>

        <div className="meeting-card">
          <h5>Webinar</h5>
          <p>Teams</p>
          <span>Julie Watson</span>
        </div>

        <div className="meeting-card">
          <h5>Webinar</h5>
          <p>Teams</p>
          <span>Julie Watson</span>
        </div>
      </aside>

    </div>
  );
};

export default Dashboard;