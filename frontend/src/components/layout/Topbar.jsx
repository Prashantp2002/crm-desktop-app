import { Search, Plus, Bell, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const TopBar = () => {

  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();

  const path = location.pathname.replace("/", "");

  const pageName =
    path === "dashboard"
      ? "Dashboard"
      : path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <header style={{
      height: 60,
      width: "100%",
      boxSizing: "border-box",
      background: "#fff",
      borderBottom: "1px solid #eef0f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      gap: 16,
    }}>

      {/* Title / Breadcrumb */}
      <h1 style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: 22,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
        whiteSpace: "nowrap",
      }}>
        {path === "dashboard"
          ? "Dashboard"
          : `Dashboard > ${pageName}`}
      </h1>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

        {/* Search */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#f7f8fc",
          borderRadius: 8,
          border: "1px solid #eef0f5",
          overflow: "hidden",
          width: searchOpen ? 220 : 36,
          transition: "width 0.25s ease",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            style={iconBtn}
          >
            <Search size={16} />
          </button>

          {searchOpen && (
            <input
              autoFocus
              placeholder="Search..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#2c3e50",
                width: "100%",
                paddingRight: 10,
                fontFamily: "'Nunito', sans-serif",
              }}
            />
          )}
        </div>

        {/* Add */}
        <button style={iconBtn}>
          <Plus size={16} />
        </button>

        {/* Bell */}
        <button style={{ ...iconBtn, position: "relative" }}>
          <Bell size={16} />
          <span style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: "#c0392b",
            borderRadius: "50%",
            border: "2px solid #fff",
          }} />
        </button>

        {/* Settings */}
        <button style={iconBtn}>
          <Settings size={16} />
        </button>

      </div>
    </header>
  );
};

const iconBtn = {
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#95a5a6",
  borderRadius: 8,
  transition: "background 0.15s, color 0.15s",
  flexShrink: 0,
};

export default TopBar;