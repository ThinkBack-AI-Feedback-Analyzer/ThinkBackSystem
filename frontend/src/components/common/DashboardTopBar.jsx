import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa'
import NotificationCenter from './NotificationCenter'

const ROLE_LABELS = {
  institution_admin: 'Institution Admin',
  coordinator:       'Coordinator',
  lecturer:          'Lecturer',
  system_admin:      'System Admin',
}

const DashboardTopBar = ({ userName, userEmail }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  let storedUser = null
  try {
    const raw = localStorage.getItem('user')
    storedUser = raw ? JSON.parse(raw) : null
  } catch {
    storedUser = null
  }

  const displayName  = userName  || storedUser?.full_name || 'User'
  const displayEmail = userEmail || storedUser?.email     || ''
  const role         = storedUser?.role ?? ''
  const initial      = displayName.charAt(0).toUpperCase()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isInstitutionAdmin = role === 'institution_admin'

  return (
    <header className="flex items-center justify-end gap-3 px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">

      {/* Notifications */}
      <NotificationCenter />

      <div className="w-px h-6 bg-slate-200" />

      {/* Profile dropdown trigger */}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col leading-tight text-left">
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[130px]">{displayName}</span>
            <span className="text-xs text-slate-400 truncate max-w-[130px]">{displayEmail}</span>
          </div>
          <FaChevronDown className={`hidden sm:block text-[10px] text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-100 bg-white shadow-lg py-1.5 z-50">

            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
              {role && (
                <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/profile') }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FaUserCircle className="text-slate-400 text-sm" />
                My Profile
              </button>

              {isInstitutionAdmin && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate('/settings') }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FaCog className="text-slate-400 text-sm" />
                  Institution Settings
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-sm" />
                Logout
              </button>
            </div>

          </div>
        )}
      </div>
    </header>
  )
}

export default DashboardTopBar
