import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/Logo_4.png'

function LandingHeader({ navItems }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header className={`relative mb-4 overflow-hidden rounded-3xl border border-[#9ec4ab]/70 bg-[linear-gradient(135deg,rgba(232,247,237,0.92)_0%,rgba(186,223,198,0.78)_42%,rgba(108,169,130,0.58)_100%)] backdrop-blur-3xl xl:rounded-[36px] lg:px-12 transition-all duration-300 ${
      scrolled
        ? 'px-6 py-2 shadow-[0_8px_32px_rgba(24,77,53,0.18),0_0_24px_rgba(62,153,108,0.14)]'
        : 'px-6 py-4 shadow-[0_28px_76px_rgba(24,77,53,0.22),0_0_54px_rgba(62,153,108,0.18)] lg:py-2.5'
    }`}>
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

      <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between">
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

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#9ec4ab]/70 bg-white/20 text-[#184d35] hover:bg-white/40 focus:outline-none xl:hidden"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Collapsible container */}
        <div
          className={`mt-4 flex-col gap-4 xl:mt-0 xl:flex xl:flex-row xl:items-center xl:gap-6 ${
            isMenuOpen ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <nav
            aria-label="Primary navigation"
            className="flex flex-col gap-2 rounded-[28px] border border-[#d5eadb]/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(209,235,217,0.34)_44%,rgba(121,185,144,0.2)_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_20px_38px_rgba(24,77,53,0.16),0_0_32px_rgba(73,161,116,0.16)] backdrop-blur-2xl sm:flex-row xl:rounded-full"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={getNavTarget(item.href)}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-full px-4 py-2.5 text-center text-sm transition duration-300 ${
                  isActiveNavItem(item.href)
                    ? 'bg-[linear-gradient(135deg,#236547_0%,#184d35_58%,#103120_100%)] font-semibold text-white shadow-[0_16px_34px_rgba(24,77,53,0.28),0_0_20px_rgba(73,161,116,0.16)]'
                    : 'text-[#234633] hover:bg-[linear-gradient(135deg,rgba(245,255,248,0.62)_0%,rgba(194,230,206,0.72)_100%)] hover:text-[#123a28] hover:shadow-[0_12px_24px_rgba(24,77,53,0.14)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-2xl border border-[#d4eadb]/80 bg-[linear-gradient(135deg,rgba(243,255,247,0.42)_0%,rgba(192,228,204,0.54)_100%)] px-5 py-2.5 text-center text-sm font-semibold text-[#123a28] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_14px_26px_rgba(24,77,53,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(247,255,249,0.56)_0%,rgba(200,233,211,0.68)_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_18px_30px_rgba(24,77,53,0.16)]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-2xl border border-[#2f7351] bg-[linear-gradient(135deg,#2e7b56_0%,#184d35_56%,#0f2f1e_100%)] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-[0_22px_38px_rgba(24,77,53,0.26),0_0_24px_rgba(73,161,116,0.18)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
              New Institution
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
