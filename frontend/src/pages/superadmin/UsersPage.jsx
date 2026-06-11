import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaSearch, FaFilter, FaToggleOn, FaToggleOff,
  FaCheck, FaBan, FaUsers, FaBuilding,
} from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getAllUsers, toggleUser, getInstitutions } from '../../services/superadmin'
import { Select } from '../../components/ui/Select'
import { ActionMenu } from '../../components/common/ActionMenu'
import { toast } from 'sonner'

/* ── Role display config ─────────────────────────────────────── */
const ROLE_META = {
  institution_admin: { label: 'Admin',       bg: 'bg-purple-50',  color: 'text-purple-700' },
  lecturer:          { label: 'Lecturer',    bg: 'bg-blue-50',    color: 'text-blue-700'   },
  coordinator:       { label: 'Coordinator', bg: 'bg-amber-50',   color: 'text-amber-700'  },
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, bg: 'bg-slate-100', color: 'text-slate-600' }
  return (
    <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const palette  = [
    'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600', 'bg-pink-100 text-pink-600',
    'bg-teal-100 text-teal-600', 'bg-rose-100 text-rose-600',
  ]
  const color = palette[(name?.charCodeAt(0) || 0) % palette.length]
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

/* ── Role summary counts ─────────────────────────────────────── */
function SummaryChip({ label, count, bg, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bg}`}>
      <span className={`text-lg font-bold ${color}`}>{count}</span>
      <span className={`text-xs font-medium ${color} opacity-80`}>{label}</span>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function UsersPage() {
  const navigate = useNavigate()
  const [users,       setUsers]       = useState([])
  const [institutions, setInstitutions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [statusFilter,setStatusFilter]= useState('')
  const [instFilter,  setInstFilter]  = useState('')
  const [toggling,    setToggling]    = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    getInstitutions().then(setInstitutions).catch(() => {})
  }, [navigate])

  const load = useCallback(() => {
    setLoading(true)
    getAllUsers({ search, role: roleFilter, status: statusFilter, institution: instFilter })
      .then(setUsers)
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [search, roleFilter, statusFilter, instFilter])

  useEffect(() => { load() }, [load])

  const handleToggle = async (user) => {
    setToggling(user.id)
    try {
      const updated = await toggleUser(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
      toast.success(`${updated.full_name} ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setToggling(null)
    }
  }

  /* ── Summary counts ── */
  const counts = {
    total:       users.length,
    active:      users.filter(u => u.is_active).length,
    inactive:    users.filter(u => !u.is_active).length,
    admins:      users.filter(u => u.role === 'institution_admin').length,
    lecturers:   users.filter(u => u.role === 'lecturer').length,
    coordinators:users.filter(u => u.role === 'coordinator').length,
  }

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">All Users</h1>
            <p className="text-xs text-slate-400 mt-0.5">Every user across all institutions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              <FaUsers size={10} /> {counts.total} total
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
              <FaCheck size={9} /> {counts.active} active
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
              <FaBan size={9} /> {counts.inactive} inactive
            </span>
          </div>
        </div>
          {/* Role summary row */}
          <div className="flex flex-wrap gap-3">
            <SummaryChip label="Admins"       count={counts.admins}       bg="bg-purple-50" color="text-purple-700" />
            <SummaryChip label="Lecturers"    count={counts.lecturers}    bg="bg-blue-50"   color="text-blue-700"   />
            <SummaryChip label="Coordinators" count={counts.coordinators} bg="bg-amber-50"  color="text-amber-700"  />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FaFilter className="text-slate-400 text-sm shrink-0" />
              <div className="w-36">
                <Select
                  value={roleFilter || 'all'}
                  onChange={e => setRoleFilter(e.target.value === 'all' ? '' : e.target.value)}
                  options={[
                    { value: 'all',               label: 'All Roles' },
                    { value: 'institution_admin', label: 'Admin' },
                    { value: 'lecturer',          label: 'Lecturer' },
                    { value: 'coordinator',       label: 'Coordinator' },
                  ]}
                />
              </div>
              <div className="w-36">
                <Select
                  value={statusFilter || 'all'}
                  onChange={e => setStatusFilter(e.target.value === 'all' ? '' : e.target.value)}
                  options={[
                    { value: 'all',      label: 'All Status' },
                    { value: 'active',   label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>
              <div className="w-52">
                <Select
                  value={instFilter || 'all'}
                  onChange={e => setInstFilter(e.target.value === 'all' ? '' : e.target.value)}
                  options={[
                    { value: 'all', label: 'All Institutions' },
                    ...institutions.map(i => ({ value: String(i.id), label: i.institution_name })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <FaUsers className="text-slate-200 text-4xl mx-auto mb-3" />
                <p className="text-sm text-slate-400">No users match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Institution</th>
                      <th className="px-5 py-3">Last Login</th>
                      <th className="px-5 py-3">Joined</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.full_name} />
                            <div>
                              <div className="font-medium text-slate-700 leading-tight">{user.full_name}</div>
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-3 text-slate-500 max-w-[160px] truncate">
                          {user.institution_name || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {user.last_login ? (
                            <>
                              <div>{new Date(user.last_login).toLocaleDateString()}</div>
                              <div className="text-slate-300">{new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </>
                          ) : <span className="text-slate-300">Never</span>}
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            user.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {user.is_active ? <FaCheck size={9} /> : <FaBan size={9} />}
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <ActionMenu items={[
                              {
                                label: user.is_active ? 'Deactivate' : 'Activate',
                                icon: user.is_active ? FaToggleOff : FaToggleOn,
                                onClick: () => handleToggle(user),
                                disabled: toggling === user.id,
                                className: user.is_active ? 'text-orange-500' : 'text-emerald-600',
                              },
                              ...(user.institution_id ? [{
                                label: 'View Institution',
                                icon: FaBuilding,
                                onClick: () => navigate(`/superadmin/institutions/${user.institution_id}`),
                              }] : []),
                            ]} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Showing {users.length} user{users.length !== 1 ? 's' : ''}
            {roleFilter && ` · filtered by ${ROLE_META[roleFilter]?.label ?? roleFilter}`}
            {statusFilter && ` · ${statusFilter}`}
          </p>
      </div>
    </SuperAdminLayout>
  )
}
