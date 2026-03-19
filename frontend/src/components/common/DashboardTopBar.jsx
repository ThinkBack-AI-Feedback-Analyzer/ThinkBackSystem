import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";

const DashboardTopBar = ({
  userName,
  userEmail,
  searchPlaceholder = "Search task",
  className = "dashboard-header",
}) => {
  let storedUser = null;

  try {
    const userRaw = localStorage.getItem("user");
    storedUser = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    storedUser = null;
  }

  const displayName = userName || storedUser?.full_name || "Institution Admin";
  const displayEmail = userEmail || storedUser?.email || "admin@institution.edu";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <header className={className}>
      <div className="dashboard-topbar-main">
        <label className="topbar-search" htmlFor="dashboard-search">
          <FaSearch />
          <input id="dashboard-search" type="text" placeholder={searchPlaceholder} />
          <kbd>Ctrl F</kbd>
        </label>

        <div className="topbar-right">
          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-icon-btn"
              aria-label="Notifications"
              title="Notifications"
            >
              <FaBell />
            </button>
          </div>

          <div className="user-info">
            <div className="user-avatar">{initial}</div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span className="user-email">{displayEmail}</span>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default DashboardTopBar;
