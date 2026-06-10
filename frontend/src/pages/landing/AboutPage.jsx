import LandingHeader from '../../components/landing/LandingHeader'
import LandingFooter from '../../components/landing/LandingFooter'
import { navItems } from '../../data/landingPage'

const pillars = [
  {
    title: 'Our Mission',
    body: 'To transform raw student feedback into meaningful, actionable insights — helping educators make smarter curriculum decisions through the power of AI.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Our Vision',
    body: 'To become the leading AI-driven feedback platform for higher education — where every piece of student feedback drives better learning outcomes.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Our Technology',
    body: 'We leverage Natural Language Processing and transformer-based ML models to analyse large volumes of feedback with speed and accuracy — at scale.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
]

const values = [
  { label: 'Student-first', desc: 'Every feature is built around improving the student voice.' },
  { label: 'Privacy by design', desc: 'Fully anonymous feedback with no student identifiers stored.' },
  { label: 'Transparency', desc: 'Explainable AI — educators can always see the "why" behind insights.' },
  { label: 'Continuous learning', desc: 'Our models improve as more institutions use the platform.' },
]

function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <LandingHeader navItems={navItems} />
      </div>

      {/* Hero banner */}
      <section className="bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d5eadc]">
            Who we are
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            About <span className="text-[#d5eadc]">ThinkBack AI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">
            ThinkBack is an AI-powered feedback analysis platform built specifically for educational institutions. We help lecturers, coordinators, and institution admins turn anonymous student feedback into clear, actionable data.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

        {/* Mission / Vision / Technology */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ title, body, icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#184d35]/10 text-[#184d35] transition group-hover:bg-[#184d35] group-hover:text-white">
                {icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
              <p className="text-sm leading-6 text-slate-500">{body}</p>
            </div>
          ))}
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-slate-100" />

        {/* Values */}
        <section>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-slate-800">What we stand for</h2>
            <p className="mt-2 text-sm text-slate-500">The principles that guide every decision we make.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-2xl bg-slate-50 px-6 py-6 transition hover:bg-[#184d35]/5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#184d35]" />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-slate-100" />

        {/* CTA strip */}
        <section className="rounded-2xl bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to improve your curriculum?</h2>
          <p className="mt-3 text-sm text-white/70">Join institutions already using ThinkBack to turn student voices into better education.</p>
          <a
            href="/institutions/register"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#184d35] shadow transition hover:bg-slate-50"
          >
            Get started free
          </a>
        </section>

      </main>

      <LandingFooter />
    </div>
  )
}

export default AboutPage
