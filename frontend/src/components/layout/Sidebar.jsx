import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users, UserCheck, TrendingUp, DollarSign,
  Megaphone, ListChecks, Mail, CalendarDays, Video,
  PhoneCall, CheckSquare2, LifeBuoy, BookMarked,
  MoreHorizontal, BarChart3, FolderKanban, ClipboardList,
  Building2, Zap, FileText, ShoppingBag, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Settings,
} from "lucide-react";

const crmItems = [
  { label: "Accounts",      path: "/accounts",      icon: Building2,  color: "#3b82f6", bg: "#eff6ff" },
  { label: "Contacts",      path: "/contacts",      icon: UserCheck,  color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "Leads",         path: "/leads",         icon: TrendingUp, color: "#f59e0b", bg: "#fffbeb" },
  { label: "Opportunities", path: "/opportunities", icon: DollarSign, color: "#10b981", bg: "#ecfdf5" },
];

const activityItems = [
  { label: "Emails",   path: "/emails",   icon: Mail,         color: "#6366f1", bg: "#eef2ff" },
  { label: "Calendar", path: "/calendar", icon: CalendarDays, color: "#ec4899", bg: "#fdf2f8" },
  { label: "Meetings", path: "/meetings", icon: Video,        color: "#14b8a6", bg: "#f0fdfa" },
  { label: "Calls",    path: "/calls",    icon: PhoneCall,    color: "#f97316", bg: "#fff7ed" },
  { label: "Tasks",    path: "/tasks",    icon: CheckSquare2, color: "#06b6d4", bg: "#ecfeff" },
];

const supportItems = [
  { label: "Cases",          path: "/cases",          icon: LifeBuoy,   color: "#ef4444", bg: "#fef2f2" },
  { label: "Knowledge Base", path: "/knowledge-base", icon: BookMarked, color: "#84cc16", bg: "#f7fee7" },
];

