import DashboardSidebar from './DashboardSidebar'
import DashboardTopBar  from './DashboardTopBar'
import institutionLogo  from '../../assets/Logo_4.png'
import { useSidebarNav } from '../../hooks/useSidebarNav'

export default function DashboardLayout({ activeNav, children }) {
  const { navItems, handleNav, handleLogout, institutionName } = useSidebarNav()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[Sora,sans-serif]">
      <DashboardSidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={handleNav}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        institutionName={institutionName}
      />
      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar />
        {children}
      </main>
    </div>
  )
}
