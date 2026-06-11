import { useState } from 'react'
import SuperAdminSidebar from '../superadmin/SuperAdminSidebar'
import DashboardTopBar from './DashboardTopBar'

export default function SuperAdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />
      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar />
        {children}
      </main>
    </div>
  )
}
