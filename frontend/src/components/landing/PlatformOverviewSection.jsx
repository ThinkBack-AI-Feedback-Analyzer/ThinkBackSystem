function PlatformOverviewSection({ modules, steps }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div
        id="platform"
        className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <div id="about">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
            Why ThinkBack AI
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Built like a product platform, not a static marketing page
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Present the system as something institutions can trust every day:
            structured workflows, actionable analytics, role-based management,
            and a clean product-first interface.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {modules.map((module) => (
            <div
              key={module.title}
              className="rounded-3xl border border-white/10 bg-black/20 p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {module.stat}
                </span>
              </div>
              <p className="text-sm leading-6 text-white/65">{module.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        id="workflow"
        className="rounded-[32px] border border-emerald-400/10 bg-gradient-to-br from-[#0b1b13] to-[#0c2618] p-8"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
          Workflow
        </p>
        <h2 className="mt-3 text-3xl font-semibold">How the platform works</h2>

        <div className="mt-8 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="group flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-950/30"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 font-semibold text-black transition duration-300 group-hover:scale-105 group-hover:bg-emerald-400">
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
