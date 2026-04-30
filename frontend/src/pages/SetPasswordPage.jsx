import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { acceptInvitation } from '../services/users'

const DASHBOARD_ROUTES = {
  institution_admin: '/institution-dashboard',
  lecturer: '/lecturer-dashboard',
  coordinator: '/coordinator-dashboard',
}

function SetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', password_confirm: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        const data = await acceptInvitation(token, form.password, form.password_confirm)
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))

        const destination = DASHBOARD_ROUTES[data.user?.role] ?? '/'
        navigate(destination)
      } catch (err) {
        const responseData = err?.response?.data
        if (responseData?.detail) {
          setError(responseData.detail)
        } else if (responseData) {
          const first = Object.values(responseData).flat()[0]
          setError(typeof first === 'string' ? first : 'Something went wrong.')
        } else {
          setError('Failed to set password. Please try again.')
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
          <p className="text-sm text-slate-500">
            This invitation link is missing a token. Please ask your administrator to resend the invitation.
          </p>
        </div>
      </div>
    )
  }

  const isExpiredOrInvalid =
    error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#13462D]">
            <span className="text-lg font-bold text-white">TB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Set Your Password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome to ThinkBack. Choose a strong password to activate your account.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          {error && isExpiredOrInvalid ? (
            <div className="text-center">
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
              <p className="text-sm text-slate-500">
                Contact your institution administrator to receive a new invitation link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="sp-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>
                <input
                  id="sp-password"
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
                <label
                  htmlFor="sp-confirm"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Confirm Password
                </label>
                <input
                  id="sp-confirm"
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
                {isSubmitting ? 'Activating account…' : 'Activate Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SetPasswordPage
