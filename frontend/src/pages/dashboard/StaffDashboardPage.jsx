import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBook, FaChartBar, FaClipboardList, FaComments, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaBrain, FaLightbulb,
  FaArrowRight, FaFire, FaUsers, FaFileAlt,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getDashboardStats, getFeedbackForms } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'

const CARD_STYLES = `
  .stat-card-3d {
    transform: perspective(2000px) rotateX(var(--rotate-x,0deg)) rotateY(var(--rotate-y,0deg)) translateZ(var(--translate-z,0px));
    box-shadow: 0 0 0 1px rgba(16,185,129,0.06), var(--shadow-x,0px) var(--shadow-y,20px) 40px rgba(16,185,129,0.08),
      0 15px 25px -5px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.65);
    transition: transform .1s ease-out, box-shadow .1s ease-out, border-color .2s ease;
  }
  .stat-card-3d:hover { border-color: rgba(16,185,129,0.28) !important; }
  .stat-card-shine {
    background: radial-gradient(circle at var(--shine-x,50%) var(--shine-y,50%), rgba(255,255,255,0.12) 0%, transparent 70%);
    opacity: var(--shine-opacity,0); transition: opacity .4s ease;
  }
  .stat-card-3d:hover .stat-card-shine { --shine-opacity: 1; }
  .stat-ghost-circle {
    background: var(--circle-color,rgba(16,185,129,0.03));
    transition: all .6s cubic-bezier(0.34,1.56,0.64,1);
    transform: scale(var(--circle-scale,1)) translateZ(-1px);
  }
  .stat-card-3d:hover .stat-ghost-circle { transform: scale(1.2) translateZ(-1px); }
`

const ROLE_META = {
  coordinator: { label: 'Coordinator', subtitle: 'Oversee course feedback and manage your department.', badge: 'bg-amber-100 text-amber-700' },
  lecturer:    { label: 'Lecturer',    subtitle: 'Track student feedback across your courses.',         badge: 'bg-sky-100 text-sky-700'   },
}

