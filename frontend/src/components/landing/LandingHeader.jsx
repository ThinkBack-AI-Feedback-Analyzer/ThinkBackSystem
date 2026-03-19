import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/Logo_4.png'

function LandingHeader({ navItems }) {
  const location = useLocation()

  const getNavTarget = (href) => (href.startsWith('#') ? `/${href}` : href)

  const isActiveNavItem = (href) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        return false
      }

      if (href === '#home') {
        return location.hash === '' || location.hash === '#home'
      }

      return location.hash === href
    }

    return location.pathname === href
  }

  return (
    <header className="relative mb-8 overflow-hidden rounded-[36px] border border-[#9ec4ab]/70 bg-[linear-gradient(135deg,rgba(232,247,237,0.92)_0%,rgba(186,223,198,0.78)_42%,rgba(108,169,130,0.58)_100%)] px-5 py-4 shadow-[0_28px_76px_rgba(24,77,53,0.22),0_0_54px_rgba(62,153,108,0.18)] backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-[#ddf2e3] blur-3xl" />
        <div className="absolute left-1/3 top-0 h-28 w-44 rounded-full bg-[#f8fffa]/55 blur-3xl" />
        <div className="absolute right-4 top-0 h-32 w-32 rounded-full bg-[#93c8a5]/75 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-24 w-52 rounded-full bg-[#2d6d4d]/18 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
        <div className="absolute inset-x-10 bottom-0 h-px bg-[#5f9e78]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(24,77,53,0.06)_0%,transparent_32%,rgba(255,255,255,0.14)_60%,transparent_100%)]" />
      </div>

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(248,255,250,0.56)_0%,rgba(215,238,222,0.68)_100%)] px-3 py-2 shadow-[0_16px_32px_rgba(17,56,38,0.12)] backdrop-blur-xl">
              <img
                src={logo}
                alt="ThinkBack AI"
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-2xl font-semibold tracking-[-0.04em]">
                <span className="text-[#151515]">Think</span>
                <span className="text-[#184d35]">Back</span>
              </p>
            </div>
          </Link>
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-2 rounded-[28px] border border-[#d5eadb]/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(209,235,217,0.34)_44%,rgba(121,185,144,0.2)_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_20px_38px_rgba(24,77,53,0.16),0_0_32px_rgba(73,161,116,0.16)] backdrop-blur-2xl xl:rounded-full"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={getNavTarget(item.href)}
              className={`rounded-full px-4 py-2.5 text-sm transition duration-300 ${
                isActiveNavItem(item.href)
                  ? 'bg-[linear-gradient(135deg,#236547_0%,#184d35_58%,#103120_100%)] font-semibold text-white shadow-[0_16px_34px_rgba(24,77,53,0.28),0_0_20px_rgba(73,161,116,0.16)]'
                  : 'text-[#234633] hover:bg-[linear-gradient(135deg,rgba(245,255,248,0.62)_0%,rgba(194,230,206,0.72)_100%)] hover:text-[#123a28] hover:shadow-[0_12px_24px_rgba(24,77,53,0.14)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl border border-[#d4eadb]/80 bg-[linear-gradient(135deg,rgba(243,255,247,0.42)_0%,rgba(192,228,204,0.54)_100%)] px-5 py-2.5 text-sm font-semibold text-[#123a28] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_14px_26px_rgba(24,77,53,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(247,255,249,0.56)_0%,rgba(200,233,211,0.68)_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_18px_30px_rgba(24,77,53,0.16)]"
          >
            Sign in
          </Link>
          <Link
            to="/#platform"
            className="rounded-2xl border border-[#2f7351] bg-[linear-gradient(135deg,#2e7b56_0%,#184d35_56%,#0f2f1e_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_22px_38px_rgba(24,77,53,0.26),0_0_24px_rgba(73,161,116,0.18)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
          >
            View Product Details
          </Link>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
