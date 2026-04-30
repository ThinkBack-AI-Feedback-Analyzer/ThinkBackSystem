import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";

const DashboardTopBar = ({ userName, userEmail, searchPlaceholder = "Search…" }) => {
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const displayName  = userName  || storedUser?.full_name || "Institution Admin";
  const displayEmail = userEmail || storedUser?.email     || "admin@institution.edu";
  const initial      = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">

      {/* Search */}
      <label
        htmlFor="topbar-search"
        className="flex items-center gap-2 w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg px-3 h-9 cursor-text hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
      >
        <FaSearch className="text-slate-400 text-xs shrink-0" />
        <input
          id="topbar-search"
          type="text"
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          ⌘F
        </kbd>
      </label>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <FaBell className="text-sm" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User pill */}
        <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[140px]">
              {displayEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
