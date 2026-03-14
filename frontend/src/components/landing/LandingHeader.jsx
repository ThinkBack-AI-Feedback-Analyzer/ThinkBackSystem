import logo from '../../assets/Thinkback logo2-cropped.png'
function LandingHeader({ navItems }) {
  return (
    <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
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
          className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-black/20 px-3 py-3 xl:rounded-full"
        >
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                index === 0
                  ? 'bg-emerald-500 font-semibold text-black'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
          >
            Sign in
          </button>
          <a
            href="#platform"
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
          >
            View Product Details
          </a>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
