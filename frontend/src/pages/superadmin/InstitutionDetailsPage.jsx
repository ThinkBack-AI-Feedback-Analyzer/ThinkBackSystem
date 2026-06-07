import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft, FaBuilding, FaUsers, FaFileAlt, FaChartBar,
  FaCheckCircle, FaBan, FaEnvelope, FaPhone, FaUserTie,
} from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getInstitutionDetails } from '../../services/superadmin'
import { toast } from 'sonner'

export default function InstitutionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [institution, setInstitution] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'forms'

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await getInstitutionDetails(id)
      setInstitution(data)
    } catch (err) {
      toast.error('Failed to load institution details')
      navigate('/superadmin/institutions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
        <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  if (!institution) return null

  const stats = institution.stats || { total_forms: 0, total_responses: 0, response_rate: 0 }
  const users = institution.users || []
  const forms = institution.feedback_forms || []

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/superadmin/institutions')}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              {institution.institution_name}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                institution.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {institution.is_active ? <FaCheckCircle size={10} /> : <FaBan size={10} />}
                {institution.is_active ? 'Active' : 'Inactive'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {institution.institution_type} · Registered {new Date(institution.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Top Row: Profile Card + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-50 to-transparent" />
              
              {institution.logo ? (
                <img src={institution.logo} alt="Logo" className="w-24 h-24 rounded-2xl object-contain border-4 border-white shadow-md relative z-10 bg-white" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center relative z-10 text-emerald-600">
                  <FaBuilding className="text-4xl" />
                </div>
              )}
              
              <h2 className="mt-4 text-lg font-bold text-slate-800">{institution.institution_name}</h2>
              <p className="text-sm text-slate-500">{institution.country || 'No Country Specified'}</p>
              
              <div className="mt-6 w-full space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Admin</h3>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FaUserTie className="text-slate-400 shrink-0" />
                  <span className="font-semibold">{institution.admin_name || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FaEnvelope className="text-slate-400 shrink-0" />
                  <span>{institution.admin_email || 'Not provided'}</span>
                </div>
                {institution.admin_phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <FaPhone className="text-slate-400 shrink-0" />
                    <span>{institution.admin_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                    <FaUsers />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Users</h3>
                    <p className="text-2xl font-bold text-slate-800 leading-tight">{users.length}</p>
                  </div>
                </div>
                <div className="mt-auto bg-slate-50 rounded-lg p-3 text-xs text-slate-500 font-medium border border-slate-100">
                  Includes admins, lecturers, and coordinators.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
                    <FaFileAlt />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Feedback Forms</h3>
                    <p className="text-2xl font-bold text-slate-800 leading-tight">{stats.total_forms}</p>
                  </div>
                </div>
                <div className="mt-auto bg-slate-50 rounded-lg p-3 text-xs text-slate-500 font-medium border border-slate-100">
                  Total forms created by this institution.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:col-span-2 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl" />
                <div className="flex items-center gap-4 mb-2 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                    <FaChartBar />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Responses</h3>
                    <p className="text-2xl font-bold text-slate-800 leading-tight">{stats.total_responses}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 relative z-10">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.response_rate}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{stats.response_rate}% Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Tables Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-6 px-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'users' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Users Directory
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'forms' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Feedback Forms
              </button>
            </div>

            <div className="p-0">
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No users found for this institution.</td></tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">{u.full_name}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                {u.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              <div>{u.email}</div>
                              {u.phone_number && <div className="text-xs">{u.phone_number}</div>}
                            </td>
                            <td className="px-6 py-4">
                              {u.is_active ? (
                                <span className="text-emerald-600 font-medium flex items-center gap-1.5"><FaCheckCircle className="text-[10px]" /> Active</span>
                              ) : (
                                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FaBan className="text-[10px]" /> Inactive</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'forms' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-4">Form Title</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Questions</th>
                        <th className="px-6 py-4">Responses</th>
                        <th className="px-6 py-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.length === 0 ? (
                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No forms created yet.</td></tr>
                      ) : (
                        forms.map(f => (
                          <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-800">{f.title}</td>
                            <td className="px-6 py-4 text-slate-600">{f.form_type}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                f.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {f.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{f.question_count}</td>
                            <td className="px-6 py-4 font-medium text-emerald-600">{f.response_count}</td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