const moreSections = [
  {
    title: "Marketing",
    items: [
      { label: "Campaigns",    icon: Megaphone,    color: "#f97316", bg: "#fff7ed" },
      { label: "Target Lists", icon: ListChecks,   color: "#8b5cf6", bg: "#f5f3ff" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", icon: BarChart3, color: "#3b82f6", bg: "#eff6ff" },
    ],
  },
  {
    title: "Project Management",
    items: [
      { label: "Projects",      icon: FolderKanban,  color: "#10b981", bg: "#ecfdf5" },
      { label: "Project Tasks", icon: ClipboardList, color: "#14b8a6", bg: "#f0fdfa" },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        label: "Organization", icon: Building2, color: "#6366f1", bg: "#eef2ff",
        children: [
          { label: "Users", icon: Users },
          { label: "Teams", icon: Users },
        ],
      },
      {
        label: "Automation", icon: Zap, color: "#f59e0b", bg: "#fffbeb",
        children: [
          { label: "Stream",                 icon: BarChart3    },
          { label: "Global Stream",          icon: BarChart3    },
          { label: "Working Time Calendars", icon: CalendarDays },
        ],
      },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Documents",         icon: FileText,    color: "#ec4899", bg: "#fdf2f8" },
      { label: "Sales & Purchases", icon: ShoppingBag, color: "#06b6d4", bg: "#ecfeff" },
    ],
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .sb * { box-sizing: border-box; margin: 0; padding: 0; }

  .sb {
    --red:       #c0392b;
    --red-d:     #a93226;
    --red-bg:    rgba(192,57,43,0.08);
    --red-ring:  rgba(192,57,43,0.25);
    --border:    #eef0f8;
    --border-md: #e4e7f2;
    --bg:        #ffffff;
    --surface:   #f6f8ff;
    --surface2:  #eef1fb;
    --txt-1:     #0a0f1e;
    --txt-2:     #374151;
    --txt-3:     #6b7280;

    font-family: 'Inter', sans-serif;
    width: 232px; min-width: 232px;
    height: 100vh;
    background: var(--bg);
    border-right: 1.5px solid var(--border-md);
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    transition: width .3s cubic-bezier(.4,0,.2,1),
                min-width .3s cubic-bezier(.4,0,.2,1);
    box-shadow: 3px 0 20px rgba(10,15,30,0.06);
  }

  .sb.col { width: 68px; min-width: 68px; }

  .sb::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #c0392b 0%, #e05a4a 55%, #f8b4a8 100%);
    z-index: 10;
  }

  .sb-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 16px 16px;
    border-bottom: 1.5px solid var(--border);
    flex-shrink: 0;
  }

  .sb-mark {
    width: 38px; height: 38px; min-width: 38px;
    border-radius: 11px;
    background: linear-gradient(145deg, #c0392b 0%, #7b1d13 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 5px 15px rgba(192,57,43,0.45),
                inset 0 1px 0 rgba(255,255,255,0.18);
    position: relative; overflow: hidden; flex-shrink: 0;
  }

  .sb-mark::after {
    content: '';
    position: absolute; top: -10px; right: -10px;
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,255,255,0.1);
  }

  .sb-mark-letter {
    font-size: 18px; font-weight: 900; color: #fff;
    letter-spacing: -.5px; position: relative; z-index: 1;
    font-family: 'Inter', sans-serif;
  }

  .sb-brand-col {
    display: flex; flex-direction: column; overflow: hidden;
    transition: opacity .2s, width .3s;
  }
  .col .sb-brand-col { opacity: 0; width: 0; pointer-events: none; }

  .sb-brand {
    font-size: 15px; font-weight: 800; color: var(--txt-1);
    letter-spacing: -.5px; white-space: nowrap; line-height: 1.15;
  }
  .sb-brand em { font-style: normal; color: var(--red); }

  .sb-sub {
    font-size: 9px; font-weight: 700; color: var(--txt-3);
    letter-spacing: 1.2px; text-transform: uppercase; margin-top: 3px;
  }

  .sb-nav {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 6px 0 4px; scrollbar-width: none;
  }
  .sb-nav::-webkit-scrollbar { display: none; }

  .sb-sec-lbl {
    font-size: 9px; font-weight: 800;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--txt-2); padding: 16px 16px 4px;
    white-space: nowrap; transition: opacity .15s;
    display: flex; align-items: center; gap: 8px;
  }
  .sb-sec-lbl::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }
  .col .sb-sec-lbl { opacity: 0; }

  .sb-hr { height: 1px; background: var(--border); margin: 4px 14px; }

  .sb-row { padding: 1.5px 8px; position: relative; }

  .sb-a {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 10px; cursor: pointer;
    font-size: 13px; font-weight: 600; line-height: 1;
    color: var(--txt-1); text-decoration: none;
    transition: all .15s ease;
    white-space: nowrap; overflow: hidden; position: relative;
  }

  .sb-a:hover { background: var(--surface); color: var(--txt-1); }

  .sb-a.act { background: var(--red-bg); color: var(--red); font-weight: 700; }

  .sb-a.act::before {
    content: '';
    position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 22px;
    background: linear-gradient(180deg, #c0392b, #e05a4a);
    border-radius: 0 3px 3px 0;
  }

  .sb-icon-box {
    width: 32px; height: 32px; min-width: 32px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s ease; flex-shrink: 0;
  }

  .sb-a:not(.act) .sb-icon-box { background: var(--surface2); }
  .sb-a:hover:not(.act) .sb-icon-box { background: #fff; box-shadow: 0 2px 8px rgba(10,15,30,0.1); }
  .sb-a.act .sb-icon-box { background: var(--red); box-shadow: 0 4px 12px rgba(192,57,43,0.4); }
  .sb-a.act .sb-icon-box svg { color: #fff !important; }

  .sb-lbl { flex: 1; font-size: 13px; font-weight: 600; transition: opacity .14s; }
  .col .sb-lbl { opacity: 0; width: 0; overflow: hidden; }

  .sb-tip {
    display: none;
    position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: var(--txt-1); color: #fff;
    font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 600;
    padding: 5px 12px; border-radius: 8px;
    white-space: nowrap; pointer-events: none; z-index: 400;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  .sb-tip::before {
    content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
    border: 5px solid transparent; border-right-color: var(--txt-1);
  }
  .col .sb-row:hover .sb-tip { display: block; }

  .sb-tog {
    position: absolute; top: 50%; right: -11px; transform: translateY(-50%);
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--bg); border: 1.5px solid var(--border-md);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--txt-3);
    box-shadow: 0 2px 10px rgba(10,15,30,0.1);
    transition: all .2s; z-index: 30;
  }
  .sb-tog:hover {
    color: var(--red); border-color: var(--red-ring);
    box-shadow: 0 4px 14px rgba(192,57,43,0.2);
    transform: translateY(-50%) scale(1.12);
  }

  .sb-more-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 18px;
    border: none; border-top: 1.5px solid var(--border);
    background: transparent; cursor: pointer; width: 100%;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px; font-weight: 700; color: var(--txt-2);
    transition: all .15s; flex-shrink: 0;
    white-space: nowrap; overflow: hidden;
  }
  .sb-more-btn:hover { background: var(--surface); color: var(--txt-1); }
  .sb-more-txt { transition: opacity .14s; }
  .col .sb-more-txt { opacity: 0; width: 0; overflow: hidden; }

  .sb-user {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-top: 1.5px solid var(--border);
    background: var(--surface);
    flex-shrink: 0; overflow: hidden;
    cursor: pointer;
    transition: background .15s;
  }
  .sb-user:hover { background: #e4e7f2; }

  .sb-user-av {
    width: 36px; height: 36px; min-width: 36px;
    border-radius: 10px;
    background: linear-gradient(145deg, #c0392b, #7b1d13);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff;
    box-shadow: 0 4px 12px rgba(192,57,43,0.35);
    flex-shrink: 0;
  }

  .sb-user-info { flex: 1; min-width: 0; transition: opacity .15s; }
  .col .sb-user-info { opacity: 0; width: 0; overflow: hidden; }

  .sb-user-name {
    font-size: 12.5px; font-weight: 700; color: var(--txt-1);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sb-user-role {
    font-size: 10.5px; font-weight: 600; color: var(--txt-2);
    margin-top: 2px; text-transform: capitalize;
  }

  .sb-user-settings {
    width: 28px; height: 28px; border-radius: 8px;
    border: none; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--txt-3); transition: all .14s; flex-shrink: 0;
  }
  .sb-user-settings:hover { background: var(--border-md); color: var(--txt-1); }
  .col .sb-user-settings { display: none; }

  .more-panel {
    position: fixed; bottom: 58px;
    width: 264px;
    background: #fff;
    border: 1.5px solid #e4e7f2;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(10,15,30,0.15), 0 6px 20px rgba(10,15,30,0.08);
    z-index: 500; padding: 8px 0;
    max-height: 72vh; overflow-y: auto;
    animation: mpIn .22s cubic-bezier(.34,1.56,.64,1) both;
  }

  @keyframes mpIn {
    from { opacity: 0; transform: translateY(14px) scale(.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .more-panel::-webkit-scrollbar { width: 3px; }
  .more-panel::-webkit-scrollbar-thumb { background: #e4e7f2; border-radius: 4px; }

  .more-sec-title {
    font-size: 9px; font-weight: 800;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--txt-2); padding: 12px 16px 4px;
    display: flex; align-items: center; gap: 8px;
  }
  .more-sec-title::after { content: ''; flex: 1; height: 1px; background: #eef0f8; }

  .more-hr { height: 1px; background: #eef0f8; margin: 5px 12px; }

  .more-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 8px 14px;
    border: none; background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--txt-1);
    cursor: pointer; text-align: left;
    transition: all .14s; white-space: nowrap;
  }
  .more-item:hover { background: #f6f8ff; color: #0a0f1e; }

  .more-ic {
    width: 30px; height: 30px; min-width: 30px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .more-chv { margin-left: auto; color: var(--txt-3); transition: transform .2s; flex-shrink: 0; }
  .more-chv.open { transform: rotate(90deg); }

  .more-sub { max-height: 0; overflow: hidden; transition: max-height .22s cubic-bezier(.4,0,.2,1); }
  .more-sub.open { max-height: 200px; }

  .more-sub-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 7px 14px 7px 46px;
    border: none; background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 600; color: var(--txt-2);
    cursor: pointer; text-align: left;
    transition: background .14s, color .14s; white-space: nowrap;
  }
  .more-sub-item:hover { background: #f6f8ff; color: var(--txt-1); }
`;

/* ─── MORE PANEL ─────────────────────────────────────────── */
const MorePanel = ({ onClose, collapsed }) => {
  const [openSub, setOpenSub] = useState(null);
  const navigate = useNavigate();   // ← ADD
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  // ← ADD this helper
  const handleItemClick = (label) => {
    const routes = {
      "Users":  "/users",
      "Teams":  "/teams",
      "Reports": "/reports",
      "Projects": "/projects",
      "Project Tasks": "/projects",
      "Campaigns": "/campaigns",
      "Target Lists": "/campaigns",
      "Documents": "/documents",
      "Sales & Purchases": "/sales",
    };
    if (routes[label]) {
      onClose();
      navigate(routes[label]);
    }
  };

  return (
    <div ref={ref} className="more-panel" style={{ left: collapsed ? 76 : 240 }}>
      {moreSections.map((sec, si) => (
        <div key={si}>
          {si > 0 && <div className="more-hr" />}
          {sec.title && <p className="more-sec-title">{sec.title}</p>}
          {sec.items.map((item) => (
            <div key={item.label}>
              <button
                className="more-item"
                onClick={() =>
                  item.children
                    ? setOpenSub(openSub === item.label ? null : item.label)
                    : handleItemClick(item.label)
                }
              >
                <div className="more-ic" style={{ background: item.bg }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                {item.label}
                {item.children && (
                  <ChevronRight
                    size={13}
                    className={"more-chv" + (openSub === item.label ? " open" : "")}
                  />
                )}
              </button>
              {item.children && (
                <div className={"more-sub" + (openSub === item.label ? " open" : "")}>
                  {item.children.map((child) => (
                    <button
                      key={child.label}
                      className="more-sub-item"
                      onClick={() => handleItemClick(child.label)}  // ← ADD
                    >
                      <child.icon size={12} style={{ color: "#9ba8c4" }} />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ─── SECTION ─────────────────────────────────────────────── */
const Section = ({ title, items }) => (
  <div>
    {title && <p className="sb-sec-lbl">{title}</p>}
    {items.map((item) => (
      <div className="sb-row" key={item.label}>
        <NavLink
          to={item.path || "#"}
          className={({ isActive }) =>
            "sb-a" + (isActive && item.path !== "#" ? " act" : "")
          }
        >
          <div className="sb-icon-box">
            <item.icon size={15} style={{ color: item.color }} />
          </div>
          <span className="sb-lbl">{item.label}</span>
        </NavLink>
        <div className="sb-tip">{item.label}</div>
      </div>
    ))}
  </div>
);

/* ─── SIDEBAR ─────────────────────────────────────────────── */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showMore, setShowMore]   = useState(false);
  const [user, setUser]           = useState(null);
  const navigate                  = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUser)
      .catch(() =>
        setUser({
          fullname: localStorage.getItem("username"),
          role:     localStorage.getItem("role"),
        })
      );
  }, []);

  const name = user?.fullname || "User";
  const role = user?.role     || "Member";

  const goToUsers = () => {
    setShowMore(false);
    navigate("/users");
  };

  const goToUserDetail = (e) => {
    e.stopPropagation();
    setShowMore(false);
    navigate("/users/" + (user?.id || ""));
  };

  return (
    <>
      <style>{css}</style>
      <aside className={"sb" + (collapsed ? " col" : "")}>

        {/* LOGO */}
        <div className="sb-logo">
          <div className="sb-mark">
            <span className="sb-mark-letter">D</span>
          </div>
          <div className="sb-brand-col">
            <div className="sb-brand">Digital<em>Dose</em></div>
            <div className="sb-sub">CRM Platform</div>
          </div>
        </div>

        {/* NAV */}
        <nav className="sb-nav">
          <Section title="CRM"        items={crmItems}      />
          <div className="sb-hr" />
          <Section title="Activities" items={activityItems} />
          <div className="sb-hr" />
          <Section title="Support"    items={supportItems}  />
        </nav>

        {/* MORE */}
        <button
          className="sb-more-btn"
          onClick={() => setShowMore((v) => !v)}
        >
          <MoreHorizontal size={16} style={{ color: "#6b7280", flexShrink: 0 }} />
          <span className="sb-more-txt">More</span>
        </button>

        {/* USER — use NavLink so React Router handles it cleanly */}
        <div className="sb-user" onClick={goToUsers}>
          <div className="sb-user-av">{name.charAt(0).toUpperCase()}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{name}</div>
            <div className="sb-user-role">{role}</div>
          </div>
          <button className="sb-user-settings" onClick={goToUserDetail}>
            <Settings size={13} />
          </button>
        </div>

        {/* TOGGLE */}
        <button className="sb-tog" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <PanelLeftOpen size={11} /> : <PanelLeftClose size={11} />}
        </button>

      </aside>

      {/* MORE FLYOUT */}
      {showMore && (
        <MorePanel
          collapsed={collapsed}
          onClose={() => setShowMore(false)}
        />
      )}
    </>
  );
};

export default Sidebar;