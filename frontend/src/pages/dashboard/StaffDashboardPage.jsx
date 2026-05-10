import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBook, FaChartBar, FaClipboardList, FaComments, FaCheckCircle, FaChartLine,
  FaArrowUp, FaArrowDown,
} from 'react-icons/fa'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar from '../../components/common/DashboardTopBar'
import institutionLogo from '../../assets/Logo_4.png'
import { useSidebarNav } from '../../hooks/useSidebarNav'

/* ── Same 3-D card styles as institution dashboard ── */
const CARD_STYLES = `
  .stat-card-3d {
    transform: perspective(2000px)
      rotateX(var(--rotate-x, 0deg))
      rotateY(var(--rotate-y, 0deg))
      translateZ(var(--translate-z, 0px));
    box-shadow:
      0 0 0 1px rgba(16,185,129,0.06),
      var(--shadow-x, 0px) var(--shadow-y, 20px) 40px rgba(16,185,129,0.08),
      0 15px 25px -5px rgba(0,0,0,0.04),
      inset 0 0 0 1px rgba(255,255,255,0.65);
    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.2s ease;
  }
  .stat-card-3d:hover { border-color: rgba(16,185,129,0.28) !important; }
  .stat-card-shine {
    background: radial-gradient(
      circle at var(--shine-x, 50%) var(--shine-y, 50%),
      rgba(255,255,255,0.12) 0%,
      transparent 70%
    );
    opacity: var(--shine-opacity, 0);
    transition: opacity 0.4s ease;
  }
  .stat-card-3d:hover .stat-card-shine { --shine-opacity: 1; }
  .stat-ghost-circle {
    background: var(--circle-color, rgba(16,185,129,0.03));
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: scale(var(--circle-scale, 1)) translateZ(-1px);
  }
  .stat-card-3d:hover .stat-ghost-circle { transform: scale(1.2) translateZ(-1px); }
`


const ROLE_META = {
  coordinator: {
    label:    'Coordinator',
    subtitle: 'Oversee course feedback and manage your department.',
    badge:    'bg-amber-100 text-amber-700',
  },
  lecturer: {
    label:    'Lecturer',
    subtitle: 'Track student feedback across your courses.',
    badge:    'bg-sky-100 text-sky-700',
  },
}

