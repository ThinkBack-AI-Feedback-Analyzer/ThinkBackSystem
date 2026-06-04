import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaShieldAlt, FaUser, FaEnvelope, FaPhone,
  FaLock, FaCheckCircle, FaExclamationCircle,
} from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getProfile, updateProfile, changePassword } from '../../services/superadmin'
import { toast } from 'sonner'

function Field({ label, icon: Icon, type = 'text', value, onChange, disabled, placeholder, readOnly }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={[
            'w-full text-sm border rounded-xl py-2.5 pr-4 transition focus:outline-none focus:ring-2 focus:ring-emerald-400',
            Icon ? 'pl-9' : 'pl-4',
            readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-white border-slate-200',
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
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
      {isError ? <FaExclamationCircle size={14} /> : <FaCheckCircle size={14} />}
      {message}
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form,    setForm]    = useState({ full_name: '', phone_number: '' })
  const [pw,      setPw]      = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving,  setSaving]  = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)   // {type, text}
  const [pwMsg,      setPwMsg]      = useState(null)
  const [collapsed, setCollapsed]   = useState(false)

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
      // Update localStorage so top bar name stays in sync
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
    setChangingPw(true); setPwMsg(null)
    try {
      await changePassword(pw)
      setPwMsg({ type: 'success', text: 'Password changed successfully. Use the new password next time you log in.' })
      setPw({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to change password'
      setPwMsg({ type: 'error', text: msg })
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif]">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your super admin account</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <FaShieldAlt className="text-white text-xs" />
          </div>
        </div>

        <div className="p-6 max-w-2xl space-y-6">
          {/* Avatar + identity */}
          {profile && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">
                  {profile.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">{profile.full_name}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  <FaShieldAlt size={9} /> System Administrator
                </span>
              </div>
            </div>
          )}

          {/* Profile form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FaUser className="text-emerald-500 text-sm" />
              <h2 className="text-sm font-semibold text-slate-700">Personal Information</h2>
            </div>

            {!profile ? (
              <div className="space-y-4">
                {[0, 1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <Field label="Full Name" icon={FaUser}
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name" disabled={saving} />
                <Field label="Email Address" icon={FaEnvelope}
                  value={profile.email} readOnly
                  placeholder="Email cannot be changed" />
                <Field label="Phone Number" icon={FaPhone}
                  value={form.phone_number}
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="e.g. +60 12-345 6789" disabled={saving} />

                <Alert type={profileMsg?.type} message={profileMsg?.text} />

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change password form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <FaLock className="text-emerald-500 text-sm" />
              <h2 className="text-sm font-semibold text-slate-700">Change Password</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">Use a strong password — at least 8 characters.</p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Field label="Current Password" icon={FaLock} type="password"
                value={pw.current_password}
                onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))}
                placeholder="Enter current password" disabled={changingPw} />
              <Field label="New Password" icon={FaLock} type="password"
                value={pw.new_password}
                onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))}
                placeholder="Enter new password" disabled={changingPw} />
              <Field label="Confirm New Password" icon={FaLock} type="password"
                value={pw.confirm_password}
                onChange={e => setPw(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="Re-enter new password" disabled={changingPw} />

              <Alert type={pwMsg?.type} message={pwMsg?.text} />

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={changingPw}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {changingPw ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Meta info */}
          {profile && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Account Created</p>
                <p className="text-sm text-slate-700">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              {profile.last_login && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Last Login</p>
                  <p className="text-sm text-slate-700">{new Date(profile.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
