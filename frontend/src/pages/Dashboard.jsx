import { useEffect, useState } from "react";

import TabsBar from "../components/layout/TabsBar";

import StatsCards from "../components/dashboard/StatsCards";
import WeeklyUpdates from "../components/dashboard/WeeklyUpdates";
import TasksToDo from "../components/dashboard/TasksToDo";
import MyCases from "../components/dashboard/MyCases";
import MeetingsSidebar from "../components/dashboard/MeetingsSidebar";

const Dashboard = () => {

  const [dashboardData, setDashboardData] = useState({
    global: {},
    user: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response = await fetch("http://127.0.0.1:5000/api/dashboard", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        const data = await response.json();

        console.log("Dashboard API Data:", data);

        setDashboardData(data);

      } catch (error) {

        console.error("Error fetching dashboard:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchDashboard();

  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const tasks = dashboardData.user.tasks_list || [];

  // ---------- Weekly Calendar Logic ----------

  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const days = [];

  for (let i = 0; i < 7; i++) {

    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    days.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      fullDate: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    });

  }

  // ------------------------------------------

  return (

    <div className="page-wrapper">

      {/* Tabs only for Dashboard */}
      <TabsBar />

      <div className="dashboard-page">

        {/* LEFT SIDE CONTENT */}
        <div className="dashboard-main">

          {/* Global Stats */}
          <StatsCards stats={dashboardData.global} />

          {/* Weekly Updates */}
          <WeeklyUpdates stats={dashboardData.user} />

          {/* Tasks + Cases */}
          <div className="tasks-cases-row">

            <TasksToDo tasks={tasks} />

            <MyCases cases={dashboardData.user.cases_list || []} />

          </div>

          {/* Weekly Calendar */}
          <div className="weekly-calendar">

            <h2 className="section-title">Weekly Calendar</h2>

            <div className="calendar-grid">

              {days.map((d, i) => {

                const taskForDay = tasks.find(t => t.date === d.fullDate);
                const isToday = d.date === today.getDate();

                return (

                  <div
                    key={i}
                    className={`calendar-day ${isToday ? "today" : ""} ${taskForDay ? "has-event" : ""}`}
                  >

                    <div className="calendar-day-name">{d.day}</div>

                    <div className="calendar-day-num">{d.date}</div>

                    {taskForDay && <div className="calendar-event-dot"></div>}

                    {taskForDay && (

                      <div className="calendar-hover-card">

                        <span className="hover-card-label">Task</span>

                        <strong>{taskForDay.title}</strong>

                        <p>{taskForDay.date}</p>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

        </div>

        {/* RIGHT SIDE MEETINGS */}
        <MeetingsSidebar meetings={dashboardData.user.meetings_list || []} />

      </div>

    </div>

  );

};

export default Dashboard;