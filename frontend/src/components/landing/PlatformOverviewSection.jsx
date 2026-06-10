function PlatformOverviewSection({ modules, steps }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div
        id="platform"
        className="rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f7faf6_100%)] p-5 sm:p-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#56836c]">
            Why ThinkBack AI
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#184d35]">
            A Complete Student Feedback Platform, Not Just a Simple Form
          </h2>
          <p className="mt-4 max-w-xl text-slate-600">
            A student feedback platform you can rely on every day. Manage feedback with structured workflows, clear insights, and an easy-to-use interface built for real results.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {modules.map((module) => (
            <div
              key={module.title}
              className="rounded-3xl border border-[#dbe4db] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f4_100%)] p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-[#184d35]">
                  {module.title}
                </h3>
                <span className="rounded-full bg-[#e7f1eb] px-3 py-1 text-xs font-medium text-[#184d35]">
                  {module.stat}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{module.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        id="workflow"
        className="rounded-3xl border border-[#d6e2d8] bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] p-5 sm:p-8 text-white shadow-[0_24px_60px_rgba(24,77,53,0.16)]"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-[#d5eadc]">
          Workflow
        </p>
        <h2 className="mt-3 text-3xl font-semibold">How the platform works</h2>

        <div className="mt-8 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="group flex gap-4 rounded-3xl border border-white/10 bg-white/[0.07] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#c7dfce]/35 hover:bg-white/[0.1] hover:shadow-[0_18px_36px_rgba(7,20,13,0.16)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3f7f2] font-semibold text-[#184d35] transition duration-300 group-hover:scale-105 group-hover:bg-[#dbe9de]">
                {index + 1}
              </div>
              <div className="pt-1 text-white/80 transition duration-300 group-hover:text-white">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlatformOverviewSection
