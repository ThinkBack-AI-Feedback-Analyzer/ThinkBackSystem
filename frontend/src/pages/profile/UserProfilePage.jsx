import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  FaUser, FaEnvelope, FaPhone,
  FaLock, FaCheckCircle, FaExclamationCircle,
  FaCalendarAlt, FaClock, FaShieldAlt, FaSave,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { useCurrentUser } from '../../hooks/useSidebarNav'
import { getMyProfile, updateMyProfile, changeMyPassword } from '../../services/users'

const ROLE_LABELS = {
  institution_admin: 'Institution Admin',
  coordinator:       'Coordinator',
  lecturer:          'Lecturer',
}

const INPUT = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed'
const INPUT_RO = 'w-full rounded-xl border border-slate-100 bg-slate-100 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed'

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        <Icon className="text-emerald-500" size={11} /> {label}
      </label>
      {children}
    </div>
  )
}

function InlineAlert({ type, message }) {
  if (!message) return null
  const err = type === 'error'
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
      err ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }`}>
      {err ? <FaExclamationCircle size={12} /> : <FaCheckCircle size={12} />}
      {message}
    </div>
  )
}

export default function UserProfilePage() {
  
  const [profile,    setProfile]    = useState(null)
  const [form,       setForm]       = useState({ full_name: '', phone_number: '' })
  const [pw,         setPw]         = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving,     setSaving]     = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwMsg,      setPwMsg]      = useState(null)

  useEffect(() => {
    getMyProfile()
      .then(data => {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone_number: data.phone_number || '' })
      })
      .catch(() => toast.error('Failed to load profile.'))
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { setProfileMsg({ type: 'error', text: 'Name is required.' }); return }
    setSaving(true); setProfileMsg(null)
    try {
      const updated = await updateMyProfile(form)
      setProfile(updated)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updated.full_name }))
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
      toast.success('Profile saved.')
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' })
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!pw.current_password || !pw.new_password || !pw.confirm_password) {
      setPwMsg({ type: 'error', text: 'All fields are required.' }); return
    }
    setChangingPw(true); setPwMsg(null)
    try {
      await changeMyPassword(pw)
      setPwMsg({ type: 'success', text: 'Password changed successfully.' })
      setPw({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Password changed.')
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to change password.' })
    } finally { setChangingPw(false) }
  }

  const initial = profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <DashboardLayout activeNav="profile">

        {/* ── Hero card ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-6 md:px-10 md:py-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white text-2xl font-bold ring-4 ring-white/10">
              {initial}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">My Profile</p>
              {profile ? (
                <>
                  <h1 className="text-2xl font-bold text-white truncate">{profile.full_name}</h1>
                  <p className="text-sm text-white/60 truncate mt-0.5">{profile.email}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80">
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </span>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="h-6 w-44 rounded-lg bg-white/10 animate-pulse" />
                  <div className="h-4 w-56 rounded-lg bg-white/10 animate-pulse" />
                </div>
              )}
            </div>

            {/* Meta — hidden on small screens */}
            {profile && (
              <div className="hidden md:flex flex-col gap-3 text-right shrink-0">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Member Since</p>
                  <p className="text-sm text-white/70 font-medium flex items-center gap-1.5 justify-end">
                    <FaCalendarAlt size={10} className="text-white/30" />
                    {fmtDate(profile.created_at)}
                  </p>
                </div>
                {profile.last_login && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Last Login</p>
                    <p className="text-sm text-white/70 font-medium flex items-center gap-1.5 justify-end">
                      <FaClock size={10} className="text-white/30" />
                      {fmtDate(profile.last_login)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Personal Information */}
            <div className="rounded-[28px] bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0fdf9] text-emerald-600">
                  <FaUser size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Personal Information</p>
                  <p className="text-xs text-slate-400">Update your name and contact details</p>
                </div>
              </div>

              {!profile ? (
                <div className="p-6 space-y-5">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                      <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                  <Field label="Full Name" icon={FaUser}>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Your full name"
                      disabled={saving}
                      className={INPUT}
                    />
                  </Field>

                  <Field label="Email Address" icon={FaEnvelope}>
                    <input type="text" value={profile.email} readOnly className={INPUT_RO} />
                    <p className="mt-1 text-[11px] text-slate-400">Email address cannot be changed</p>
                  </Field>

                  <Field label="Phone Number" icon={FaPhone}>
                    <input
                      type="text"
                      value={form.phone_number}
                      onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                      placeholder="e.g. +94 77 123 4567"
                      disabled={saving}
                      className={INPUT}
                    />
                  </Field>

                  <InlineAlert type={profileMsg?.type} message={profileMsg?.text} />

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#13462D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f3a26] disabled:opacity-60 transition"
                    >
                      <FaSave size={12} />
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Change Password */}
            <div className="rounded-[28px] bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <FaShieldAlt size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-400">Use a strong password — at least 8 characters</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                {[
                  { label: 'Current Password',     key: 'current_password', ph: 'Enter current password' },
                  { label: 'New Password',         key: 'new_password',     ph: 'Enter new password' },
                  { label: 'Confirm New Password', key: 'confirm_password', ph: 'Re-enter new password' },
                ].map(({ label, key, ph }) => (
                  <Field key={key} label={label} icon={FaLock}>
                    <input
                      type="password"
                      value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph}
                      disabled={changingPw}
                      className={INPUT}
                    />
                  </Field>
                ))}

                <InlineAlert type={pwMsg?.type} message={pwMsg?.text} />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={changingPw}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60 transition"
                  >
                    <FaLock size={11} />
                    {changingPw ? 'Changing…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
    </DashboardLayout>
  )
}
