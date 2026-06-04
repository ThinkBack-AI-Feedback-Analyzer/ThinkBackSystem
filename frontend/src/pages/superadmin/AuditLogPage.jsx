import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaHistory, FaFilter, FaSearch, FaShieldAlt,
  FaBuilding, FaUser, FaKey, FaEdit,
  FaToggleOn, FaToggleOff, FaTrash,
} from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getAuditLog } from '../../services/superadmin'
import { toast } from 'sonner'

/* ── Action display config ───────────────────────────────────── */
const ACTION_META = {
  activate_institution:   { label: 'Activated Institution',   icon: FaToggleOn,  bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  deactivate_institution: { label: 'Deactivated Institution', icon: FaToggleOff, bg: 'bg-red-50',     color: 'text-red-600',     dot: 'bg-red-400'     },
  delete_institution:     { label: 'Deleted Institution',     icon: FaTrash,     bg: 'bg-red-50',     color: 'text-red-700',     dot: 'bg-red-600'     },
  activate_user:          { label: 'Activated User',          icon: FaToggleOn,  bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  deactivate_user:        { label: 'Deactivated User',        icon: FaToggleOff, bg: 'bg-orange-50',  color: 'text-orange-600',  dot: 'bg-orange-400'  },
  change_password:        { label: 'Changed Password',        icon: FaKey,       bg: 'bg-blue-50',    color: 'text-blue-700',    dot: 'bg-blue-500'    },
  update_profile:         { label: 'Updated Profile',         icon: FaEdit,      bg: 'bg-slate-50',   color: 'text-slate-600',   dot: 'bg-slate-400'   },
}

const TARGET_ICON = { institution: FaBuilding, user: FaUser, profile: FaShieldAlt }

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || { label: action, bg: 'bg-slate-50', color: 'text-slate-600', dot: 'bg-slate-400' }
  const Icon = meta.icon || FaHistory
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
      <Icon size={10} />
      {meta.label}
    </span>
  )
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/* ── Main page ───────────────────────────────────────────────── */
export default function AuditLogPage() {
  const navigate = useNavigate()
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [search,     setSearch]     = useState('')
  const [collapsed,  setCollapsed]  = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getAuditLog({ action: actionFilter })
      .then(setLogs)
      .catch(() => toast.error('Failed to load audit log'))
      .finally(() => setLoading(false))
  }, [actionFilter])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    load()
  }, [load, navigate])

  const filtered = search
    ? logs.filter(l =>
        l.target_name.toLowerCase().includes(search.toLowerCase()) ||
        (ACTION_META[l.action]?.label || l.action).toLowerCase().includes(search.toLowerCase())
      )
    : logs

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
            <p className="text-xs text-slate-400 mt-0.5">All super admin actions — last 200 entries</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              <FaHistory size={10} /> {filtered.length} entries
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <FaShieldAlt className="text-white text-xs" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by target name or action…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400 text-sm" />
              <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="">All Actions</option>
                <option value="activate_institution">Activated Institution</option>
                <option value="deactivate_institution">Deactivated Institution</option>
                <option value="delete_institution">Deleted Institution</option>
                <option value="activate_user">Activated User</option>
                <option value="deactivate_user">Deactivated User</option>
                <option value="change_password">Changed Password</option>
                <option value="update_profile">Updated Profile</option>
              </select>
            </div>
          </div>

          {/* Log table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FaHistory className="text-slate-200 text-4xl mx-auto mb-3" />
                <p className="text-sm text-slate-400">No audit entries found.</p>
                <p className="text-xs text-slate-300 mt-1">Actions will appear here as you manage the platform.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Target</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Performed By</th>
                      <th className="px-5 py-3">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(log => {
                      const meta   = ACTION_META[log.action] || {}
                      const TIcon  = TARGET_ICON[log.target_type] || FaUser
                      return (
                        <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot || 'bg-slate-300'}`} />
                              <ActionBadge action={log.action} />
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-700 max-w-[180px] truncate">
                            {log.target_name}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <TIcon size={10} className="text-slate-400" />
                              <span className="capitalize">{log.target_type}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{log.performed_by_name}</td>
                          <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{formatTime(log.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">{filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} shown</p>
        </div>
      </main>
    </div>
  )
}
