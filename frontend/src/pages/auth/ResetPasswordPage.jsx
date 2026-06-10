import { useCallback, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../services/auth'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', password_confirm: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (form.password !== form.password_confirm) {
        setError('Passwords do not match.')
        return
      }

      setIsSubmitting(true)
      setError('')

      try {
        await resetPassword(token, form.password, form.password_confirm)
        setSuccess(true)
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        const data = err?.response?.data
        if (data?.detail) {
          setError(data.detail)
        } else {
          const first = Object.values(data ?? {}).flat()[0]
          setError(typeof first === 'string' ? first : 'Something went wrong. Please try again.')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, form, navigate],
  )

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="mb-2 text-lg font-bold text-slate-800">Invalid Link</h1>
          <p className="mb-4 text-sm text-slate-500">
            This password reset link is missing or invalid.
          </p>
          <Link to="/forgot-password" className="text-sm font-semibold text-[#13462D] hover:text-[#0f3a26]">
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  const isExpiredOrInvalid =
    error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#13462D]">
            <span className="text-lg font-bold text-white">TB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a strong password for your account.</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-base font-semibold text-slate-800">Password updated!</h2>
              <p className="text-sm text-slate-500">Redirecting you to sign in…</p>
            </div>
          ) : isExpiredOrInvalid ? (
            <div className="text-center">
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#13462D] hover:text-[#0f3a26]"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="rp-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  id="rp-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="rp-confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <input
                  id="rp-confirm"
                  name="password_confirm"
                  type="password"
                  required
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#13462D] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
