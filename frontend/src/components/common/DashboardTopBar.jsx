import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";

const headerBg = {
  background:
    "linear-gradient(135deg, rgba(232,247,237,0.92) 0%, rgba(186,223,198,0.78) 42%, rgba(108,169,130,0.58) 100%)",
  border: "1px solid rgba(158,196,171,0.7)",
  boxShadow: "0 14px 28px rgba(24,77,53,0.14), 0 0 16px rgba(73,161,116,0.08)",
};

const searchBg = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(231,248,238,0.56) 100%)",
  border: "1px solid rgba(206,231,217,0.88)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 24px rgba(24,77,53,0.09)",
};

const iconBtnStyle = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.48) 0%, rgba(223,243,231,0.72) 100%)",
  border: "1px solid rgba(191,223,204,0.9)",
};

const userInfoStyle = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(216,240,226,0.74) 100%)",
  border: "1px solid rgba(186,216,199,0.82)",
  boxShadow: "0 14px 28px rgba(24,77,53,0.12)",
};

const avatarStyle = {
  background: "linear-gradient(135deg, #2e7b56 0%, #184d35 56%, #0f2f1e 100%)",
};

const DashboardTopBar = ({ userName, userEmail, searchPlaceholder = "Search task" }) => {
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const displayName = userName || storedUser?.full_name || "Institution Admin";
  const displayEmail = userEmail || storedUser?.email || "admin@institution.edu";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      style={headerBg}
      className="relative overflow-hidden rounded-3xl backdrop-blur-sm px-[18px] py-4 mb-[14px]"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-[30px] -top-7 w-[170px] h-[120px] rounded-full bg-[rgba(247,255,250,0.62)] blur-[28px]" />
      <div className="pointer-events-none absolute -right-[22px] -bottom-9 w-[180px] h-[120px] rounded-full bg-[rgba(27,90,61,0.2)] blur-[34px]" />

      <div className="relative z-[1] flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
        {/* Search */}
        <label
          htmlFor="dashboard-search"
          style={searchBg}
          className="flex items-center gap-[10px] basis-[360px] shrink-0 max-w-full lg:flex-1 rounded-[14px] h-12 px-[14px] text-[#4f6157] cursor-text"
        >
          <FaSearch />
          <input
            id="dashboard-search"
            type="text"
            placeholder={searchPlaceholder}
            className="border-none outline-none flex-1 text-[#1d3026] bg-transparent text-[15px]"
          />
          <kbd className="bg-[rgba(239,248,243,0.86)] border border-[rgba(186,216,199,0.86)] rounded-[7px] px-[6px] py-[2px] text-[10px] text-[#436553] font-[inherit]">
            Ctrl F
          </kbd>
        </label>

        {/* Right */}
        <div className="flex items-center gap-3 max-md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={iconBtnStyle}
              aria-label="Notifications"
              title="Notifications"
              className="text-[#355546] w-10 h-10 rounded-[12px] inline-flex items-center justify-center cursor-pointer transition-all duration-[240ms] shadow-[0_10px_20px_rgba(24,77,53,0.1)] hover:text-[#103826] hover:-translate-y-[1px] hover:shadow-[0_14px_24px_rgba(24,77,53,0.15)]"
            >
              <FaBell />
            </button>
          </div>

          <div style={userInfoStyle} className="flex items-center gap-[10px] rounded-[16px] px-[10px] py-[7px]">
            <div
              style={avatarStyle}
              className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-[14px] shrink-0"
            >
              {initial}
            </div>
            <div className="flex flex-col leading-[1.2]">
              <strong className="text-[#123524] text-[12px] font-bold">{displayName}</strong>
              <span className="text-[#486a58] text-[12px] font-medium">{displayEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
