import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUserShield, FaSearch, FaToggleOn, FaToggleOff,
  FaFilter, FaBuilding, FaCheck, FaBan,
} from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getAdmins, toggleAdmin } from '../../services/superadmin'
import { Select } from '../../components/ui/Select'
import { ActionMenu } from '../../components/common/ActionMenu'
import { toast } from 'sonner'

function Avatar({ name }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const colors   = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
                    'bg-amber-100 text-amber-600', 'bg-pink-100 text-pink-600', 'bg-teal-100 text-teal-600']
  const color    = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function AdminsPage() {
  const navigate = useNavigate()
  const [admins,    setAdmins]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('')
  const [toggling,  setToggling]  = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getAdmins({ search, status: filter })
      .then(setAdmins)
      .catch(() => toast.error('Failed to load admins'))
      .finally(() => setLoading(false))
  }, [search, filter])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    load()
  }, [load, navigate])

  const handleToggle = async (admin) => {
    setToggling(admin.id)
    try {
      const updated = await toggleAdmin(admin.id)
      setAdmins(prev => prev.map(a => a.id === admin.id ? updated : a))
      toast.success(`Admin ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update admin status')
    } finally {
      setToggling(null)
    }
  }

  const activeCount   = admins.filter(a => a.is_active).length
  const inactiveCount = admins.filter(a => !a.is_active).length

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Institution Admins</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage institution admin accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
              <FaCheck size={9} /> {activeCount} active
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
              <FaBan size={9} /> {inactiveCount} inactive
            </span>
          </div>
        </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400 text-sm" />
              <div className="w-40">
                <Select
                  value={filter || 'all'}
                  onChange={e => setFilter(e.target.value === 'all' ? '' : e.target.value)}
                  options={[
                    { value: 'all',      label: 'All Status' },
                    { value: 'active',   label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">No admins found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3">Admin</th>
                      <th className="px-5 py-3">Institution</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Joined</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={admin.full_name} />
                            <div>
                              <div className="font-medium text-slate-700">{admin.full_name}</div>
                              <div className="text-xs text-slate-400">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FaBuilding className="text-slate-300 text-xs shrink-0" />
                            {admin.institution_name || <span className="text-slate-300">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{admin.phone_number || '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            admin.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {admin.is_active ? <FaCheck size={9} /> : <FaBan size={9} />}
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <ActionMenu items={[
                              {
                                label: admin.is_active ? 'Deactivate' : 'Activate',
                                icon: admin.is_active ? FaToggleOff : FaToggleOn,
                                onClick: () => handleToggle(admin),
                                disabled: toggling === admin.id,
                                className: admin.is_active ? 'text-orange-500' : 'text-emerald-600',
                              },
                              ...(admin.institution_id ? [{
                                label: 'View Institution',
                                icon: FaBuilding,
                                onClick: () => navigate(`/superadmin/institutions/${admin.institution_id}`),
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

          <p className="text-xs text-slate-400">{admins.length} admin{admins.length !== 1 ? 's' : ''} found</p>
      </div>
    </SuperAdminLayout>
  )
}
