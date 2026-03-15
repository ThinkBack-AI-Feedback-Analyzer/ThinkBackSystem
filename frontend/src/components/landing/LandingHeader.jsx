import { Link } from 'react-router-dom'
import logo from '../../assets/Logo_4.png'

function LandingHeader({ navItems }) {
  return (
    <header className="mb-8 rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf8_100%)] px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 items-center">
          <img
            src={logo}
            alt="ThinkBack AI"
            className="h-18 w-auto object-contain"
          />
        </div>


        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#dbe4db] bg-[#f4f7f2] px-3 py-3 xl:rounded-full"
        >
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                index === 0
                  ? 'bg-[#184d35] font-semibold text-white shadow-[0_10px_24px_rgba(24,77,53,0.16)]'
                  : 'text-slate-600 hover:bg-white hover:text-[#184d35]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl border border-[#c8d7cc] px-4 py-2 text-sm font-medium text-[#184d35] transition hover:bg-[#edf4ef]"
          >
            Sign in
          </Link>
          <a
            href="#platform"
            className="rounded-2xl bg-[#184d35] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(24,77,53,0.18)] transition hover:brightness-105"
          >
            View Product Details
          </a>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
