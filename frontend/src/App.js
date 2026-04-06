import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Contacts from "./pages/Contacts";
import CreateContact from "./pages/CreateContact";   
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import AccountDetail from "./components/accounts/AccountDetail";
import ContactDetail from "./components/contacts/ContactDetail";
import Leads      from "./pages/Leads";
import CreateLead from "./components/leads/CreateLead";
import LeadDetail from "./components/leads/LeadDetail";
import Opportunities      from "./pages/Opportunities";
import CreateOpportunity  from "./components/opportunities/CreateOpportunity";
import OpportunityDetail  from "./components/opportunities/OpportunityDetail";
import Users      from "./pages/Users";
import UserDetail  from "./components/users/UserDetail";
import CreateUser  from "./components/users/CreateUser";
import Teams      from "./pages/Teams";
import TeamDetail  from "./components/teams/TeamDetail";
import CreateTeam  from "./components/teams/CreateTeam";
import Calls      from "./pages/Calls";
import CallDetail  from "./components/calls/CallDetail";
import CreateCall  from "./components/calls/CreateCall";
import CalendarPage from "./pages/Calendar";
import Meetings       from "./pages/Meetings";
import MeetingDetail  from "./components/meetings/MeetingDetail";
import CreateMeeting  from "./components/meetings/CreateMeeting";
import Tasks      from "./pages/Tasks";
import TaskDetail  from "./components/tasks/TaskDetail";
import CreateTask  from "./components/tasks/CreateTask";

import "./styles/dashboard.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>

            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/accounts"         element={<Accounts />} />
            <Route path="/contacts"         element={<Contacts />} />
            <Route path="/contacts/create"  element={<CreateContact />} />  
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/leads"         element={<Leads />} />
<Route path="/leads/create"  element={<CreateLead />} />
<Route path="/leads/:id"     element={<LeadDetail />} />
<Route path="/opportunities"         element={<Opportunities />} />
<Route path="/opportunities/create"  element={<CreateOpportunity />} />
<Route path="/opportunities/:id"     element={<OpportunityDetail />} />
<Route path="/users"         element={<Users />} />
<Route path="/users/create"  element={<CreateUser />} />
<Route path="/users/:id"     element={<UserDetail />} />
<Route path="/teams"         element={<Teams />} />
<Route path="/teams/create"  element={<CreateTeam />} />
<Route path="/teams/:id"     element={<TeamDetail />} />

<Route path="/calls"         element={<Calls />} />
<Route path="/calls/create"  element={<CreateCall />} />
<Route path="/calls/:id"     element={<CallDetail />} />
<Route path="/calendar" element={<CalendarPage />} />

<Route path="/meetings"         element={<Meetings />} />
<Route path="/meetings/create"  element={<CreateMeeting />} />
<Route path="/meetings/:id"     element={<MeetingDetail />} />
<Route path="/tasks"         element={<Tasks />} />
<Route path="/tasks/create"  element={<CreateTask />} />
<Route path="/tasks/:id"     element={<TaskDetail />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;