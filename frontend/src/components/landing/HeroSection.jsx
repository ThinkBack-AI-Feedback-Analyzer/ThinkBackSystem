import { Link } from 'react-router-dom'
import heroImage from '../../assets/Robot_2.png'
import feedbackLoopImage from '../../assets/R1.png'
import insightImage from '../../assets/R2.png'
import analyticsImage from '../../assets/R3.png'
import intelligenceImage from '../../assets/R4.png'

function FloatingIconCard({
  image,
  alt,
  label,
  wrapperClassName,
  cardClassName,
}) {
  return (
    <div className={`absolute z-10 ${wrapperClassName}`}>
      <div
        className={`group relative transition duration-500 ${cardClassName}`}
      >
        <div className="absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(215,234,220,0.26),transparent_60%)] opacity-0 blur-sm transition duration-500 group-hover:opacity-100" />
        <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-[#123624]/80 p-1.5 shadow-xl shadow-black/20 backdrop-blur transition duration-500 group-hover:-translate-y-3 group-hover:scale-105 group-hover:border-[#c7dfce]/45 group-hover:bg-[#173c29]/92 group-hover:shadow-[0_22px_55px_rgba(183,209,192,0.22)] sm:p-2">
          <div className="relative rounded-[18px] border border-[#d7e8dc]/12 bg-white/[0.06] p-2 sm:p-2.5">
            <div className="absolute inset-x-3 top-2 h-7 rounded-full bg-[#d7eadc]/14 blur-lg opacity-0 transition duration-500 group-hover:opacity-100" />
            <img
              src={image}
              alt={alt}
              className="relative h-14 w-14 object-contain transition duration-500 group-hover:scale-110 group-hover:rotate-[6deg] sm:h-16 sm:w-16 lg:h-20 lg:w-20"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 translate-y-1 rounded-full border border-[#c7dfce]/20 bg-[#113021]/95 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#d5eadc] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {label}
        </div>
      </div>
    </div>
  )
}

function HeroSection({ stats }) {
  return (
    <section
      id="home"
      className="rounded-[32px] border border-[#d6e2d8] bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] p-8 text-white shadow-[0_28px_70px_rgba(24,77,53,0.18)] lg:p-10"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#d5eadc]">
        AI-powered education analytics
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Transform student feedback into{' '}
            <span className="text-[#d5eadc]">
              smarter curriculum decisions
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            ThinkBack AI helps institutions collect verified feedback, analyze
            sentiment and topics, and generate actionable improvement
            suggestions through a modern platform experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/institutions/register"
              className="rounded-2xl bg-[#f4f7f2] px-6 py-3 font-semibold text-[#184d35] shadow-[0_18px_38px_rgba(7,20,13,0.16)] transition hover:bg-white"
            >
              Create Institution Account
            </Link>
            <button
              type="button"
              className="rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-3 font-medium text-white/90 transition hover:bg-white/[0.12]"
            >
              Request Demo
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-white/65">
            {[
              'Create institution',
              'Collect feedback',
              'Analyze with AI',
              'Improve courses',
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#c7dfce]" />
                  {item}
                </span>
                {index < 3 ? <span className="opacity-40">/</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-x-10 bottom-8 h-24 rounded-full bg-[#d7eadc]/14 blur-3xl sm:bottom-10" />

            <FloatingIconCard
              image={feedbackLoopImage}
              alt="Feedback workflow"
              label="Feedback loop"
              wrapperClassName="left-0 top-10 sm:left-2 lg:-left-4 lg:top-12"
              cardClassName="rotate-[-9deg] group-hover:rotate-[-2deg]"
            />

            <FloatingIconCard
              image={insightImage}
              alt="Insight discovery"
              label="Insight scan"
              wrapperClassName="right-0 top-0 sm:right-2 lg:-right-4 lg:top-8"
              cardClassName="rotate-[8deg] group-hover:rotate-[2deg]"
            />

            <FloatingIconCard
              image={analyticsImage}
              alt="Analytics insights"
              label="Trend analysis"
              wrapperClassName="bottom-12 right-4 sm:right-8 lg:-right-2 lg:bottom-16"
              cardClassName="rotate-[4deg] group-hover:rotate-0"
            />

            <FloatingIconCard
              image={intelligenceImage}
              alt="AI intelligence engine"
              label="AI engine"
              wrapperClassName="left-1 top-1/2 -translate-y-1/2 sm:left-6 lg:-left-2 lg:top-[58%]"
              cardClassName="rotate-[-5deg] group-hover:rotate-[-1deg]"
            />

            <img
              src={heroImage}
              alt="ThinkBack AI assistant"
              className="relative z-0 mx-auto w-full max-w-md object-contain lg:max-w-lg"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"
          >
            <div className="text-3xl font-semibold text-[#d5eadc]">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-white/65">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HeroSection
