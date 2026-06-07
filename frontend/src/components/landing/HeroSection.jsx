import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicStats } from '../../services/feedback'
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
        <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-[#123624]/80 p-1 shadow-xl shadow-black/20 backdrop-blur transition duration-500 group-hover:-translate-y-2 group-hover:scale-105 group-hover:border-[#c7dfce]/45 group-hover:bg-[#173c29]/92 group-hover:shadow-[0_22px_55px_rgba(183,209,192,0.22)] sm:p-1.5">
          <div className="relative rounded-[16px] border border-[#d7e8dc]/12 bg-white/[0.06] p-1.5 sm:p-2">
            <div className="absolute inset-x-3 top-2 h-6 rounded-full bg-[#d7eadc]/14 blur-lg opacity-0 transition duration-500 group-hover:opacity-100" />
            <img
              src={image}
              alt={alt}
              className="relative h-11 w-11 object-contain transition duration-500 group-hover:scale-110 group-hover:rotate-[6deg] sm:h-[3.25rem] sm:w-[3.25rem] lg:h-16 lg:w-16"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 translate-y-1 rounded-full border border-[#c7dfce]/20 bg-[#113021]/95 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#d5eadc] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {label}
        </div>
      </div>
    </div>
  )
}

function HeroSection({ stats: staticStats }) {
  const [stats, setStats] = useState(staticStats)

  useEffect(() => {
    getPublicStats()
      .then((data) => setStats([
        { label: 'Number of Institutions', value: String(data.institutions) },
        { label: 'Created Courses',        value: String(data.courses)      },
        { label: 'Activated Forms',        value: String(data.active_forms) },
        { label: 'Feedback Collected',     value: String(data.responses)    },
      ]))
      .catch(() => {})
  }, [])

  return (
    <section
      id="home"
      className="bg-[linear-gradient(135deg,#214f39_0%,#184d35_42%,#102d1d_100%)] py-6 text-white shadow-[0_28px_70px_rgba(24,77,53,0.18)] lg:py-8"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d5eadc]">
          AI-powered education analytics
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Collect Anonymous Student Feedback and{' '}
              <span className="text-[#d5eadc]">
                Improve Your Curriculum
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              ThinkBack AI helps institutions collect honest and anonymous student feedback. Analyze sentiment, uncover key insights, and turn student feedback into smarter curriculum decisions all in one simple platform.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/institutions/register"
                className="rounded-2xl bg-[#f4f7f2] px-5 py-2.5 text-sm font-semibold text-[#184d35] shadow-[0_18px_38px_rgba(7,20,13,0.16)] transition hover:bg-white"
              >
                Create Institution Account
              </Link>
              <button
                type="button"
                className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.12]"
              >
                Request Demo
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-white/65 sm:text-sm">
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
                  {index < 3 ? <span className="hidden sm:inline opacity-40">/</span> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-x-12 bottom-8 h-20 rounded-full bg-[#d7eadc]/14 blur-3xl sm:bottom-9" />

              <FloatingIconCard
                image={feedbackLoopImage}
                alt="Feedback workflow"
                label="Feedback loop"
                wrapperClassName="hidden sm:block absolute left-2 top-8 sm:left-4 lg:left-0 lg:top-10"
                cardClassName="rotate-[-9deg] group-hover:rotate-[-2deg]"
              />

              <FloatingIconCard
                image={insightImage}
                alt="Insight discovery"
                label="Insight scan"
                wrapperClassName="hidden sm:block absolute right-2 top-0 sm:right-4 lg:right-0 lg:top-6"
                cardClassName="rotate-[8deg] group-hover:rotate-[2deg]"
              />

              <FloatingIconCard
                image={analyticsImage}
                alt="Analytics insights"
                label="Trend analysis"
                wrapperClassName="hidden sm:block absolute bottom-10 right-6 sm:right-10 lg:right-2 lg:bottom-12"
                cardClassName="rotate-[4deg] group-hover:rotate-0"
              />

              <FloatingIconCard
                image={intelligenceImage}
                alt="AI intelligence engine"
                label="AI engine"
                wrapperClassName="hidden sm:block absolute left-2 top-1/2 -translate-y-1/2 sm:left-7 lg:left-1 lg:top-[56%]"
                cardClassName="rotate-[-5deg] group-hover:rotate-[-1deg]"
              />

              <img
                src={heroImage}
                alt="ThinkBack AI assistant"
                className="relative z-0 mx-auto w-full max-w-xs object-contain sm:max-w-sm lg:max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-4"
            >
              <div className="text-2xl font-semibold text-[#d5eadc] sm:text-[1.75rem]">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm text-white/65">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
