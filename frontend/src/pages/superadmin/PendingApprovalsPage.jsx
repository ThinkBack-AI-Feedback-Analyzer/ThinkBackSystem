import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaBuilding
} from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getPendingInstitutions, approveInstitution, rejectInstitution } from '../../services/superadmin'

export default function PendingApprovalsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const data = await getPendingInstitutions()
      setPending(data || [])
    } catch (err) {
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve')
    try {
      await approveInstitution(id)
      toast.success('Institution approved successfully!')
      fetchPending()
    } catch (err) {
      toast.error('Failed to approve institution')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this institution?')) return
    setActionLoading(id + '_reject')
    try {
      await rejectInstitution(id)
      toast.success('Institution rejected.')
      fetchPending()
    } catch (err) {
      toast.error('Failed to reject institution')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pending Approvals</h1>
            <p className="text-xs text-slate-400 mt-0.5">Review and manage incoming institution registration requests</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center relative border border-amber-100">
            <FaClock className="text-amber-500 text-sm" />
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>
        </div>

        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-48 shadow-sm" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
                <FaCheckCircle className="text-3xl" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">All caught up!</h2>
              <p className="text-slate-500">There are no pending institution registrations to review at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pending.map(inst => (
                <div key={inst.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-slate-300">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {inst.logo ? (
                        <img src={inst.logo} alt="" className="w-12 h-12 rounded-xl object-contain border border-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <FaBuilding className="text-slate-400 text-lg" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1" title={inst.institution_name}>{inst.institution_name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{inst.institution_type} • {inst.country || 'No country'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <FaClock size={9} /> Pending
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Admin</span>
                      <span className="font-medium text-slate-800">{inst.admin_name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Email</span>
                      <span className="font-medium text-slate-800 truncate ml-4" title={inst.admin_email}>{inst.admin_email || '—'}</span>
                    </div>
                    {inst.admin_phone && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Phone</span>
                        <span className="font-medium text-slate-800">{inst.admin_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => handleReject(inst.id)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                    >
                      {actionLoading === inst.id + '_reject' ? '...' : <><FaTimesCircle /> Reject</>}
                    </button>
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => handleApprove(inst.id)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow disabled:opacity-50"
                    >
                      {actionLoading === inst.id + '_approve' ? '...' : <><FaCheckCircle /> Approve</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