function StatCard({ stat }) {
  const cardRef = React.useRef(null)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect    = cardRef.current.getBoundingClientRect()
    const x       = e.clientX - rect.left, y = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15
    const rotateY = ((x - rect.width  / 2) / (rect.width  / 2)) *  15
    const card    = cardRef.current
    card.style.setProperty('--rotate-x',    `${rotateX}deg`)
    card.style.setProperty('--rotate-y',    `${rotateY}deg`)
    card.style.setProperty('--translate-z', '50px')
    card.style.setProperty('--shine-x',     `${(x / rect.width) * 100}%`)
    card.style.setProperty('--shine-y',     `${(y / rect.height) * 100}%`)
    card.style.setProperty('--shadow-x',    `${(rotateY / 15) * -12}px`)
    card.style.setProperty('--shadow-y',    `${(rotateX / 15) *  12 + 15}px`)
    card.style.setProperty('--circle-scale','1.3')
  }
  const handleMouseLeave = () => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.setProperty('--rotate-x', '0deg'); card.style.setProperty('--rotate-y', '0deg')
    card.style.setProperty('--translate-z', '0px'); card.style.setProperty('--shadow-x', '0px')
    card.style.setProperty('--shadow-y', '10px'); card.style.setProperty('--circle-scale', '1')
  }
  return (
    <div ref={cardRef}
      className="stat-card-3d relative overflow-hidden flex flex-col bg-white rounded-2xl border border-[rgba(24,80,55,0.14)] p-5 cursor-pointer [transform-style:preserve-3d]"
      style={{ '--circle-color': stat.trendUp ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.03)' }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
    >
      <div className="stat-card-shine absolute inset-0 pointer-events-none z-[5]" />
      <div className="stat-ghost-circle absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full z-0" />
      <div className="relative z-[1] flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[#f0fdf9] text-emerald-500">{stat.icon}</div>
          <div className="flex items-end gap-[3px] h-7">
            {stat.chartData.map((h, i) => (
              <div key={i} className={`w-[5px] rounded-sm transition-[height] duration-[800ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${i === stat.chartData.length - 1 ? 'bg-emerald-500' : 'bg-slate-100'}`}
                style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">{stat.label}</div>
        <div className="text-3xl font-bold text-slate-800 mb-3 leading-none tracking-tight">{stat.value}</div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {stat.trendUp ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}{stat.trend}
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

function WelcomeHero({ user, meta }) {
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{greeting}</p>
          <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}>{meta.label}</span>
        </div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">{user.full_name}</h1>
        <p className="mt-1.5 text-sm text-white/60 max-w-md">{meta.subtitle}</p>
      </div>
    </div>
  )
}

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const user     = useCurrentUser()
  const [dashStats, setDashStats]  = useState(null)
  const [forms,     setForms]      = useState([])
  const [loadingStats, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'coordinator' && user.role !== 'lecturer') navigate('/')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    Promise.allSettled([getDashboardStats(), getFeedbackForms()])
      .then(([statsRes, formsRes]) => {
        if (statsRes.status === 'fulfilled')  setDashStats(statsRes.value)
        if (formsRes.status === 'fulfilled') {
          const list = Array.isArray(formsRes.value) ? formsRes.value : []
          setForms(list)
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>

  const meta          = ROLE_META[user.role] ?? ROLE_META.lecturer
  const isCoordinator = user.role === 'coordinator'

  const activeForms      = forms.filter((f) => f.status === 'published').length
  const totalResponses   = forms.reduce((s, f) => s + (f.response_count ?? 0), 0)
  const totalDistributed = forms.reduce((s, f) => s + (f.distributed_count ?? 0), 0)
  const completionRate   = totalDistributed > 0 ? Math.round((totalResponses / totalDistributed) * 100) : 0

  const stats = [
    { label: 'MY FORMS',       value: loadingStats ? '—' : forms.length,     icon: <FaBook />,          trend: `${activeForms} active`, trendUp: activeForms > 0, progress: Math.min(forms.length * 10, 100),    chartData: [40, 60, 30, 80, Math.min(forms.length * 10, 100)] },
    { label: 'ACTIVE FORMS',   value: loadingStats ? '—' : activeForms,       icon: <FaClipboardList />, trend: 'published',             trendUp: activeForms > 0, progress: Math.min(activeForms * 15, 100),    chartData: [30, 50, 70, 40, Math.min(activeForms * 15, 100)] },
    { label: 'RESPONSES',      value: loadingStats ? '—' : totalResponses,    icon: <FaComments />,      trend: `from ${totalDistributed} sent`, trendUp: totalResponses > 0, progress: completionRate,             chartData: [20, 40, 60, 80, completionRate] },
    { label: 'COMPLETION RATE',value: loadingStats ? '—' : `${completionRate}%`, icon: <FaCheckCircle />, trend: `${completionRate >= 50 ? '+' : ''}${completionRate - 50}% vs avg`, trendUp: completionRate >= 50, progress: completionRate, chartData: [50, 30, 80, 40, completionRate] },
  ]

  const sentiment   = dashStats?.sentiment  ?? { positive: 0, neutral: 0, negative: 0 }
  const topTopics   = dashStats?.top_topics ?? []
  const sentTotal   = sentiment.positive + sentiment.neutral + sentiment.negative
  const posPct      = sentTotal > 0 ? Math.round((sentiment.positive / sentTotal) * 100) : 0
  const negPct      = sentTotal > 0 ? Math.round((sentiment.negative / sentTotal) * 100) : 0
  const isHighNeg   = sentTotal > 0 && negPct > 40
  const topTopic    = topTopics[0]?.topic ?? null

  return (
    <DashboardLayout activeNav="dashboard">
      <style>{CARD_STYLES}</style>

      <WelcomeHero user={user} meta={meta} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-4 md:p-6">
        {stats.map((stat, i) => <StatCard key={i} stat={stat} />)}
      </div>

      {/* ── AI Intelligence Panel ── */}
      <div className="px-4 pb-4 md:px-6 space-y-4">

        {/* Alert: high negative sentiment */}
        {!loadingStats && isHighNeg && (
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 pl-4 pr-5 py-3.5 shadow-sm overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
            <FaFire className="text-red-500 shrink-0 text-sm" />
            <p className="flex-1 text-sm text-slate-700">
              <span className="font-semibold text-slate-800">High dissatisfaction detected</span>
              <span className="text-slate-500"> — {negPct}% negative sentiment across your forms.</span>
            </p>
            <button type="button" onClick={() => navigate('/reports')} className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0">
              See Report <FaArrowRight className="text-[9px]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Sentiment Overview — redesigned ── */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FaBrain className="text-emerald-500 text-xs" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-700">Sentiment Overview</h2>
                </div>
                {sentTotal > 0 && (
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    posPct >= 65 ? 'bg-emerald-100 text-emerald-700'
                    : posPct >= 40 ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600'
                  }`}>
                    {posPct >= 65 ? '✓ Healthy' : posPct >= 40 ? '~ Mixed' : '⚠ Needs Attention'}
                  </span>
                )}
              </div>

              {loadingStats ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading…</p>
              ) : sentTotal === 0 ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <FaBrain className="text-slate-300 text-lg" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No analysis data yet</p>
                  <p className="text-xs text-slate-300 mb-4">Run AI analysis on a feedback form to see sentiment data here.</p>
                  <button type="button" onClick={() => navigate('/feedback-forms')}
                    className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-100 transition">
                    Go to Feedback Forms →
                  </button>
                </div>
              ) : (
                <>
                  {/* Big three metric pills */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Satisfied',   pct: posPct,                                                                              count: sentiment.positive, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-400' },
                      { label: 'Mixed',       pct: sentTotal > 0 ? Math.round((sentiment.neutral/sentTotal)*100) : 0, count: sentiment.neutral,  bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-500',   bar: 'bg-slate-300'   },
                      { label: 'Unsatisfied', pct: negPct,                                                                              count: sentiment.negative, bg: 'bg-red-50',   border: 'border-red-100',   text: 'text-red-600',   bar: 'bg-red-400'   },
                    ].map(({ label, pct, count, bg, border, text, bar }) => (
                      <div key={label} className={`rounded-xl ${bg} border ${border} px-3 py-3 flex flex-col items-center gap-1`}>
                        <span className={`text-xl font-bold ${text}`}>{pct}%</span>
                        <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                        <div className="w-full h-1 bg-white/70 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{count} resp.</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => navigate('/reports')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 transition">
                    View Full Report <FaArrowRight className="text-[9px]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Top topics */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FaLightbulb className="text-amber-500 text-xs" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700">Top AI Insights</h2>
              </div>
              {loadingStats ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading…</p>
              ) : topTopics.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <FaLightbulb className="text-amber-300 text-lg" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No topics yet</p>
                  <p className="text-xs text-slate-300">Analyse feedback forms to discover what students are discussing most.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topTopic && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#13462D] px-4 py-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <FaLightbulb className="text-amber-300 text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-0.5">Top Topic</p>
                        <p className="text-sm font-bold text-white truncate">{topTopic}</p>
                        <p className="text-[10px] text-white/40">{topTopics[0]?.count ?? 0} responses</p>
                      </div>
                    </div>
                  )}
                  {topTopics.slice(0, 4).map((t, i) => {
                    const max = topTopics[0]?.count ?? 1
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-300 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700 truncate">{t.topic}</span>
                            <span className="text-slate-400 shrink-0 ml-2">{t.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${(t.count / max) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions — redesigned ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
          <div className={`grid gap-4 ${isCoordinator ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {[
              {
                icon: FaChartBar,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                title: 'Feedback & Analysis',
                sub: 'View responses and AI insights',
                route: '/feedback-forms',
              },
              {
                icon: FaFileAlt,
                iconBg: 'bg-sky-50',
                iconColor: 'text-sky-600',
                title: 'Reports',
                sub: 'Export and review detailed reports',
                route: '/reports',
              },
              ...(isCoordinator ? [{
                icon: FaClipboardList,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
                title: 'Create Feedback Form',
                sub: 'Build and publish a new form',
                route: '/courses',
              }] : []),
            ].map((action) => (
              <button key={action.route} type="button" onClick={() => navigate(action.route)}
                className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-5 text-left hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0`}>
                    <action.icon className={`${action.iconColor} text-base`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#13462D] transition-colors">{action.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{action.sub}</p>
                  </div>
                  <FaArrowRight className="text-slate-300 text-xs mt-1 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
