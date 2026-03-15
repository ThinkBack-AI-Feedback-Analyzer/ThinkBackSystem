import { useState } from 'react'
import { Link } from 'react-router-dom'
import brandLogo from '../assets/logo_3.png'
import { EnvelopeIcon, LockIcon } from '../components/auth/AuthIcons'

const inputClassName =
  'w-full rounded-[24px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-3 pl-16 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'

function AuthField({
  label,
  htmlFor,
  type,
  name,
  value,
  placeholder,
  onChange,
  icon,
}) {
  return (
    <label htmlFor={htmlFor} className="group relative block">
      <span className="pointer-events-none absolute inset-x-3 bottom-3 top-3 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(24,77,53,0.08),transparent_65%)] opacity-0 transition duration-300 group-focus-within:opacity-100" />
      <span className="absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm">
        {label}
      </span>
      <span className="pointer-events-none absolute left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#e7f1eb] text-[#184d35] shadow-sm transition duration-300 group-focus-within:bg-[#184d35] group-focus-within:text-white">
        {icon}
      </span>
      <input
        id={htmlFor}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={inputClassName}
        required
      />
    </label>
  )
}

function LoginPage() {
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    console.log(data)
  }

  return (
    <div className="relative flex min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#f5f2e9_0%,#eef4ef_52%,#f8f6ef_100%)] text-slate-900">
      <div className="absolute left-[-120px] top-[-80px] h-72 w-72 rounded-full bg-[#d8eadf] blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-40px] h-80 w-80 rounded-full bg-[#cfe3d7] blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,77,53,0.08),transparent_42%)]" />

      <Link
        to="/"
        className="absolute right-4 top-4 z-20 inline-flex items-center justify-center rounded-full bg-[#184d35] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,77,53,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 sm:right-6 sm:top-6"
      >
        Back to Home
      </Link>

      <main className="relative flex flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-[36px] border border-[#d8ddd3] bg-[#fcfbf7] px-5 pb-5 pt-0 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:px-6 sm:pb-6 sm:pt-0 lg:px-7 lg:pb-7 lg:pt-0">
          <div className="text-center">
            <img
              src={brandLogo}
              alt="ThinkBack system logo"
              className="mx-auto -mb-8 -mt-6 h-40 w-auto object-contain sm:-mb-10 sm:-mt-8 sm:h-48 lg:h-52"
            />
            <p className="mt-0 text-sm font-semibold uppercase tracking-[0.24em] text-[#56836c]">
              Sign In
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#184d35] sm:text-4xl">
              Access your account
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-500">
              Enter your institution email and password to continue to the
              ThinkBack dashboard.
            </p>
          </div>

          <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
            <AuthField
              label="Email"
              htmlFor="login-email"
              type="email"
              name="email"
              value={data.email}
              placeholder="name@institution.edu"
              onChange={handleChange}
              icon={<EnvelopeIcon />}
            />

            <AuthField
              label="Password"
              htmlFor="login-password"
              type="password"
              name="password"
              value={data.password}
              placeholder="Enter your password"
              onChange={handleChange}
              icon={<LockIcon />}
            />

            <button
              type="submit"
              className="w-full rounded-[24px] bg-[#184d35] px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-5 rounded-[26px] border border-[#d6ddd3] bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f3_100%)] px-5 py-3.5 text-center shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              Need a new account for your institution?
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
  )
}

export default LoginPage
