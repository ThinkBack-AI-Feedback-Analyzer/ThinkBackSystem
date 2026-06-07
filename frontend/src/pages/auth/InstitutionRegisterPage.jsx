import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Select from '@radix-ui/react-select'
import { toast } from 'sonner'
import { FaChevronDown, FaCheck } from 'react-icons/fa'
import brandLogo from '../../assets/Thinkback logo2-cropped.png'
import { countries } from '../../data/countries'
import { registerInstitutionAtomic } from '../../services/institutions'

const institutionTypes = [
  'University',
  'Faculty',
  'Institute',
  'College',
  'School of Studies',
]

const onboardingTips = [
  'Use the official institution name, type, and country exactly as they should appear in reports.',
  'Prepare the admin contact email and phone number for the person who will manage the workspace.',
  'Keep your institution address, logo, and authorization confirmation ready before submitting.',
]

const INPUT = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400'
const INPUT_ERROR = 'w-full rounded-xl border border-red-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/20 placeholder:text-slate-400'

/* ── Reusable field wrapper ── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ── Section card ── */
function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  )
}

/* ── Radix Select with optional search ── */
function RadixSelect({ value, onValueChange, options, placeholder, searchable = false, error }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase().trim()))
    : options

  const triggerClass = [
    'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm outline-none transition',
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
    !value ? 'text-slate-400' : 'text-slate-800',
  ].join(' ')

  return (
    <Select.Root
      value={value}
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setSearch('') }}
      onValueChange={onValueChange}
    >
      <Select.Trigger className={triggerClass}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <FaChevronDown className="text-xs text-slate-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {searchable && (
            <div className="border-b border-slate-100 p-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-400"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <Select.Viewport className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No results found</div>
            ) : (
              filtered.map((option) => (
                <Select.Item
                  key={option}
                  value={option}
                  className="relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-emerald-50 focus:bg-emerald-50 data-[state=checked]:text-emerald-700 data-[state=checked]:bg-emerald-50"
                >
                  <Select.ItemText>{option}</Select.ItemText>
                  <Select.ItemIndicator>
                    <FaCheck className="text-xs text-emerald-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
function InstitutionRegisterPage() {
  const navigate = useNavigate()
  const [logoName, setLogoName] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    country: '',
    address: '',
    institutionPhone: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleChange(e) {
    updateField(e.target.name, e.target.value)
  }

  function validateForm() {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9+()\-\s]{7,20}$/

    if (!formData.institutionName.trim()) errors.institutionName = 'Institution name is required.'
    if (!formData.institutionType) errors.institutionType = 'Institution type is required.'
    if (formData.institutionPhone.trim() && !phoneRegex.test(formData.institutionPhone.trim()))
      errors.institutionPhone = 'Enter a valid phone number.'
    if (!formData.adminName.trim()) errors.adminName = 'Admin name is required.'
    if (!formData.adminEmail.trim()) errors.adminEmail = 'Admin email is required.'
    else if (!emailRegex.test(formData.adminEmail.trim())) errors.adminEmail = 'Enter a valid email address.'
    if (formData.adminPhone.trim() && !phoneRegex.test(formData.adminPhone.trim()))
      errors.adminPhone = 'Enter a valid phone number.'
    if (!formData.password) errors.password = 'Password is required.'
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password.'
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    if (logoFile && logoFile.size > 5 * 1024 * 1024) errors.logo = 'Logo must be 5MB or smaller.'

    return errors
  }

  function getErrorMessage(error) {
    const apiError = error?.response?.data
    if (!apiError) return 'Unable to reach backend. Check your server and CORS settings.'
    if (typeof apiError === 'string') return apiError
    const firstValue = Object.values(apiError)[0]
    if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
    if (typeof firstValue === 'string') return firstValue
    return 'Something went wrong. Please check the form and try again.'
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    setLogoFile(file || null)
    setLogoName(file ? file.name : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const errors = validateForm()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setSubmitError(String(Object.values(errors)[0]))
      return
    }
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('institution_name', formData.institutionName.trim())
      payload.append('institution_type', formData.institutionType)
      payload.append('phone_number', formData.institutionPhone.trim())
      payload.append('address', formData.address.trim())
      if (formData.country) payload.append('country', formData.country)
      if (logoFile) payload.append('logo', logoFile)
      
      // Admin fields
      payload.append('admin_name', formData.adminName.trim())
      payload.append('admin_email', formData.adminEmail.trim())
      payload.append('admin_phone', formData.adminPhone.trim())
      payload.append('password', formData.password)
      payload.append('password_confirm', formData.confirmPassword)

      await registerInstitutionAtomic(payload)

      navigate('/institutions/registration-success', {
        state: { 
          email: formData.adminEmail.trim(), 
          name: formData.institutionName.trim() 
        }
      })
    } catch (error) {
      // The API returns errors as an object. Check if it's the specific atomic format.
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
           const firstError = Object.values(data)[0];
           setSubmitError(Array.isArray(firstError) ? firstError[0] : String(firstError))
        } else {
           setSubmitError(getErrorMessage(error))
        }
      } else {
        setSubmitError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[420px_1fr]">

        {/* ── Left sidebar ── */}
        <aside className="relative flex flex-col overflow-hidden bg-[#0d2b1d] px-8 py-10 text-white lg:px-10 lg:py-14">

          {/* Background layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#1a5c3a_0%,transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#0f3d26_0%,transparent_65%)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDE4YzkuOTQgMCAxOC04LjA2IDE4LTE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvZz48L3N2Zz4=')] opacity-40" />

          {/* Glowing orbs */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-[-60px] h-80 w-80 rounded-full bg-emerald-700/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 blur-2xl" />

          {/* Subtle right border */}
          <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />

          <div className="relative flex flex-1 flex-col justify-between">
            <div>
              {/* Logo */}
              <img src={brandLogo} alt="ThinkBack" className="h-11 w-auto object-contain" />

              {/* Badge */}
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Institution Onboarding</span>
              </div>

              {/* Headline */}
              <h1 className="mt-6 text-3xl font-bold leading-snug tracking-tight lg:text-[2.2rem]">
                Register Your<br />
                <span className="text-emerald-400">Institution</span>
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-7 text-white/55">
                Set up your institution and start collecting AI-powered student feedback in minutes.
              </p>

              {/* Divider */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Tips */}
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">
                Before you start
              </p>
              <div className="space-y-3">
                {onboardingTips.map((tip, i) => (
                  <div key={i} className="group flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p className="text-sm leading-6 text-white/60 group-hover:text-white/75 transition">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { value: '50+', label: 'Institutions' },
                  { value: '10K+', label: 'Students' },
                  { value: '98%', label: 'Satisfaction' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">{s.value}</p>
                    <p className="mt-0.5 text-[11px] text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center justify-between border-t border-white/[0.08] pt-6 text-sm">
              <span className="text-white/40">Takes only a few minutes</span>
              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Right form ── */}
        <main className="flex items-start justify-center overflow-y-auto px-4 py-10 lg:px-12 lg:py-14">
          <div className="w-full max-w-2xl">

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Create Account</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">Complete your institution registration</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the details below to set up your institution on ThinkBack.</p>
            </div>

            {submitError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Institution Details ── */}
              <SectionCard title="Institution Details" description="Tell us about the institution you are registering.">
                <Field label="Institution Name" required error={fieldErrors.institutionName}>
                  <input
                    name="institutionName"
                    type="text"
                    placeholder="e.g. University of Moratuwa"
                    value={formData.institutionName}
                    onChange={handleChange}
                    className={fieldErrors.institutionName ? INPUT_ERROR : INPUT}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Institution Type" required error={fieldErrors.institutionType}>
                    <RadixSelect
                      value={formData.institutionType}
                      onValueChange={(v) => updateField('institutionType', v)}
                      options={institutionTypes}
                      placeholder="Select type"
                      error={fieldErrors.institutionType}
                    />
                  </Field>

                  <Field label="Country" error={fieldErrors.country}>
                    <RadixSelect
                      value={formData.country}
                      onValueChange={(v) => updateField('country', v)}
                      options={countries}
                      placeholder="Select country"
                      searchable
                      error={fieldErrors.country}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Institution Phone" error={fieldErrors.institutionPhone}>
                    <input
                      name="institutionPhone"
                      type="tel"
                      placeholder="+94 11 269 0000"
                      value={formData.institutionPhone}
                      onChange={handleChange}
                      className={fieldErrors.institutionPhone ? INPUT_ERROR : INPUT}
                    />
                  </Field>

                  <Field label="Institution Logo" error={fieldErrors.logo}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition hover:border-emerald-400">
                      <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Choose File
                      </span>
                      <span className="truncate text-slate-400">{logoName || 'PNG, JPG or SVG — max 5MB'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  </Field>
                </div>

                <Field label="Address" error={fieldErrors.address}>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="Street, City, Postal Code, Country"
                    value={formData.address}
                    onChange={handleChange}
                    className={`${INPUT} resize-none`}
                  />
                </Field>
              </SectionCard>

              {/* ── Admin Contact ── */}
              <SectionCard title="Admin Contact" description="Details of the person who will manage this institution.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required error={fieldErrors.adminName}>
                    <input
                      name="adminName"
                      type="text"
                      placeholder="e.g. Kamal Perera"
                      value={formData.adminName}
                      onChange={handleChange}
                      className={fieldErrors.adminName ? INPUT_ERROR : INPUT}
                    />
                  </Field>

                  <Field label="Official Email" required error={fieldErrors.adminEmail}>
                    <input
                      name="adminEmail"
                      type="email"
                      placeholder="e.g. admin@uom.lk"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className={fieldErrors.adminEmail ? INPUT_ERROR : INPUT}
                    />
                  </Field>

                  <Field label="Phone Number" error={fieldErrors.adminPhone}>
                    <input
                      name="adminPhone"
                      type="tel"
                      placeholder="+94 77 123 4567"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      className={fieldErrors.adminPhone ? INPUT_ERROR : INPUT}
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* ── Account Credentials ── */}
              <SectionCard title="Account Credentials" description="Create login credentials for the admin account.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Password" required error={fieldErrors.password}>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${fieldErrors.password ? INPUT_ERROR : INPUT} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm Password" required error={fieldErrors.confirmPassword}>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${fieldErrors.confirmPassword ? INPUT_ERROR : INPUT} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
              </SectionCard>

              {/* ── Authorization ── */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-600 shadow-sm transition hover:border-emerald-300">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
                />
                <span>I am authorized to register this institution on behalf of the organization.</span>
              </label>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#13462D] hover:text-[#0f3a26]">
                    Sign in
                  </Link>
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#13462D] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering…' : 'Register Institution'}
                </button>
              </div>

            </form>
          </div>
        </main>

      </div>
    </div>
  )
}

export default InstitutionRegisterPage
