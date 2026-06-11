import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaBuilding,
  FaUser, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt,
} from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getPendingInstitutions, approveInstitution, rejectInstitution } from '../../services/superadmin'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function RejectConfirmDialog({ institution, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <FaTimesCircle className="text-red-500 text-xl" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 text-center mb-1">Reject Institution?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          This will reject the registration request for{' '}
          <span className="font-semibold text-slate-700">{institution?.institution_name}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={10} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xs font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  )
}

export default function PendingApprovalsPage() {
  const [pending,       setPending]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectTarget,  setRejectTarget]  = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const data = await getPendingInstitutions()
      setPending(data || [])
    } catch {
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve')
    try {
      await approveInstitution(id)
      toast.success('Institution approved successfully!')
      fetchPending()
    } catch {
      toast.error('Failed to approve institution')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectConfirm = async () => {
    const inst = rejectTarget
    setRejectTarget(null)
    setActionLoading(inst.id + '_reject')
    try {
      await rejectInstitution(inst.id)
      toast.success('Institution rejected.')
      fetchPending()
    } catch {
      toast.error('Failed to reject institution')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-5 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pending Approvals</h1>
            <p className="text-xs text-slate-400 mt-0.5">Review and approve incoming institution registration requests</p>
          </div>
          {pending.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              {pending.length} awaiting review
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-56" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-emerald-500 text-2xl" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">All caught up!</h2>
            <p className="text-sm text-slate-400">No pending institution registrations to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pending.map(inst => (
              <div key={inst.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all">

                {/* Card top bar */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />

                <div className="p-5 flex flex-col flex-1">
                  {/* Institution identity */}
                  <div className="flex items-start gap-3 mb-4">
                    {inst.logo ? (
                      <img src={inst.logo} alt="" className="w-12 h-12 rounded-xl object-contain border border-slate-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                        <FaBuilding className="text-slate-400 text-lg" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-800 leading-tight line-clamp-2">{inst.institution_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {inst.institution_type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                          <FaClock size={8} /> Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-2.5 flex-1 mb-4">
                    <InfoRow icon={FaUser}         label="Admin"     value={inst.admin_name} />
                    <InfoRow icon={FaEnvelope}     label="Email"     value={inst.admin_email} />
                    <InfoRow icon={FaPhone}        label="Phone"     value={inst.admin_phone} />
                    <InfoRow icon={FaGlobe}        label="Country"   value={inst.country} />
                    <InfoRow icon={FaMapMarkerAlt} label="Submitted" value={formatDate(inst.created_at)} />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 mt-auto">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => setRejectTarget(inst)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {actionLoading === inst.id + '_reject'
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <><FaTimesCircle size={13} /> Reject</>
                      }
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => handleApprove(inst.id)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionLoading === inst.id + '_approve'
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><FaCheckCircle size={13} /> Approve</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectConfirmDialog
          institution={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </SuperAdminLayout>
  )
}
