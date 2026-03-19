import React, { useState } from "react";
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaBook,
  FaComments,
  FaUsers,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

const DEFAULT_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: FaHome, group: "menu" },
  { key: "courses", label: "Courses", icon: FaBook, group: "menu" },
  { key: "feedback", label: "Feedback", icon: FaComments, group: "menu", badge: "12" },
  { key: "analytics", label: "Analytics", icon: FaChartBar, group: "menu" },
  { key: "users", label: "Team", icon: FaUsers, group: "menu" },
  { key: "settings", label: "Settings", icon: FaCog, group: "general" },
];

const DashboardSidebar = ({
  logoText = "TB",
  logoSrc,
  logoAlt,
  brandName = "Think Back",
  navItems = DEFAULT_NAV_ITEMS,
  activeNav: activeNavProp,
  onNavChange,
  onLogout,
  logoutIcon: LogoutIcon = FaSignOutAlt,
  isCollapsed: isCollapsedProp,
  onToggleCollapse,
  className = "dashboard-sidebar",
}) => {
  const [internalActiveNav, setInternalActiveNav] = useState("dashboard");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeNav = activeNavProp ?? internalActiveNav;
  const isCollapsed = isCollapsedProp ?? internalCollapsed;

  const menuItems = navItems.filter((item) => (item.group || "menu") === "menu");
  const generalItems = navItems.filter((item) => item.group === "general");

  const handleNavChange = (key) => {
    setInternalActiveNav(key);
    onNavChange?.(key);

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
      return;
    }

    setInternalCollapsed((prev) => !prev);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeNav === item.key;

    return (
      <button
        key={item.key}
        type="button"
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={() => handleNavChange(item.key)}
        aria-label={item.label}
        title={item.label}
      >
        <span className="nav-item-icon">
          <Icon />
        </span>
        <span className="nav-item-label">{item.label}</span>
        {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
      </button>
    );
  };

  const sidebarClassName = `${className} ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`.trim();

  return (
    <>
      {!mobileOpen ? (
        <button
          type="button"
          className="sidebar-mobile-launcher md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar menu"
          title="Open menu"
        >
          <FaBars />
        </button>
      ) : null}

      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-mobile-backdrop md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar menu"
        />
      ) : null}

      <aside className={sidebarClassName}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className={`sidebar-logo ${logoSrc ? "sidebar-logo-with-image" : ""}`}>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={logoAlt || `${brandName} logo`}
                  className="sidebar-logo-image"
                />
              ) : (
                <div className="logo-icon">{logoText}</div>
              )}
            </div>
            <div className="sidebar-brand-text">
              <h2>{brandName}</h2>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn sidebar-collapse-btn-desktop"
            onClick={handleToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          <button
            type="button"
            className="sidebar-collapse-btn sidebar-collapse-btn-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar menu"
            title="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col md:flex md:flex-col">
          {!isCollapsed ? <span className="sidebar-section-title">Menu</span> : null}
          <nav className="sidebar-nav">{menuItems.map(renderNavItem)}</nav>

          {!isCollapsed && generalItems.length > 0 ? <span className="sidebar-section-title">General</span> : null}
          <nav className="sidebar-nav sidebar-nav-secondary">{generalItems.map(renderNavItem)}</nav>

          <button
            type="button"
            className="nav-logout"
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
          >
            <span className="nav-item-icon">{LogoutIcon ? <LogoutIcon /> : "L"}</span>
            <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
