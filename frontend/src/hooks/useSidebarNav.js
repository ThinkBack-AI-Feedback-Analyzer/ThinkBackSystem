import { useCallback, useState } from 'react'

export function useCurrentUser() {
  return useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })[0]
}
import { useNavigate } from 'react-router-dom'
import {
  FaHome, FaBook, FaGraduationCap, FaComments,
  FaUsers, FaFileAlt, FaCog, FaChartBar,
} from 'react-icons/fa'

/* ── Role-based nav item lists ──────────────────────────────────────────────── */
const NAV_BY_ROLE = {
  institution_admin: [
    { key: 'dashboard', label: 'Dashboard',      icon: FaHome,          group: 'main'     },
    { key: 'courses',   label: 'Courses',        icon: FaBook,          group: 'main'     },
    { key: 'students',  label: 'Students',       icon: FaGraduationCap, group: 'main'     },
    { key: 'feedback',  label: 'Feedback Forms', icon: FaComments,      group: 'main'     },
    { key: 'users',     label: 'Staff',          icon: FaUsers,         group: 'main'     },
    { key: 'reports',   label: 'Reports',        icon: FaFileAlt,       group: 'main'     },
    { key: 'settings',  label: 'Settings',       icon: FaCog,           group: 'settings' },
  ],
  coordinator: [
    { key: 'dashboard', label: 'Dashboard',      icon: FaHome,          group: 'main'     },
    { key: 'courses',   label: 'Courses',        icon: FaBook,          group: 'main'     },
    { key: 'students',  label: 'Students',       icon: FaGraduationCap, group: 'main'     },
    { key: 'feedback',  label: 'Feedback Forms', icon: FaComments,      group: 'main'     },
    { key: 'reports',   label: 'Reports',        icon: FaFileAlt,       group: 'main'     },
  ],
  lecturer: [
    { key: 'dashboard', label: 'Dashboard',       icon: FaHome,          group: 'main'     },
    { key: 'courses',   label: 'My Courses',      icon: FaBook,          group: 'main'     },
    { key: 'students',  label: 'Students',        icon: FaGraduationCap, group: 'main'     },
    { key: 'feedback',  label: 'Feedback Results', icon: FaChartBar,     group: 'main'     },
  ],
}

/* ── Single route map (dashboard is role-aware) ─────────────────────────────── */
const ROUTES = {
  courses:  '/courses',
  students: '/students',
  feedback: '/feedback-forms',
  users:    '/manage-users',
  reports:  '/reports',
  settings: '/settings',
  profile:  '/profile',
}

const DASHBOARD_ROUTE = {
  institution_admin: '/institution-dashboard',
  coordinator:       '/staff-dashboard',
  lecturer:          '/staff-dashboard',
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */
export function useSidebarNav() {
  const navigate = useNavigate()
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const role    = user?.role ?? 'lecturer'
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.lecturer

  const handleNav = useCallback((key) => {
    const route = key === 'dashboard'
      ? (DASHBOARD_ROUTE[role] ?? '/institution-dashboard')
      : ROUTES[key]
    if (route) navigate(route)
  }, [navigate, role])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const institutionName = user?.institution_name ?? null

  return { navItems, handleNav, handleLogout, user, institutionName }
}
