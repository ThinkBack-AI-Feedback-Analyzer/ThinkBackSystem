import React from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import brandLogo from '../../assets/Thinkback logo2-cropped.png'

export default function InstitutionRegistrationSuccessPage() {
  const location = useLocation()
  const state = location.state

  // If someone navigates here directly without state, send them to the register page
  if (!state || !state.email) {
    return <Navigate to="/institutions/register" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[420px_1fr]">

        {/* ── Left sidebar ── */}
        <aside className="relative flex flex-col overflow-hidden bg-[#0d2b1d] px-8 py-10 text-white lg:px-10 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#1a5c3a_0%,transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#0f3d26_0%,transparent_65%)]" />
          <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-[-60px] h-80 w-80 rounded-full bg-emerald-700/15 blur-3xl" />
          <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
          
          <div className="relative flex flex-1 flex-col justify-center items-center text-center">
            <img src={brandLogo} alt="ThinkBack" className="h-12 w-auto object-contain mb-8" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/30 flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Registration Submitted!</h1>
            <p className="text-sm text-white/60 leading-7 max-w-xs">
              Your institution has been registered and is now awaiting review by our system administrator.
            </p>
          </div>
        </aside>

        {/* ── Right: Pending Approval Screen ── */}
        <main className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mb-6">
              <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Pending Approval</h2>
            <p className="text-slate-500 text-sm leading-7 mb-8">
              Your institution registration for{' '}
              <span className="font-semibold text-slate-700">{state.name}</span>{' '}
              has been submitted successfully. A system administrator will review your registration shortly.
              You will receive an email at{' '}
              <span className="font-semibold text-slate-700">{state.email}</span>{' '}
              once it is approved.
            </p>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8 text-left space-y-3">
              {[
                { done: true,  label: 'Institution details saved' },
                { done: true,  label: 'Admin account created' },
                { done: false, label: 'Awaiting super admin approval' },
              ].map(({ done, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {done ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </span>
                  <span className="text-slate-600">{label}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-block rounded-xl bg-[#13462D] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto inline-block rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>

      </div>
    </div>
  )
}
