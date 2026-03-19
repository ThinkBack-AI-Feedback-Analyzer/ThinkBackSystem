const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'profile', label: 'Profile', icon: 'user' },
  { key: 'users', label: 'Manage Users', icon: 'users' },
  { key: 'courses', label: 'Courses', icon: 'book' },
  { key: 'feedback', label: 'Feedback Forms', icon: 'file' },
  { key: 'reports', label: 'Reports', icon: 'chart' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

function SidebarIcon({ name }) {
  const commonProps = {
    'aria-hidden': 'true',
    viewBox: '0 0 24 24',
    className: 'h-[22px] w-[22px]',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'home':
      return (
        <svg {...commonProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      )
    case 'user':
      return (
        <svg {...commonProps}>
          <path d="M20 21a8 8 0 1 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'book':
      return (
        <svg {...commonProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      )
    case 'file':
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...commonProps}>
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.33H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.39-.23.67-.61.6-1V3a2 2 0 1 1 4 0v.09c-.07.39.21.77.6 1a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.23.39.61.67 1 .6H21a2 2 0 1 1 0 4h-.09c-.39-.07-.77.21-1 .6Z" />
        </svg>
      )
    default:
      return null
  }
}

function SidebarItem({ icon, label, active = false }) {
  return (
    <button
      type="button"
      className={`mx-1.5 flex w-full flex-col items-center justify-center rounded-lg py-3 text-white transition ${
        active ? 'bg-[#3b6f57]' : 'hover:bg-[#1b5c3d]'
      }`}
    >
      <SidebarIcon name={icon} />
      <span className="mt-1 text-center text-[10px] font-semibold leading-4">{label}</span>
    </button>
  )
}

function CourseFormSidebar() {
  return (
    <aside className="hidden min-h-screen w-20 flex-col items-center bg-[#0d4f31] py-4 lg:flex">
      <div className="mb-6 rounded-xl bg-[#144f35] p-2.5 text-yellow-400">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      <div className="mb-3 w-full border-t border-white/30" />

      <div className="flex w-full flex-col gap-1.5">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.key === 'courses'}
          />
        ))}
      </div>
    </aside>
  )
}

export default CourseFormSidebar
