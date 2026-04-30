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

const sidebarBg = {
  background:
    "linear-gradient(135deg, rgba(232,247,237,0.92) 0%, rgba(186,223,198,0.78) 42%, rgba(108,169,130,0.58) 100%)",
  boxShadow: "0 24px 54px rgba(24,77,53,0.18), 0 0 32px rgba(73,161,116,0.1)",
  border: "1px solid rgba(158,196,171,0.7)",
};

const collapseBtnBg = {
  background: "linear-gradient(180deg, #ffffff 0%, #f1f6f3 100%)",
};

const logoBg = {
  background: "linear-gradient(145deg, #198055, #11593b)",
};

const activeIndicatorStyle = {
  background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
  boxShadow: "0 0 10px rgba(16,185,129,0.4)",
};

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
}) => {
  const [internalActiveNav, setInternalActiveNav] = useState("dashboard");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeNav = activeNavProp ?? internalActiveNav;
  const isCollapsed = isCollapsedProp ?? internalCollapsed;

  const menuItems = navItems.filter((i) => (i.group || "menu") === "menu");
  const generalItems = navItems.filter((i) => i.group === "general");

  const handleNavChange = (key) => {
    setInternalActiveNav(key);
    onNavChange?.(key);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) { onToggleCollapse(); return; }
    setInternalCollapsed((prev) => !prev);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeNav === item.key;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => handleNavChange(item.key)}
        aria-label={item.label}
        title={item.label}
        className={[
          "relative w-full min-h-[54px] rounded-[14px] border flex items-center gap-[14px] text-[16px] cursor-pointer transition-all duration-[250ms] text-left bg-transparent",
          isCollapsed ? "justify-center px-0" : "pl-6 pr-[14px]",
          isActive
            ? "border-transparent text-emerald-500 font-bold"
            : "border-transparent text-[#8a9390] font-semibold hover:text-[#5f6963]",
        ].join(" ")}
      >
        {isActive && (
          <span
            className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[6px] h-6 rounded-[4px] z-[2]"
            style={activeIndicatorStyle}
          />
        )}
        <span
          className={[
            "inline-flex items-center justify-center transition-all duration-[250ms]",
            isCollapsed ? "w-[34px] h-[34px] text-[22px]" : "w-6 h-6 text-[18px]",
          ].join(" ")}
        >
          <Icon />
        </span>
        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
        {!isCollapsed && item.badge && (
          <span className="ml-auto bg-[#dff2e9] text-emerald-500 text-[10px] leading-none rounded-full px-[7px] py-[3px] font-bold">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile launcher */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar menu"
          title="Open menu"
          className="md:hidden fixed left-3 top-3 w-[42px] h-[42px] border border-[#b8d8c7] rounded-[12px] bg-white text-[#0f7f52] inline-flex items-center justify-center z-[70] shadow-[0_8px_20px_rgba(20,63,47,0.18)]"
        >
          <FaBars />
        </button>
      )}

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar menu"
          className="md:hidden fixed inset-0 bg-[rgba(15,23,42,0.32)] z-[55] border-none cursor-default"
        />
      )}

      <aside
        style={sidebarBg}
        className={[
          // base
          "relative flex flex-col overflow-hidden rounded-3xl backdrop-blur-sm [scrollbar-width:none] [-ms-overflow-style:none] transition-all duration-[280ms] ease-[ease]",
          // desktop
          "md:sticky md:top-[18px] md:h-[calc(100vh-36px)] md:overflow-y-auto",
          isCollapsed ? "md:px-3 md:py-5" : "md:px-[18px] md:py-[26px]",
          // mobile: slide-in drawer
          "max-md:fixed max-md:left-0 max-md:top-0 max-md:h-screen max-md:max-h-screen max-md:rounded-r-[18px] max-md:rounded-l-none max-md:w-[min(86vw,320px)] max-md:z-[60] max-md:overflow-y-auto max-md:px-4 max-md:py-4",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-[110%]",
        ].join(" ")}
      >
        {/* Decorative blobs (replaces ::before / ::after) */}
        <div className="pointer-events-none absolute -left-7 -top-6 w-[140px] h-[100px] rounded-full bg-[rgba(247,255,250,0.58)] blur-[26px]" />
        <div className="pointer-events-none absolute -right-[26px] -bottom-7 w-[150px] h-[110px] rounded-full bg-[rgba(27,90,61,0.16)] blur-[30px]" />

        {/* Content above blobs */}
        <div className="relative z-[1] flex flex-col h-full">

          {/* Header */}
          <div
            className={[
              "flex items-center gap-[10px] mb-6",
              isCollapsed ? "flex-col" : "justify-between",
            ].join(" ")}
          >
            {/* Brand */}
            <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-start gap-[10px]" : "gap-[14px]"}`}>
              <div
                className={[
                  "w-[52px] h-[52px] rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-[0_8px_16px_rgba(22,119,78,0.22)]",
                  logoSrc ? "bg-[rgba(255,255,255,0.94)] p-2" : "",
                ].join(" ")}
                style={!logoSrc ? logoBg : {}}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={logoAlt || `${brandName} logo`}
                    className="w-full h-full object-contain block"
                  />
                ) : (
                  <span className="text-white font-bold text-[18px]">{logoText}</span>
                )}
              </div>
              {!isCollapsed && (
                <h2 className="m-0 text-[20px] text-[#1e2722] font-bold">{brandName}</h2>
              )}
            </div>

            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand" : "Collapse"}
              style={collapseBtnBg}
              className="hidden md:inline-flex w-[38px] h-[38px] rounded-[12px] border border-[#d7e2dc] items-center justify-center cursor-pointer transition-all duration-[250ms] flex-shrink-0 text-[#365046] shadow-[0_8px_16px_rgba(20,63,47,0.1)] hover:border-[#a7c4b5] hover:text-[#0f7f52] hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(20,63,47,0.16)]"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar menu"
              title="Close menu"
              className="md:hidden inline-flex w-10 h-10 rounded-[12px] border border-[#b8d8c7] bg-white text-[#0f7f52] items-center justify-center z-[3]"
            >
              <FaTimes />
            </button>
          </div>

          {/* Nav sections */}
          <div className="flex flex-col flex-1">
            {!isCollapsed && (
              <span className="text-[#98a19d] uppercase tracking-[0.08em] text-[11px] font-bold mx-[10px] mt-3 mb-2">
                Menu
              </span>
            )}
            <nav className="flex flex-col gap-2 mb-[14px]">
              {menuItems.map(renderNavItem)}
            </nav>

            {!isCollapsed && generalItems.length > 0 && (
              <span className="text-[#98a19d] uppercase tracking-[0.08em] text-[11px] font-bold mx-[10px] mt-3 mb-2">
                General
              </span>
            )}
            <nav className="flex flex-col gap-2 mb-auto">
              {generalItems.map(renderNavItem)}
            </nav>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className={[
                "w-full min-h-[54px] bg-transparent border border-transparent rounded-[14px] text-[#7c8882] text-[16px] cursor-pointer transition-all duration-[250ms] flex items-center gap-[14px] font-semibold hover:bg-[#fdf0f1] hover:border-[#f8d6dc] hover:text-[#b0415d]",
                isCollapsed ? "justify-center px-0" : "px-[14px]",
              ].join(" ")}
            >
              <span
                className={`inline-flex items-center justify-center ${
                  isCollapsed ? "w-[34px] h-[34px] text-[22px]" : "w-6 h-6 text-[18px]"
                }`}
              >
                {LogoutIcon ? <LogoutIcon /> : "L"}
              </span>
              {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
