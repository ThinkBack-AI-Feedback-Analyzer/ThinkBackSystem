import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/Thinkback logo2-cropped.png'
import systemLogo from '../assets/logo_3.png'
import { LockIcon, EnvelopeIcon, UniversityIcon } from '../components/auth/AuthIcons'
import { authBubbleStyles } from '../data/authBubbleStyles'
import { login } from '../services/auth'

const inputClassName =
  'w-full rounded-[24px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-4 pl-14 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)] disabled:cursor-not-allowed disabled:opacity-70'

function AuthField({ icon: Icon, label, htmlFor, ...props }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 block text-sm font-semibold text-[#244e39]">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-5 top-1/2 flex h-5 w-5 -translate-y-1/2 text-[#4e7b64]">
          <Icon />
        </span>
        <input id={htmlFor} className={inputClassName} {...props} />
      </span>
    </label>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setData((current) => ({
      ...current,
      [name]: value,
    }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!data.email || !data.password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    try {
      const response = await login(data.email, data.password)
      const user = response.data?.user ?? {}

      localStorage.setItem('access_token', response.data?.access ?? '')
      localStorage.setItem('refresh_token', response.data?.refresh ?? '')
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'institution_admin') {
        navigate('/institution-dashboard')
        return
      }

      navigate('/')
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Invalid email or password.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f1efe8] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,122,84,0.18),transparent_40%)]" />
        {authBubbleStyles.map((bubbleStyle, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-emerald-700/10 blur-[1px]"
            style={{
              ...bubbleStyle,
              bottom: '-60px',
              animation: 'authBubbleRise linear infinite',
            }}
          />
        ))}
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[0.48fr_0.52fr]">
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
                Institution Access
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-10 lg:py-0">
              <div className="w-full">
                <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur">
                  <div className="rounded-[28px] bg-[linear-gradient(180deg,#f7f5ef_0%,#eef6f1_100%)] p-6 text-slate-900">
                    <div className="rounded-[28px] border border-[#d7e2d9] bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6f1_56%,#e7f1eb_100%)] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_16px_34px_rgba(24,77,53,0.08)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a806c]">
                        ThinkBack Platform
                      </p>
                      <img
                        src={systemLogo}
                        alt="ThinkBack system logo"
                        className="mx-auto mt-5 h-24 w-auto object-contain sm:h-28"
                      />
                      <div className="mx-auto mt-6 max-w-xs rounded-[22px] border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
                        <p className="text-sm font-semibold text-[#184d35]">
                          Student Feedback Intelligence Platform
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Securely manage institution access, analyze academic
                          feedback, and keep your team aligned in one place.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-8 max-w-lg text-center">
                  <h1 className="text-4xl font-semibold leading-tight">
                    Sign In to ThinkBack
                  </h1>
                  <p className="mt-4 text-lg leading-8 text-emerald-50/85">
                    Access your institution dashboard to review courses,
                    feedback trends, and student insight workflows.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-emerald-50/75">
              <span>Institution admins can continue from here.</span>
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
          <div className="w-full max-w-xl rounded-[34px] border border-[#d8ddd3] bg-[#fcfbf7]/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8 lg:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#eff7f1_0%,#dfeee3_100%)] text-[#184d35] shadow-sm">
                <span className="h-7 w-7">
                  <UniversityIcon />
                </span>
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#56836c]">
                Welcome Back
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-[#184d35]">
                Sign in to your dashboard.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
                Use your institution admin credentials to continue.
              </p>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <AuthField
                icon={EnvelopeIcon}
                label="Official Email"
                htmlFor="login-email"
                type="email"
                name="email"
                placeholder="name@institution.edu"
                autoComplete="email"
                value={data.email}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <AuthField
                icon={LockIcon}
                label="Password"
                htmlFor="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={data.password}
                onChange={handleChange}
                disabled={loading}
                required
              />

              {error ? (
                <div className="rounded-[24px] border border-[#e7b6b6] bg-[#fff3f3] px-5 py-4 text-sm text-[#9c2b2b] shadow-sm">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[24px] bg-[#184d35] px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {loading ? 'Signing in...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-5 rounded-[26px] border border-[#d6ddd3] bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f3_100%)] px-5 py-3.5 text-center shadow-sm">
              <p className="text-sm leading-6 text-slate-600">
                Need a new institution account?
                <Link
                  to="/institutions/register"
                  className="ml-2 font-semibold text-[#184d35] transition hover:text-[#123925]"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes authBubbleRise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.25;
          }

          50% {
            opacity: 0.38;
          }

          100% {
            transform: translateY(-120vh) scale(1.45);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage
