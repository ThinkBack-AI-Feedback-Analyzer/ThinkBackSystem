import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FaChartBar, FaBuilding, FaUserShield, FaUsers,
  FaHistory, FaUserCircle, FaCheckCircle,
  FaSignOutAlt, FaBars, FaTimes,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa'
import logo from '../../assets/Logo_4.png'
import { getPendingInstitutions } from '../../services/superadmin'

const NAV_MAIN = [
  { key: 'dashboard',    label: 'Dashboard',    icon: FaChartBar,    path: '/superadmin' },
  { key: 'approvals',    label: 'Approvals',    icon: FaCheckCircle, path: '/superadmin/approvals' },
  { key: 'institutions', label: 'Institutions', icon: FaBuilding,    path: '/superadmin/institutions' },
  { key: 'admins',       label: 'Admins',       icon: FaUserShield,  path: '/superadmin/admins' },
  { key: 'users',        label: 'All Users',    icon: FaUsers,       path: '/superadmin/users' },
  { key: 'audit',        label: 'Audit Log',    icon: FaHistory,     path: '/superadmin/audit' },
]

const NAV_ACCOUNT = [
  { key: 'profile',      label: 'My Profile',   icon: FaUserCircle,  path: '/superadmin/profile' },
]

const ALL_NAV = [...NAV_MAIN, ...NAV_ACCOUNT]

export default function SuperAdminSidebar({ collapsed, onCollapse }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role === 'system_admin') {
      getPendingInstitutions().then(data => setPendingCount(data.length)).catch(() => {})
    }
  }, [location.pathname])

  const activeKey = ALL_NAV.find(n => n.path === location.pathname)?.key ?? 'dashboard'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const NavBtn = ({ item }) => {
    const Icon     = item.icon
    const isActive = activeKey === item.key
    const hasBadge = item.key === 'approvals' && pendingCount > 0
    return (
      <button
        type="button"
        onClick={() => { navigate(item.path); setMobileOpen(false) }}
        title={collapsed ? item.label : undefined}
        className={[
          'group relative flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150 outline-none',
          collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
        ].join(' ')}
      >
        <div className="relative">
          <Icon className={`shrink-0 text-base ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
          {hasBadge && collapsed && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </div>
        
        {!collapsed && <span className="truncate">{item.label}</span>}
        
        {hasBadge && !collapsed && (
          <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
            {pendingCount}
          </span>
        )}

        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
            {item.label} {hasBadge && `(${pendingCount} pending)`}
          </span>
        )}
      </button>
    )
  }

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center mb-6 ${collapsed ? 'justify-center px-2 pt-5' : 'gap-3 px-4 pt-5'}`}>
        <div className="shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
          <img src={logo} alt="Think Back logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">Think Back</p>
            <p className="text-xs text-emerald-600 font-medium truncate">Super Admin</p>
          </div>
        )}
      </div>

      <div className="px-3 flex-1 overflow-y-auto space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">Main</p>
        )}
        {NAV_MAIN.map(item => <NavBtn key={item.key} item={item} />)}

        <div className="my-2 border-t border-slate-100" />

        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">Account</p>
        )}
        {NAV_ACCOUNT.map(item => <NavBtn key={item.key} item={item} />)}
      </div>

      <div className="px-3 pb-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={[
            'group relative flex items-center w-full rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600',
            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
          ].join(' ')}
        >
          <FaSignOutAlt className="shrink-0 text-base text-slate-400 group-hover:text-red-500" />
          {!collapsed && <span>Logout</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm"
      >
        <FaBars />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={[
        'md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 font-[Sora,sans-serif]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <FaTimes />
        </button>
        <Content />
      </aside>

      {/* Desktop sidebar */}
      <aside className={[
        'hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 overflow-hidden font-[Sora,sans-serif]',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      ].join(' ')}>
        <button
          type="button"
          onClick={onCollapse}
          className="absolute top-5 -right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-colors"
        >
          {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
        </button>
        <Content />
      </aside>
    </>
  )
}
