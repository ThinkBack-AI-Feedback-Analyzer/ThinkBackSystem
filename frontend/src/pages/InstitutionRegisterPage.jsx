import { useState } from 'react'
import { Link } from 'react-router-dom'
import brandLogo from '../assets/Thinkback logo2-cropped.png'
import { countries } from '../data/countries'

const institutionTypes = [
  'University',
  'Faculty',
  'Institute',
  'College',
  'School of Studies',
]

const designations = [
  'Vice Chancellor',
  'Dean',
  'Registrar',
  'Director',
  'Coordinator',
]

const onboardingTips = [
  'Use the official institution name, type, and country exactly as they should appear in reports.',
  'Prepare the admin contact email and phone number for the person who will manage the workspace.',
  'Keep your institution address, logo, and authorization confirmation ready before submitting.',
]

const sectionCardClassName =
  'rounded-[30px] border border-[#dde4db] bg-[linear-gradient(180deg,#ffffff_0%,#f6f5ef_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-7'

const inputClassName =
  'w-full rounded-[24px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-4 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'

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

function FieldShell({ label, htmlFor, className = '', hint = '', children }) {
  return (
    <div className={`group relative block ${className}`}>
      <span className="pointer-events-none absolute inset-x-3 bottom-3 top-3 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(24,77,53,0.08),transparent_65%)] opacity-0 transition duration-300 group-focus-within:opacity-100" />
      <label
        htmlFor={htmlFor}
        className="absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm"
      >
        {label}
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

function SelectField({ id, defaultLabel, options }) {
  return (
    <div className="relative">
      <select id={id} className={selectClassName} defaultValue="" required>
        <option value="" disabled>
          {defaultLabel}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#e9f2ec] text-[#184d35] shadow-sm">
        <ChevronDownIcon />
      </span>
    </div>
  )
}

function InstitutionRegisterPage() {
  const [logoName, setLogoName] = useState('Upload PNG, JPG, or SVG')

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    setLogoName(file ? file.name : 'Upload PNG, JPG, or SVG')
  }

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <div className="min-h-screen bg-[#f1efe8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.46fr_0.54fr]">
        <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#1f7a54_0%,#184d35_35%,#123925_100%)] px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-px bg-white/10 lg:block" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <img
                src={brandLogo}
                alt="ThinkBack AI"
                className="h-16 w-auto object-contain"
              />
              <p className="mt-8 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Institution Onboarding
              </p>

              <div className="mt-6 max-w-md rounded-[30px] border border-white/12 bg-white/10 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/90">
                  Quick Guide
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
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

              <div className="mx-auto mt-10 w-full max-w-lg text-center">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Register Your Institution
                </h1>
                <p className="mt-5 text-lg leading-8 text-emerald-50/85">
                  Create your institution account to start collecting and
                  analyzing student feedback with a secure, AI-powered
                  academic workflow.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-emerald-50/75">
              <span>Setup takes only a few minutes.</span>
              <Link
                to="/"
                className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/10"
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
              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Institution"
                  description="Tell us about the institution you are registering on ThinkBack AI."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell
                    label="Institution Name"
                    htmlFor="institution-name"
                    className="md:col-span-2"
                  >
                    <input
                      id="institution-name"
                      type="text"
                      placeholder="Name of the institution"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>

                  <FieldShell
                    label="Institution Type"
                    htmlFor="institution-type"
                  >
                    <SelectField
                      id="institution-type"
                      defaultLabel="Select institution type"
                      options={institutionTypes}
                    />
                  </FieldShell>

                  <FieldShell label="Country" htmlFor="country">
                    <SelectField
                      id="country"
                      defaultLabel="Select country"
                      options={countries}
                    />
                  </FieldShell>

                  <FieldShell
                    label="Address"
                    htmlFor="institution-address"
                    className="md:col-span-2"
                    hint="Street, city, and region details help identify your institution correctly."
                  >
                    <textarea
                      id="institution-address"
                      placeholder="Institution address"
                      className={`${inputClassName} min-h-28 resize-y leading-7`}
                      required
                    />
                  </FieldShell>

                  <FieldShell
                    label="Institution Phone"
                    htmlFor="institution-phone"
                  >
                    <input
                      id="institution-phone"
                      type="tel"
                      placeholder="+94 11 000 0000"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>

                  <FieldShell
                    label="Institution Logo"
                    htmlFor="institution-logo"
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
                </div>
              </section>

              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Admin"
                  description="Provide the official contact details of the person managing the registration."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell label="Full Name" htmlFor="admin-name">
                    <input
                      id="admin-name"
                      type="text"
                      placeholder="Full name"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>

                  <FieldShell label="Designation" htmlFor="designation">
                    <SelectField
                      id="designation"
                      defaultLabel="Select designation"
                      options={designations}
                    />
                  </FieldShell>

                  <FieldShell label="Official Email" htmlFor="admin-email">
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="name@institution.edu"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>

                  <FieldShell label="Phone Number" htmlFor="admin-phone">
                    <input
                      id="admin-phone"
                      type="tel"
                      placeholder="+94 77 000 0000"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>
                </div>
              </section>

              <section className={`${sectionCardClassName} space-y-6`}>
                <SectionTitle
                  title="Account"
                  description="Create the login credentials for the institution admin account."
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldShell label="Password" htmlFor="password">
                    <input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      className={inputClassName}
                      required
                    />
                  </FieldShell>

                  <FieldShell
                    label="Confirm Password"
                    htmlFor="confirm-password"
                  >
                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      className={inputClassName}
                      required
                    />
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

              <button
                type="submit"
                className="w-full rounded-[24px] bg-[#184d35] px-6 py-5 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:brightness-105"
              >
                Register Institution
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default InstitutionRegisterPage
