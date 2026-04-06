import { useState } from "react";
import { MoreVertical, Pencil, X } from "lucide-react";

const defaultTabs = [
  "My Homepage",
  "My Sales",
  "Sales Analytics",
  "Call Center Data",
  "Sales Manager",
];

const TabsBar = () => {
  const [activeTab, setActiveTab] = useState("My Homepage");
  const [tabs, setTabs] = useState(defaultTabs);
  const [editing, setEditing] = useState(false);

  const removeTab = (tab) => {
    const updated = tabs.filter((t) => t !== tab);
    setTabs(updated);
    if (activeTab === tab && updated.length > 0) setActiveTab(updated[0]);
  };

  return (
    <div style={{
      background: "#fff",
      borderBottom: "1px solid #eef0f5",
      display: "flex",
      alignItems: "center",
      gap: 0,
      overflowX: "auto",
      flexShrink: 0,
      padding: "0 16px",
      scrollbarWidth: "none",
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 16px",
              height: 46,
              background: "none",
              border: "none",
              borderBottom: isActive ? "2px solid #c0392b" : "2px solid transparent",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: isActive ? 700 : 600,
              color: isActive ? "#c0392b" : "#6b7280",
              whiteSpace: "nowrap",
              transition: "color 0.15s, border-color 0.15s",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {tab}
            {editing && (
              <X
                size={13}
                style={{ color: "#95a5a6", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); removeTab(tab); }}
              />
            )}
          </button>
        );
      })}

      {/* Right actions */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 2 }}>
        <button
          onClick={() => setEditing(!editing)}
          style={tabIconBtn}
          title="Edit tabs"
        >
          <Pencil size={15} />
        </button>
        <button style={tabIconBtn}>
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
};

const tabIconBtn = {
  width: 32, height: 32,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "none", border: "none", cursor: "pointer",
  color: "#95a5a6", borderRadius: 6,
};

export default TabsBar;