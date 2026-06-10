import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FaCog, FaSave, FaBuilding, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getInstitutionSettings, updateInstitutionSettings } from '../../services/institutions'
import { useCurrentUser } from '../../hooks/useSidebarNav'

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        <Icon className="text-emerald-500" /> {label}
      </label>
      {children}
    </div>
  )
}

const INPUT = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400'

export default function SettingsPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const [form, setForm]       = useState({ institution_name: '', institution_type: '', phone_number: '', address: '', country: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'institution_admin') { navigate('/'); return }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    getInstitutionSettings()
      .then((data) => setForm({
        institution_name: data.institution_name ?? '',
        institution_type: data.institution_type ?? '',
        phone_number:     data.phone_number     ?? '',
        address:          data.address          ?? '',
        country:          data.country          ?? '',
      }))
      .catch(() => toast.error('Failed to load settings.'))
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.institution_name.trim()) { toast.error('Institution name is required.'); return }
    setSaving(true)
    try {
      await updateInstitutionSettings(form)
      toast.success('Settings saved successfully.')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading…</div>

  return (
    <DashboardLayout activeNav="settings">

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Administration</p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Institution Settings</h1>
            <p className="mt-2 max-w-md text-sm text-white/60">Manage your institution's profile and contact information.</p>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[32px] bg-white shadow-md overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0fdf9] text-emerald-600">
                  <FaCog />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Institution Profile</p>
                  <p className="text-xs text-slate-400">Update your institution's details</p>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center text-sm text-slate-400">Loading settings…</div>
              ) : (
                <form onSubmit={handleSave} className="p-6 space-y-5">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Institution Name" icon={FaBuilding}>
                      <input
                        name="institution_name"
                        value={form.institution_name}
                        onChange={handleChange}
                        placeholder="e.g. University of Moratuwa"
                        className={INPUT}
                        required
                      />
                    </Field>

                    <Field label="Institution Type" icon={FaBuilding}>
                      <select name="institution_type" value={form.institution_type} onChange={handleChange} className={INPUT}>
                        <option value="">Select type…</option>
                        <option value="University">University</option>
                        <option value="College">College</option>
                        <option value="Polytechnic">Polytechnic</option>
                        <option value="School">School</option>
                        <option value="Training Centre">Training Centre</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Phone Number" icon={FaPhone}>
                      <input
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder="+94 11 269 0000"
                        className={INPUT}
                      />
                    </Field>

                    <Field label="Country" icon={FaGlobe}>
                      <input
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="e.g. Sri Lanka"
                        className={INPUT}
                      />
                    </Field>
                  </div>

                  {/* Row 3 — full width */}
                  <Field label="Address" icon={FaMapMarkerAlt}>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Street, City, Postal Code, Country"
                      className={INPUT + ' resize-none'}
                    />
                  </Field>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#13462D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f3a26] disabled:opacity-60 transition"
                    >
                      <FaSave className="text-xs" />
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
