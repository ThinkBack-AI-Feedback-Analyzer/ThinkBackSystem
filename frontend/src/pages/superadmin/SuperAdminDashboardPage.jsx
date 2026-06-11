import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBuilding, FaUserShield, FaUsers, FaCheckCircle,
  FaTimesCircle, FaShieldAlt, FaComments, FaClock, FaHourglassHalf,
} from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getSuperAdminStats, getInstitutions, getAnalytics, getPendingInstitutions } from '../../services/superadmin'
import { toast } from 'sonner'

/* ── 3-D stat card styles ────────────────────────────────────── */
const CARD_STYLES = `
  .sa-card { transform: perspective(2000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(var(--tz,0px));
    box-shadow: 0 0 0 1px rgba(16,185,129,0.06), var(--sx,0px) var(--sy,20px) 40px rgba(16,185,129,0.08),
      0 15px 25px -5px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.65);
    transition: transform .1s ease-out, box-shadow .1s ease-out, border-color .2s; }
  .sa-card:hover { border-color: rgba(16,185,129,0.28) !important; }
  .sa-shine { background: radial-gradient(circle at var(--shx,50%) var(--shy,50%), rgba(255,255,255,0.12) 0%, transparent 70%);
    opacity: var(--sho,0); transition: opacity .4s; }
  .sa-card:hover .sa-shine { --sho: 1; }
  .sa-ghost { background: rgba(16,185,129,0.05); transition: all .6s cubic-bezier(0.34,1.56,0.64,1); transform: scale(var(--gs,1)) translateZ(-1px); }
  .sa-card:hover .sa-ghost { transform: scale(1.2) translateZ(-1px); }
`

function StatCard({ stat }) {
  const ref  = useRef(null)
  const move = (e) => {
    const r  = ref.current.getBoundingClientRect()
    const x  = e.clientX - r.left, y = e.clientY - r.top
    const rx = ((y - r.height / 2) / (r.height / 2)) * -15
    const ry = ((x - r.width  / 2) / (r.width  / 2)) * 15
    const el = ref.current
    el.style.setProperty('--rx', `${rx}deg`); el.style.setProperty('--ry', `${ry}deg`)
    el.style.setProperty('--tz', '50px')
    el.style.setProperty('--shx', `${(x / r.width) * 100}%`); el.style.setProperty('--shy', `${(y / r.height) * 100}%`)
    el.style.setProperty('--sx', `${(ry / 15) * -12}px`); el.style.setProperty('--sy', `${(rx / 15) * 12 + 15}px`)
    el.style.setProperty('--gs', '1.3')
  }
  const leave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--tz', '0px');  el.style.setProperty('--sy', '10px'); el.style.setProperty('--gs', '1')
  }
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave}
      className="sa-card relative overflow-hidden flex flex-col bg-white rounded-2xl border border-[rgba(24,80,55,0.14)] p-5 cursor-pointer [transform-style:preserve-3d]">
      <div className="sa-shine absolute inset-0 pointer-events-none z-[5]" />
      <div className="sa-ghost absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full z-0" />
      <div className="relative z-[1] flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${stat.bg} ${stat.color}`}>{stat.icon}</div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.badgeBg} ${stat.badgeColor}`}>{stat.badge}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">{stat.label}</div>
        <div className="text-3xl font-bold text-slate-800 mb-3 leading-none tracking-tight">{stat.value}</div>
        <div className="mt-auto w-full">
          <div className="w-full h-1 bg-slate-100 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Growth bar chart ────────────────────────────────────────── */
function GrowthChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-1">Institution Growth</h2>
      <p className="text-xs text-slate-400 mb-6">New registrations per month (last 12 months)</p>
      <div className="flex items-end gap-1.5 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              {/* tooltip */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-slate-800 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {d.count}
                </div>
              </div>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${(d.count / max) * 100}%`,
                  minHeight: d.count > 0 ? '4px' : '2px',
                  background: d.count > 0
                    ? 'linear-gradient(to top, #059669, #34d399)'
                    : '#f1f5f9',
                }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-medium">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Role distribution donut ─────────────────────────────────── */
function RoleDonut({ roles }) {
  const total = (roles.institution_admin || 0) + (roles.lecturer || 0) + (roles.coordinator || 0)
  if (total === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center">
      <p className="text-sm text-slate-400">No users yet</p>
    </div>
  )

  const adminPct  = Math.round((roles.institution_admin / total) * 100)
  const lecPct    = Math.round((roles.lecturer          / total) * 100)
  const coordPct  = 100 - adminPct - lecPct

  const segments = [
    { label: 'Admins',       count: roles.institution_admin, pct: adminPct, color: '#9333ea', light: 'bg-purple-100 text-purple-700' },
    { label: 'Lecturers',    count: roles.lecturer,          pct: lecPct,   color: '#3b82f6', light: 'bg-blue-100 text-blue-700' },
    { label: 'Coordinators', count: roles.coordinator,       pct: coordPct, color: '#f59e0b', light: 'bg-amber-100 text-amber-700' },
  ]

  const gradientStops = segments.reduce((acc, seg, i) => {
    const prev = i === 0 ? 0 : acc[i - 1].end
    const end  = prev + seg.pct
    acc.push({ ...seg, start: prev, end })
    return acc
  }, [])

  const gradient = gradientStops
    .map(s => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ')

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-1">Role Distribution</h2>
      <p className="text-xs text-slate-400 mb-6">Breakdown across all institutions</p>
      <div className="flex items-center gap-8">
        {/* Donut via conic-gradient */}
        <div className="relative shrink-0 w-28 h-28">
          <div
            className="w-28 h-28 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="absolute inset-[22px] rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-800 leading-none">{total}</span>
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Users</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-slate-600">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-6 text-right">{s.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Feedback volume ─────────────────────────────────────────── */
function FeedbackVolume({ data }) {
  const max = Math.max(...data.map(d => d.response_count), 1)
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-1">Feedback Volume</h2>
      <p className="text-xs text-slate-400 mb-5">Top institutions by response count</p>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No feedback responses yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((inst, i) => (
            <div key={inst.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0">#{i + 1}</span>
                  <span className="text-xs font-medium text-slate-700 truncate">{inst.institution_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400">{inst.form_count} forms</span>
                  <span className="text-xs font-semibold text-emerald-700">{inst.response_count} responses</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${(inst.response_count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const [stats,     setStats]     = useState(null)
  const [recent,    setRecent]    = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [pending,   setPending]   = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    Promise.all([getSuperAdminStats(), getInstitutions(), getAnalytics(), getPendingInstitutions()])
      .then(([s, inst, a, pend]) => {
        setStats(s)
        setRecent(inst.slice(0, 5))
        setAnalytics(a)
        setPending(pend)
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [navigate])

  const statCards = stats ? [
    { label: 'Total Institutions',   value: stats.total_institutions,
      icon: <FaBuilding />,     bg: 'bg-blue-50',    color: 'text-blue-500',
      badge: 'All',             badgeBg: 'bg-blue-50',    badgeColor: 'text-blue-600',   progress: 100 },
    { label: 'Active Institutions',  value: stats.active_institutions,
      icon: <FaCheckCircle />,  bg: 'bg-emerald-50', color: 'text-emerald-500',
      badge: 'Active',          badgeBg: 'bg-emerald-50', badgeColor: 'text-emerald-600',
      progress: stats.total_institutions ? Math.round((stats.active_institutions / stats.total_institutions) * 100) : 0 },
    { label: 'Inactive Institutions', value: stats.inactive_institutions,
      icon: <FaTimesCircle />,  bg: 'bg-red-50',     color: 'text-red-400',
      badge: 'Inactive',        badgeBg: 'bg-red-50',     badgeColor: 'text-red-500',
      progress: stats.total_institutions ? Math.round((stats.inactive_institutions / stats.total_institutions) * 100) : 0 },
    { label: 'Institution Admins',   value: stats.total_admins,
      icon: <FaUserShield />,   bg: 'bg-purple-50',  color: 'text-purple-500',
      badge: `${stats.active_admins} active`, badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600',
      progress: stats.total_admins ? Math.round((stats.active_admins / stats.total_admins) * 100) : 0 },
    { label: 'Total Users',          value: stats.total_users,
      icon: <FaUsers />,        bg: 'bg-amber-50',   color: 'text-amber-500',
      badge: 'Users',           badgeBg: 'bg-amber-50',   badgeColor: 'text-amber-600',  progress: 80 },
    { label: 'Pending Approvals',    value: stats.pending_institutions,
      icon: <FaHourglassHalf />, bg: 'bg-orange-50', color: 'text-orange-500',
      badge: stats.pending_institutions > 0 ? 'Action needed' : 'All clear',
      badgeBg: stats.pending_institutions > 0 ? 'bg-orange-50' : 'bg-slate-50',
      badgeColor: stats.pending_institutions > 0 ? 'text-orange-600' : 'text-slate-400',
      progress: 0 },
  ] : []

  return (
    <SuperAdminLayout>
      <style>{CARD_STYLES}</style>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Super Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">System-wide overview</p>
        </div>

            {/* Pending Approvals Widget */}
            {!loading && pending.length > 0 && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <FaClock className="text-xl text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Pending Approvals Action Required</h2>
                    <p className="text-sm text-slate-600 mt-0.5">You have <strong className="text-amber-700">{pending.length}</strong> institution registrations waiting for review.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/superadmin/approvals')}
                  className="relative z-10 whitespace-nowrap rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md"
                >
                  Review Approvals →
                </button>
              </div>
            )}

            {/* Stat cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-36" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {statCards.map((s, i) => <StatCard key={i} stat={s} />)}
              </div>
            )}

            {/* Analytics row: growth chart */}
            {analytics && <GrowthChart data={analytics.growth} />}

            {/* Analytics row: role donut + feedback volume */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoleDonut roles={analytics.roles} />
                <FeedbackVolume data={analytics.feedback_volume} />
              </div>
            )}

            {!analytics && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0, 1].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-48" />)}
              </div>
            )}

            {/* Recent Institutions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">Recent Institutions</h2>
                <button onClick={() => navigate('/superadmin/institutions')}
                  className="text-xs text-emerald-600 hover:underline font-medium">View all</button>
              </div>
              {recent.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400">No institutions registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-3">Institution</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Admin</th>
                        <th className="px-6 py-3">Country</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(inst => (
                        <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-700">{inst.institution_name}</td>
                          <td className="px-6 py-3 text-slate-500">{inst.institution_type}</td>
                          <td className="px-6 py-3 text-slate-500">{inst.admin_email || '—'}</td>
                          <td className="px-6 py-3 text-slate-500">{inst.country || '—'}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${inst.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                              {inst.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      </div>
    </SuperAdminLayout>
  )
}
