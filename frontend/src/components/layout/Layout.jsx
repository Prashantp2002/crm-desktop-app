import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";

const Layout = () => {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-content">

        {/* Topbar is common */}
        <TopBar />

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default Layout;