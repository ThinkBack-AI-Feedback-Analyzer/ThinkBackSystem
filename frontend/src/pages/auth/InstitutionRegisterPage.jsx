import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Select from '@radix-ui/react-select'
import { toast } from 'sonner'
import brandLogo from '../../assets/Thinkback logo2-cropped.png'
import { countries } from '../../data/countries'
import { createInstitution } from '../../services/institutions'
import { register } from '../../services/auth'

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

const sectionCardClassName =
  'rounded-[30px] border border-[#dde4db] bg-[linear-gradient(180deg,#ffffff_0%,#f6f5ef_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-7'

const inputClassName =
  'w-full rounded-[24px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-3 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'

const selectClassName = `${inputClassName} appearance-none pr-16`

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function FieldShell({
  label,
  htmlFor,
  className = '',
  hint = '',
  required = false,
  children,
}) {
  return (
    <div className={`group relative block ${className}`}>
      <span className="pointer-events-none absolute inset-x-3 bottom-3 top-3 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(24,77,53,0.08),transparent_65%)] opacity-0 transition duration-300 group-focus-within:opacity-100" />
      <label
        htmlFor={htmlFor}
        className="absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[#b42318]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <span className="pointer-events-none absolute right-5 top-5 z-10 h-2.5 w-2.5 rounded-full bg-[#c3d8c8] transition duration-300 group-focus-within:bg-[#184d35] group-focus-within:shadow-[0_0_0_7px_rgba(24,77,53,0.12)]" />
      {children}
      {hint ? (
        <span className="mt-3 block pl-2 text-xs leading-5 text-[#61726a]">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#184d35]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function SelectField({
  id,
  defaultLabel,
  options,
  value,
  onValueChange,
  searchable = false,
  required = false,
  hasError = false,
}) {
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(searchText.toLowerCase().trim())
      )
    : options

  return (
    <Select.Root
      name={id}
      required={required}
      value={value}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearchText('')
        }
      }}
      onValueChange={onValueChange}
    >
      <Select.Trigger
        id={id}
        className={`${selectClassName} flex items-center justify-between gap-3 text-left data-[placeholder]:text-slate-400 ${
          hasError
            ? 'border-[#b42318] focus:border-[#b42318] focus:shadow-[0_0_0_4px_rgba(180,35,24,0.12),0_18px_36px_rgba(180,35,24,0.12)]'
            : ''
        }`}
      >
        <Select.Value placeholder={defaultLabel} />
        <Select.Icon asChild>
          <span className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f2ec] text-[#184d35] shadow-sm">
            <ChevronDownIcon />
          </span>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[20px] border border-[#d1d9cf] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.16)]"
        >
          {searchable ? (
            <div className="border-b border-[#e3e8df] p-2">
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-[#d1d9cf] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#185237]"
              />
            </div>
          ) : null}

          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-[#184d35]">
            <ChevronDownIcon />
          </Select.ScrollUpButton>

          <Select.Viewport className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No results found
              </div>
            ) : null}

            {filteredOptions.map((option) => (
              <Select.Item
                key={option}
                value={option}
                className="relative flex cursor-pointer items-center rounded-xl px-4 py-3 text-sm text-slate-700 outline-none transition hover:bg-[#edf5ef] focus:bg-[#edf5ef] data-[state=checked]:bg-[#e2efe7] data-[state=checked]:text-[#184d35]"
              >
                <Select.ItemText>{option}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-[#184d35]">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

function InstitutionRegisterPage() {
  const [logoName, setLogoName] = useState('Upload PNG, JPG, or SVG')
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

  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function getInputClass(errorKey) {
    return `${inputClassName} ${
      fieldErrors[errorKey]
        ? 'border-[#b42318] focus:border-[#b42318] focus:shadow-[0_0_0_4px_rgba(180,35,24,0.12),0_18px_36px_rgba(180,35,24,0.12)]'
        : ''
    }`
  }

  function validateForm() {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9+()\-\s]{7,20}$/

    if (!formData.institutionName.trim()) {
      errors.institutionName = 'Institution name is required.'
    }
    if (!formData.institutionType) {
      errors.institutionType = 'Institution type is required.'
    }
    if (formData.institutionPhone.trim() && !phoneRegex.test(formData.institutionPhone.trim())) {
      errors.institutionPhone = 'Enter a valid phone number.'
    }
    if (!formData.adminName.trim()) {
      errors.adminName = 'Admin name is required.'
    }
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required.'
    } else if (!emailRegex.test(formData.adminEmail.trim())) {
      errors.adminEmail = 'Enter a valid email address.'
    }
    if (formData.adminPhone.trim() && !phoneRegex.test(formData.adminPhone.trim())) {
      errors.adminPhone = 'Enter a valid phone number.'
    }
    if (!formData.password) {
      errors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Password and confirm password must match.'
    }
    if (logoFile && logoFile.size > 5 * 1024 * 1024) {
      errors.logo = 'Logo must be 5MB or smaller.'
    }

    return errors
  }

  function getErrorMessage(error) {
    const apiError = error?.response?.data
    if (!apiError) {
      return 'Unable to reach backend from browser. Check backend server, CORS settings, and API URL.'
    }
    if (typeof apiError === 'string') {
      return apiError
    }
    const firstValue = Object.values(apiError)[0]
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
    if (typeof firstValue === 'string') {
      return firstValue
    }
    return 'Unable to save form data. Please check the form and try again.'
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    setLogoFile(file || null)
    setLogoName(file ? file.name : 'Upload PNG, JPG, or SVG')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const errors = validateForm()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      setSubmitError(String(firstError))
      return
    }

    setIsSubmitting(true)

    try {
      const institutionPayload = new FormData()
      institutionPayload.append('institution_name', formData.institutionName.trim())
      institutionPayload.append('institution_type', formData.institutionType)
      institutionPayload.append('phone_number', formData.institutionPhone.trim())
      institutionPayload.append('address', formData.address.trim())
      if (formData.country) {
        institutionPayload.append('country', formData.country)
      }
      if (logoFile) {
        institutionPayload.append('logo', logoFile)
      }

      const institution = await createInstitution(institutionPayload)

      await register({
        full_name: formData.adminName.trim(),
        email: formData.adminEmail.trim(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        phone_number: formData.adminPhone.trim() || null,
        role: 'institution_admin',
        institution: institution.id,
      })

      toast.success('Institution and admin account saved successfully.')
      setFormData({
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
      setLogoFile(null)
      setLogoName('Upload PNG, JPG, or SVG')
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1efe8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.43fr_0.57fr]">
        <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8c63_0%,#1b5a3f_42%,#102f22_100%)] px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -left-16 top-12 h-48 w-48 rounded-full bg-emerald-200/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-emerald-100/10 blur-3xl" />
          <div className="absolute inset-y-0 right-0 hidden w-px bg-white/10 lg:block" />
          <div className="relative mx-auto flex h-full w-full max-w-[30rem] flex-col justify-between">
            <div>
              <img
                src={brandLogo}
                alt="ThinkBack AI"
                className="h-14 w-auto object-contain sm:h-16"
              />
              <p className="mt-7 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Institution Onboarding
              </p>

              <div className="mt-7 rounded-[30px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.07)_100%)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.15)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/90">
                  Quick Guide
                </p>
                <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight">
                  What to prepare before you start
                </h2>
                <p className="mt-3 text-sm leading-6 text-emerald-50/85">
                  Having a few official details ready will make registration
                  faster and help you complete the form in one go.
                </p>

                <div className="mt-5 space-y-3">
                  {onboardingTips.map((tip, index) => (
                    <div
                      key={tip}
                      className="flex gap-3 rounded-[22px] border border-white/10 bg-black/10 px-4 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                        0{index + 1}
                      </span>
                      <p className="text-sm leading-6 text-emerald-50/85">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 w-full text-left">
                <h1 className="max-w-md text-4xl font-semibold leading-tight sm:text-[2.8rem]">
                  Register Your Institution
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-emerald-50/85 sm:text-lg sm:leading-8">
                  Create your institution account to start collecting and
                  analyzing student feedback with a secure, AI-powered
                  academic workflow.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 text-sm text-emerald-50/75 sm:flex-row sm:items-center">
              <span>Setup takes only a few minutes.</span>
              <Link
                to="/"
                className="rounded-full border border-white/20 px-4 py-2 font-medium text-white transition hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="w-full max-w-4xl rounded-[34px] border border-[#d8ddd3] bg-[#fcfbf7] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-8 lg:p-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#56836c]">
                Create Institution Account
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-[#184d35]">
                Complete your institution registration.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
                Quickly set up your institution, academic structure, admin contact, and account.
              </p>
            </div>

            <form className="mt-10 space-y-10" onSubmit={handleSubmit}>
              {submitError ? (
                <div className="rounded-2xl border border-[#f1c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">
                  {submitError}
                </div>
              ) : null}

              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Institution"
                  description="Tell us about the institution you are registering on ThinkBack AI."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell
                    label="Institution Name"
                    htmlFor="institution-name"
                    required
                    className="md:col-span-2"
                  >
                    <input
                      id="institution-name"
                      type="text"
                      placeholder="Name of the institution"
                      className={getInputClass('institutionName')}
                      value={formData.institutionName}
                      onChange={(event) =>
                        updateField('institutionName', event.target.value)
                      }
                      required
                    />
                    {fieldErrors.institutionName ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.institutionName}
                      </span>
                    ) : null}
                  </FieldShell>

                  <FieldShell
                    label="Institution Type"
                    htmlFor="institution-type"
                    required
                  >
                    <SelectField
                      id="institution-type"
                      defaultLabel="Select institution type"
                      options={institutionTypes}
                      value={formData.institutionType}
                      onValueChange={(value) =>
                        updateField('institutionType', value)
                      }
                      required
                      hasError={Boolean(fieldErrors.institutionType)}
                    />
                    {fieldErrors.institutionType ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.institutionType}
                      </span>
                    ) : null}
                  </FieldShell>

                  <FieldShell label="Country" htmlFor="country">
                    <SelectField
                      id="country"
                      defaultLabel="Select country"
                      options={countries}
                      value={formData.country}
                      onValueChange={(value) => updateField('country', value)}
                      searchable
                    />
                  </FieldShell>

                  <FieldShell
                    label="Address"
                    htmlFor="institution-address"
                    className="md:col-span-2"
                  
                  >
                    <textarea
                      id="institution-address"
                      placeholder="Institution address"
                      className={`${getInputClass('address')} min-h-28 resize-y leading-7`}
                      value={formData.address}
                      onChange={(event) => updateField('address', event.target.value)}
                    />
                    {fieldErrors.address ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.address}
                      </span>
                    ) : null}
                  </FieldShell>

                

                  <FieldShell
                    label="Institution Logo"
                    htmlFor="institution-logo"
                    className="md:col-span-2"
                    hint="A square or transparent logo works best across the platform."
                  >
                    <div className="rounded-[26px] border border-dashed border-[#c7d3c9] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7f2_100%)] p-5 shadow-sm transition duration-200 hover:border-[#9db7a5] hover:shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#56836c]">
                            Brand Identity
                          </p>
                          <p className="mt-2 font-semibold text-slate-800">
                            Upload institution logo
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {logoName}
                          </p>
                          {fieldErrors.logo ? (
                            <p className="mt-2 text-xs text-[#b42318]">{fieldErrors.logo}</p>
                          ) : null}
                        </div>
                        <label
                          htmlFor="institution-logo"
                          className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#184d35] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(24,77,53,0.2)] transition hover:-translate-y-0.5 hover:brightness-105"
                        >
                          Choose File
                        </label>
                      </div>
                      <input
                        id="institution-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </FieldShell>

                    <FieldShell
                    label="Institution Phone"
                    htmlFor="institution-phone"
                  >
                    <input
                      id="institution-phone"
                      type="tel"
                      placeholder="+94 11 000 0000"
                      className={getInputClass('institutionPhone')}
                      value={formData.institutionPhone}
                      onChange={(event) =>
                        updateField('institutionPhone', event.target.value)
                      }
                    />
                    {fieldErrors.institutionPhone ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.institutionPhone}
                      </span>
                    ) : null}
                  </FieldShell>
                </div>
              </section>

              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Admin"
                  description="Provide the official contact details of the person managing the registration."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell label="Full Name" htmlFor="admin-name" required>
                    <input
                      id="admin-name"
                      type="text"
                      placeholder="Full name"
                      className={getInputClass('adminName')}
                      value={formData.adminName}
                      onChange={(event) => updateField('adminName', event.target.value)}
                      required
                    />
                    {fieldErrors.adminName ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.adminName}
                      </span>
                    ) : null}
                  </FieldShell>

                  <FieldShell label="Official Email" htmlFor="admin-email" required>
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="name@institution.edu"
                      className={getInputClass('adminEmail')}
                      value={formData.adminEmail}
                      onChange={(event) => updateField('adminEmail', event.target.value)}
                      required
                    />
                    {fieldErrors.adminEmail ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.adminEmail}
                      </span>
                    ) : null}
                  </FieldShell>

                  <FieldShell label="Phone Number" htmlFor="admin-phone">
                    <input
                      id="admin-phone"
                      type="tel"
                      placeholder="+94 77 000 0000"
                      className={getInputClass('adminPhone')}
                      value={formData.adminPhone}
                      onChange={(event) => updateField('adminPhone', event.target.value)}
                    />
                    {fieldErrors.adminPhone ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.adminPhone}
                      </span>
                    ) : null}
                  </FieldShell>
                </div>
              </section>

              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Account"
                  description="Create the login credentials for the institution admin account."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell label="Password" htmlFor="password" required>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      className={getInputClass('password')}
                      value={formData.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      required
                    />
                    {fieldErrors.password ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.password}
                      </span>
                    ) : null}
                  </FieldShell>

                  <FieldShell
                    label="Confirm Password"
                    htmlFor="confirm-password"
                    required
                  >
                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      className={getInputClass('confirmPassword')}
                      value={formData.confirmPassword}
                      onChange={(event) =>
                        updateField('confirmPassword', event.target.value)
                      }
                      required
                    />
                    {fieldErrors.confirmPassword ? (
                      <span className="mt-3 block pl-2 text-xs text-[#b42318]">
                        {fieldErrors.confirmPassword}
                      </span>
                    ) : null}
                  </FieldShell>
                </div>
              </section>

              <section className={`${sectionCardClassName} space-y-5`}>
                <SectionTitle
                  title="Authorization"
                  description="Confirm that you are permitted to submit the registration on behalf of the institution."
                />

                <label className="flex items-start gap-4 rounded-[26px] border border-[#d6ddd3] bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f3_100%)] px-5 py-4 text-sm leading-6 text-slate-600 shadow-sm transition duration-200 hover:border-[#bccbbe] hover:shadow-md">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-5 w-5 rounded-md border-[#bfd0c3] bg-[#f6f8f2] text-[#184d35] shadow-sm focus:ring-[#184d35]"
                  />
                  <span>I am authorized to register this institution</span>
                </label>
              </section>

              <section className={`${sectionCardClassName} space-y-5`}>
                <SectionTitle
                  title="Register Institution"
                  description="Review your details, then submit the form to create the institution and admin account."
                />

                <button
                  type="submit"
                  aria-label="Register Institution"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-[24px] bg-[#184d35] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_32px_rgba(24,77,53,0.24)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Saving...' : 'Register Institution'}
                </button>
              </section>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default InstitutionRegisterPage
