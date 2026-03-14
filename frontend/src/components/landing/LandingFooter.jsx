const footerLinks = [
  'Home',
  'About Us',
  'Workflow',
  'Contact',
]

const featureLinks = [
  'Feedback Forms',
  'Sentiment Analysis',
  'Topic Detection',
  'Curriculum Suggestions',
]

function LandingFooter() {
  return (
    <footer
      id="contact"
      className="mt-8 bg-gradient-to-r from-emerald-500 to-green-300 px-6 py-12 text-slate-950"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 border-b border-slate-900/15 pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Launch a smarter feedback system for your institution
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-900/75">
              Replace fragmented feedback collection with one intelligent
              platform for students, lecturers, and administrators.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Create Institution Account
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-900/15 bg-white/60 px-6 py-3 font-semibold text-slate-900 transition hover:bg-white/80"
            >
              Request Demo
            </button>
          </div>
        </div>

        <div className="grid gap-8 pt-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                TB
              </div>
              <div>
                <p className="text-lg font-semibold">ThinkBack AI</p>
                <p className="text-sm text-slate-900/60">
                  Student Feedback Intelligence Platform
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900/60">
              Platform
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-900/75">
              {footerLinks.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900/60">
              Features
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-900/75">
              {featureLinks.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900/60">
              Contact
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-900/75">
              <p>hello@thinkback.ai</p>
              <p>+94 77 123 4567</p>
              <p>Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-900/15 pt-6 text-sm text-slate-900/70 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 ThinkBack AI. All rights reserved.</p>
          <div className="flex gap-4">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
