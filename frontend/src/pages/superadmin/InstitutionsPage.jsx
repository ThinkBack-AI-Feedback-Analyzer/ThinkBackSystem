import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBuilding, FaSearch, FaToggleOn, FaToggleOff, FaTrash,
  FaFilter, FaShieldAlt, FaCheck, FaBan,
} from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getInstitutions, toggleInstitution, deleteInstitution } from '../../services/superadmin'
import { toast } from 'sonner'

function ConfirmDeleteDialog({ institution, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Delete Institution?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This will permanently delete{' '}
          <span className="font-semibold text-slate-700">{institution?.institution_name}</span> and all its data. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InstitutionsPage() {
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState([])
  const [loading,   setLoading]    = useState(true)
  const [search,    setSearch]     = useState('')
  const [filter,    setFilter]     = useState('')
  const [collapsed, setCollapsed]  = useState(false)
  const [toDelete,  setToDelete]   = useState(null)
  const [toggling,  setToggling]   = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getInstitutions({ search, status: filter })
      .then(setInstitutions)
      .catch(() => toast.error('Failed to load institutions'))
      .finally(() => setLoading(false))
  }, [search, filter])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    load()
  }, [load, navigate])

  const handleToggle = async (inst) => {
    setToggling(inst.id)
    try {
      const updated = await toggleInstitution(inst.id)
      setInstitutions(prev => prev.map(i => i.id === inst.id ? updated : i))
      toast.success(`Institution ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update institution status')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteInstitution(toDelete.id)
      setInstitutions(prev => prev.filter(i => i.id !== toDelete.id))
      toast.success('Institution deleted')
    } catch {
      toast.error('Failed to delete institution')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Institutions</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage all registered institutions</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <FaShieldAlt className="text-white text-xs" />
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by institution name…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400 text-sm" />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : institutions.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">No institutions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3">Institution</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Admin</th>
                      <th className="px-5 py-3">Country</th>
                      <th className="px-5 py-3">Users</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Registered</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map(inst => (
                      <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {inst.logo ? (
                              <img src={inst.logo} alt="" className="w-8 h-8 rounded-lg object-contain border border-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <FaBuilding className="text-emerald-500 text-xs" />
                              </div>
                            )}
                            <span className="font-medium text-slate-700">{inst.institution_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{inst.institution_type}</td>
                        <td className="px-5 py-3">
                          <div className="text-slate-700 font-medium">{inst.admin_name || '—'}</div>
                          {inst.admin_email && <div className="text-xs text-slate-400">{inst.admin_email}</div>}
                        </td>
                        <td className="px-5 py-3 text-slate-500">{inst.country || '—'}</td>
                        <td className="px-5 py-3 text-slate-500">{inst.total_users}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            inst.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {inst.is_active ? <FaCheck size={9} /> : <FaBan size={9} />}
                            {inst.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(inst.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => navigate(`/superadmin/institutions/${inst.id}`)} title="View Details"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button onClick={() => handleToggle(inst)} disabled={toggling === inst.id}
                              title={inst.is_active ? 'Deactivate' : 'Activate'}
                              className={`p-1.5 rounded-lg transition-colors ${inst.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'} disabled:opacity-50`}>
                              {toggling === inst.id
                                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                : inst.is_active ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />
                              }
                            </button>
                            <button onClick={() => setToDelete(inst)} title="Delete"
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                              <FaTrash size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">{institutions.length} institution{institutions.length !== 1 ? 's' : ''} found</p>
        </div>
      </main>

      {toDelete && (
        <ConfirmDeleteDialog institution={toDelete} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
