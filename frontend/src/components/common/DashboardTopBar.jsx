import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import NotificationCenter from './NotificationCenter'

const ROLE_LABELS = {
  institution_admin: 'Institution Admin',
  coordinator:       'Coordinator',
  lecturer:          'Lecturer',
  system_admin:      'System Admin',
}

const ROUTE_LABELS = {
  'superadmin':         'Super Admin',
  'institutions':       'Institutions',
  'admins':             'Institution Admins',
  'users':              'All Users',
  'approvals':          'Pending Approvals',
  'audit':              'Audit Log',
  'messages':           'Contact Messages',
  'profile':            'My Profile',
  'institution-dashboard': 'Dashboard',
  'staff-dashboard':    'Dashboard',
  'courses':            'Courses',
  'course-create':      'Create Course',
  'manage-users':       'Manage Users',
  'feedback-forms':     'Feedback Forms',
  'feedbackForm':       'Create Form',
  'staff-form-create':  'Create Form',
  'feedback-analysis':  'Analysis',
  'students':           'Students',
  'student-management': 'Student Management',
  'reports':            'Reports',
  'settings':           'Settings',
  'feedback':           'Feedback',
  'portal':             'Student Portal',
}

function buildBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = []
  let path = ''

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    path += '/' + seg

    // If segment is a numeric ID, label it based on previous segment
    if (/^\d+$/.test(seg)) {
      const parent = segments[i - 1]
      const label = parent === 'institutions' ? 'Details' : 'Details'
      crumbs.push({ label, path, clickable: false })
    } else {
      const label = ROUTE_LABELS[seg]
      if (label) crumbs.push({ label, path, clickable: i < segments.length - 1 })
    }
  }

  return crumbs
}

const DashboardTopBar = ({ userName, userEmail }) => {
  const navigate = useNavigate()
  const location = useLocation()
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

  const crumbs = buildBreadcrumbs(location.pathname)

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
    <header className="flex items-center justify-between gap-3 px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">

      {/* Left — breadcrumb */}
      <nav className="flex items-center gap-1.5 min-w-0">
        {crumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <FaChevronRight className="text-slate-300 text-[9px] shrink-0" />}
            {crumb.clickable ? (
              <button
                onClick={() => navigate(crumb.path)}
                className="text-sm text-slate-400 hover:text-emerald-600 font-medium transition-colors truncate"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-sm font-semibold text-slate-700 truncate">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationCenter />
        <div className="w-px h-6 bg-slate-200" />

        {/* Profile dropdown */}
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

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-100 bg-white shadow-lg py-1.5 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                {role && (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate(role === 'system_admin' ? '/superadmin/profile' : '/profile') }}
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
      </div>
    </header>
  )
}

export default DashboardTopBar
