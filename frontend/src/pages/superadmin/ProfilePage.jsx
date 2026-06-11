import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaShieldAlt, FaUser, FaEnvelope, FaPhone,
  FaLock, FaCheckCircle, FaExclamationCircle, FaClock, FaCalendarAlt,
} from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getProfile, updateProfile, changePassword } from '../../services/superadmin'
import { toast } from 'sonner'

function InputField({ label, icon: Icon, type = 'text', value, onChange, disabled, placeholder, readOnly }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={[
            'w-full text-sm border rounded-xl py-3 pr-4 transition focus:outline-none focus:ring-2 focus:ring-emerald-400',
            Icon ? 'pl-10' : 'pl-4',
            readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-white border-slate-200 hover:border-slate-300',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        />
      </div>
    </div>
  )
}

function Alert({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
      {isError ? <FaExclamationCircle size={14} /> : <FaCheckCircle size={14} />}
      {message}
    </div>
  )
}

function Avatar({ name, size = 'lg' }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200`}>
      <span className="text-white font-bold">{initials}</span>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile,    setProfile]    = useState(null)
  const [form,       setForm]       = useState({ full_name: '', phone_number: '' })
  const [pw,         setPw]         = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving,     setSaving]     = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwMsg,      setPwMsg]      = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.role !== 'system_admin') { navigate('/login'); return }
    getProfile()
      .then(data => {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone_number: data.phone_number || '' })
      })
      .catch(() => toast.error('Failed to load profile'))
  }, [navigate])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { setProfileMsg({ type: 'error', text: 'Name is required' }); return }
    setSaving(true); setProfileMsg(null)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updated.full_name }))
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!pw.current_password || !pw.new_password || !pw.confirm_password) {
      setPwMsg({ type: 'error', text: 'All password fields are required' }); return
    }
    if (pw.new_password !== pw.confirm_password) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' }); return
    }
    setChangingPw(true); setPwMsg(null)
    try {
      await changePassword(pw)
      setPwMsg({ type: 'success', text: 'Password changed successfully.' })
      setPw({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to change password'
      setPwMsg({ type: 'error', text: msg })
    } finally {
      setChangingPw(false)
    }
  }

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const fmtDateTime = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' · ' + new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

          <div className="px-6 pb-6">
            {/* Avatar overlapping banner */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              {profile
                ? <Avatar name={profile.full_name} />
                : <div className="w-20 h-20 rounded-2xl bg-slate-200 animate-pulse" />
              }
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">
                <FaShieldAlt size={10} /> System Administrator
              </span>
            </div>

            {profile ? (
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{profile.full_name}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                </div>
                {/* Quick stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <FaCalendarAlt size={10} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Member since</p>
                      <p className="font-medium text-slate-600">{fmtDate(profile.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <FaClock size={10} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Last login</p>
                      <p className="font-medium text-slate-600">{fmtDateTime(profile.last_login)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-56 bg-slate-100 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* ── Two-column forms ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FaUser size={13} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Personal Information</h2>
                <p className="text-xs text-slate-400">Update your name and contact details</p>
              </div>
            </div>

            {!profile ? (
              <div className="space-y-4">
                {[0, 1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <InputField label="Full Name" icon={FaUser}
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name" disabled={saving} />
                <InputField label="Email Address" icon={FaEnvelope}
                  value={profile.email} readOnly
                  placeholder="Email cannot be changed" />
                <InputField label="Phone Number" icon={FaPhone}
                  value={form.phone_number}
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="e.g. +60 12-345 6789" disabled={saving} />

                <Alert type={profileMsg?.type} message={profileMsg?.text} />

                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <FaLock size={13} className="text-slate-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Change Password</h2>
                <p className="text-xs text-slate-400">Use a strong password — at least 8 characters</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <InputField label="Current Password" icon={FaLock} type="password"
                value={pw.current_password}
                onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))}
                placeholder="Enter current password" disabled={changingPw} />
              <InputField label="New Password" icon={FaLock} type="password"
                value={pw.new_password}
                onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))}
                placeholder="Enter new password" disabled={changingPw} />
              <InputField label="Confirm New Password" icon={FaLock} type="password"
                value={pw.confirm_password}
                onChange={e => setPw(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="Re-enter new password" disabled={changingPw} />

              <Alert type={pwMsg?.type} message={pwMsg?.text} />

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={changingPw}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {changingPw ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </SuperAdminLayout>
  )
}
