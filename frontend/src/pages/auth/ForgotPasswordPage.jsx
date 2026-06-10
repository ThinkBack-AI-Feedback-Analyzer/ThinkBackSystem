import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo_4.png'
import { forgotPassword } from '../../services/auth'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setIsSubmitting(true)

      try {
        await forgotPassword(email)
        setSubmitted(true)
      } catch (err) {
        const data = err?.response?.data
        setError(data?.email?.[0] || data?.detail || 'Something went wrong. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [email],
  )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/">
            <img src={logo} alt="ThinkBack Logo" className="h-12 mx-auto mb-3 object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Forgot your password?</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-base font-semibold text-slate-800">Check your email</h2>
              <p className="text-sm text-slate-500">
                If an account with <strong>{email}</strong> exists, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-sm font-semibold text-[#13462D] hover:text-[#0f3a26]"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fp-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#13462D] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Remembered it?{' '}
                <Link to="/login" className="font-semibold text-[#13462D] hover:text-[#0f3a26]">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