/* ── 3-D stat card (same logic as institution dashboard) ── */
const StatCard = ({ stat }) => {
  const cardRef = React.useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect    = cardRef.current.getBoundingClientRect()
    const x       = e.clientX - rect.left
    const y       = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15
    const rotateY = ((x - rect.width  / 2) / (rect.width  / 2)) *  15
    const card    = cardRef.current
    card.style.setProperty('--rotate-x',    `${rotateX}deg`)
    card.style.setProperty('--rotate-y',    `${rotateY}deg`)
    card.style.setProperty('--translate-z', '50px')
    card.style.setProperty('--shine-x',     `${(x / rect.width)  * 100}%`)
    card.style.setProperty('--shine-y',     `${(y / rect.height) * 100}%`)
    card.style.setProperty('--shadow-x',    `${(rotateY / 15) * -12}px`)
    card.style.setProperty('--shadow-y',    `${(rotateX / 15) *  12 + 15}px`)
    card.style.setProperty('--circle-scale','1.3')
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.setProperty('--rotate-x',    '0deg')
    card.style.setProperty('--rotate-y',    '0deg')
    card.style.setProperty('--translate-z', '0px')
    card.style.setProperty('--shadow-x',    '0px')
    card.style.setProperty('--shadow-y',    '10px')
    card.style.setProperty('--circle-scale','1')
  }

  return (
    <div
      ref={cardRef}
      className="stat-card-3d relative overflow-hidden flex flex-col bg-white rounded-2xl border border-[rgba(24,80,55,0.14)] p-5 cursor-pointer [transform-style:preserve-3d]"
      style={{ '--circle-color': stat.trendUp ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.03)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stat-card-shine absolute inset-0 pointer-events-none z-[5]" />
      <div className="stat-ghost-circle absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full z-0" />

      <div className="relative z-[1] flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[#f0fdf9] text-emerald-500">
            {stat.icon}
          </div>
          <div className="flex items-end gap-[3px] h-7">
            {stat.chartData.map((h, i) => (
              <div
                key={i}
                className={`w-[5px] rounded-sm transition-[height] duration-[800ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
                  i === stat.chartData.length - 1 ? 'bg-emerald-500' : 'bg-slate-100'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
          {stat.label}
        </div>
        <div className="text-3xl font-bold text-slate-800 mb-3 leading-none tracking-tight">
          {stat.value}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {stat.trendUp ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
            {stat.trend}
          </div>
          <div className="text-xs text-slate-400">{stat.trendText}</div>
        </div>

        <div className="mt-auto w-full">
          <div className="w-full h-1 bg-slate-100 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Welcome hero ── */
function WelcomeHero({ user, meta }) {
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />

      <div className="relative">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{greeting}</p>
          <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">{user.full_name}</h1>
        <p className="mt-1.5 text-sm text-white/60 max-w-md">{meta.subtitle}</p>
      </div>
    </div>
  )
}

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const { navItems, handleNav, handleLogout, user } = useSidebarNav()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'coordinator' && user.role !== 'lecturer') navigate('/')
  }, [user, navigate])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>
  }

  const meta  = ROLE_META[user.role] ?? ROLE_META.lecturer
  const isCoordinator = user.role === 'coordinator'

  const stats = [
    {
      label:     'MY COURSES',
      value:     isCoordinator ? '12' : '5',
      icon:      <FaBook />,
      trend:     '2',
      trendText: 'this semester',
      trendUp:   true,
      progress:  60,
      chartData: [40, 60, 30, 80, 50],
    },
    {
      label:     'ACTIVE FORMS',
      value:     isCoordinator ? '8' : '3',
      icon:      <FaClipboardList />,
      trend:     '1',
      trendText: 'this week',
      trendUp:   true,
      progress:  45,
      chartData: [30, 50, 70, 40, 60],
    },
    {
      label:     'RESPONSES',
      value:     isCoordinator ? '342' : '128',
      icon:      <FaComments />,
      trend:     '24',
      trendText: 'since yesterday',
      trendUp:   true,
      progress:  70,
      chartData: [20, 40, 60, 80, 100],
    },
    {
      label:     'COMPLETION RATE',
      value:     isCoordinator ? '78%' : '84%',
      icon:      <FaCheckCircle />,
      trend:     '3%',
      trendText: 'vs last semester',
      trendUp:   true,
      progress:  isCoordinator ? 78 : 84,
      chartData: [50, 30, 80, 40, 90],
    },
  ]

  return (
    <>
      <style>{CARD_STYLES}</style>

      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <DashboardSidebar
          navItems={navItems}
          activeNav="dashboard"
          onNavChange={handleNav}
          onLogout={handleLogout}
          logoSrc={institutionLogo}
          logoAlt="ThinkBack logo"
        />

        <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
          <DashboardTopBar
            userName={user.full_name}
            userEmail={user.email}
          />

          <WelcomeHero user={user} meta={meta} />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-4 md:p-6">
            {stats.map((stat, i) => <StatCard key={i} stat={stat} />)}
          </div>

          {/* Quick links */}
          <div className="px-4 pb-6 md:px-6 md:pb-8">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                >
                  <FaBook className="text-xs" /> View My Courses
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/feedback-forms')}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                >
                  <FaChartBar className="text-xs" /> View Feedback Results
                </button>
                {isCoordinator && (
                  <button
                    type="button"
                    onClick={() => navigate('/feedback-forms')}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                  >
                    <FaClipboardList className="text-xs" /> Manage Feedback Forms
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
