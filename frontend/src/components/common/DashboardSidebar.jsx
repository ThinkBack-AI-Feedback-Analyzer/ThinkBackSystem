import React, { useState } from "react";
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaBook,
  FaComments,
  FaUsers,
  FaUserPlus,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

const DEFAULT_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard",    icon: FaHome,      group: "main" },
  { key: "courses",   label: "Courses",      icon: FaBook,      group: "main" },
  { key: "feedback",  label: "Feedback Forms", icon: FaComments, group: "main" },
  { key: "analytics", label: "Analytics",    icon: FaChartBar,  group: "main" },
  { key: "users",     label: "Staff",        icon: FaUsers,     group: "main" },
  { key: "invite",    label: "Add Staff",    icon: FaUserPlus,  group: "main" },
  { key: "settings",  label: "Settings",     icon: FaCog,       group: "settings" },
];

const DashboardSidebar = ({
  logoText      = "TB",
  logoSrc,
  logoAlt,
  brandName     = "Think Back",
  navItems      = DEFAULT_NAV_ITEMS,
  activeNav:    activeNavProp,
  onNavChange,
  onLogout,
  isCollapsed:  isCollapsedProp,
  onToggleCollapse,
}) => {
  const [internalActive,   setInternalActive]   = useState("dashboard");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen,        setMobileOpen]        = useState(false);

  const activeNav   = activeNavProp    ?? internalActive;
  const isCollapsed = isCollapsedProp  ?? internalCollapsed;

  const mainItems     = navItems.filter((i) => (i.group || "main") === "main");
  const settingsItems = navItems.filter((i) => i.group === "settings");

  const handleNav = (key) => {
    setInternalActive(key);
    onNavChange?.(key);
    if (window.innerWidth < 768) setMobileOpen(false);
  };

  const handleCollapse = () => {
    if (onToggleCollapse) { onToggleCollapse(); return; }
    setInternalCollapsed((p) => !p);
  };

  /* ── single nav button ── */
  const NavBtn = ({ item }) => {
    const Icon     = item.icon;
    const isActive = activeNav === item.key;

    return (
      <button
        type="button"
        onClick={() => handleNav(item.key)}
        title={isCollapsed ? item.label : undefined}
        className={[
          "group relative flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150 outline-none",
          isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
        ].join(" ")}
      >
        <Icon className={`shrink-0 text-base ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />

        {!isCollapsed && (
          <span className="truncate">{item.label}</span>
        )}

        {!isCollapsed && item.badge && (
          <span className={`ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
          }`}>
            {item.badge}
          </span>
        )}

        {/* tooltip when collapsed */}
        {isCollapsed && (
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  /* ── sidebar inner content (shared desktop + mobile) ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Brand header */}
      <div className={`flex items-center mb-6 ${isCollapsed ? "justify-center px-2 pt-5" : "gap-3 px-4 pt-5"}`}>
        <div className={`shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${
          isCollapsed ? "w-9 h-9" : "w-9 h-9"
        } ${!logoSrc ? "bg-emerald-600" : "bg-white border border-slate-200"}`}>
          {logoSrc
            ? <img src={logoSrc} alt={logoAlt || brandName} className="w-full h-full object-contain" />
            : <span className="text-white font-bold text-sm">{logoText}</span>
          }
        </div>

        {!isCollapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{brandName}</p>
            <p className="text-xs text-slate-400 truncate">Dashboard</p>
          </div>
        )}
      </div>

      {/* Main nav */}
      <div className="px-3 flex-1 overflow-y-auto space-y-0.5">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
            Main
          </p>
        )}
        {mainItems.map((item) => <NavBtn key={item.key} item={item} />)}

        {settingsItems.length > 0 && (
          <>
            <div className="my-3 border-t border-slate-100" />
            {!isCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
                Settings
              </p>
            )}
            {settingsItems.map((item) => <NavBtn key={item.key} item={item} />)}
          </>
        )}
      </div>

      {/* Footer — logout */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={[
            "group relative flex items-center w-full rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600",
            isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
          ].join(" ")}
        >
          <FaSignOutAlt className="shrink-0 text-base text-slate-400 group-hover:text-red-500" />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm"
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={[
          "md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 font-[Sora,sans-serif]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={[
          "hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 overflow-hidden font-[Sora,sans-serif]",
          isCollapsed ? "w-[68px]" : "w-[240px]",
        ].join(" ")}
      >
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={handleCollapse}
          className="absolute top-5 -right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-colors"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
        </button>

        <SidebarContent />
      </aside>
    </>
  );
};

export default DashboardSidebar;
