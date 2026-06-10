const pillars = [
  {
    title: 'Our Mission',
    body: 'To transform raw student feedback into meaningful, actionable insights — helping educators make smarter curriculum decisions through the power of AI.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Our Vision',
    body: 'To become the leading AI-driven feedback platform for higher education — where every piece of student feedback drives better learning outcomes.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Our Technology',
    body: 'We use Natural Language Processing and transformer-based ML models to analyse large volumes of feedback with speed and accuracy — at scale.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
]

const values = [
  { label: 'Student-first', desc: 'Every feature is built around improving the student voice.' },
  { label: 'Privacy by design', desc: 'Fully anonymous feedback with no student identifiers stored.' },
  { label: 'Transparency', desc: 'Explainable AI — educators see the "why" behind every insight.' },
  { label: 'Continuous learning', desc: 'Our models improve as more institutions use the platform.' },
]

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24">

      {/* Section heading */}
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-[#56836c]">Who we are</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#184d35]">About ThinkBack AI</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          ThinkBack is an AI-powered feedback analysis platform built specifically for educational institutions — helping lecturers, coordinators, and admins turn anonymous student feedback into clear, actionable data.
        </p>
      </div>

      {/* Mission / Vision / Technology cards */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        {pillars.map(({ title, body, icon }) => (
          <div
            key={title}
            className="group rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f7faf6_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.09)]"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#184d35]/10 text-[#184d35] transition group-hover:bg-[#184d35] group-hover:text-white">
              {icon}
            </div>
            <h3 className="mb-2 text-base font-semibold text-slate-800">{title}</h3>
            <p className="text-sm leading-6 text-slate-500">{body}</p>
          </div>
        ))}
      </div>

      {/* Values row */}
      <div className="rounded-3xl bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] p-7 text-white shadow-[0_24px_60px_rgba(24,77,53,0.16)]">
        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-[#d5eadc]">What we stand for</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ label, desc }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.11]">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d5eadc]" />
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
              <p className="text-xs leading-5 text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default AboutSection
