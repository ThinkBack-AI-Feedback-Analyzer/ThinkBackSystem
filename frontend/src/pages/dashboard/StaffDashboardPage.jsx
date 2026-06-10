import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBook, FaChartBar, FaClipboardList, FaComments, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaBrain, FaExclamationTriangle, FaLightbulb,
  FaArrowRight, FaFire,
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
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
            <FaFire className="text-red-500 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-red-700">High dissatisfaction detected</span>
              <span className="text-sm text-red-500 ml-2">— {negPct}% negative across your forms.</span>
            </div>
            <button type="button" onClick={() => navigate('/reports')} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 whitespace-nowrap">
              See Report <FaArrowRight className="text-[9px]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Sentiment overview card */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBrain className="text-emerald-500 text-sm" />
              <h2 className="text-sm font-semibold text-slate-700">AI Sentiment Overview</h2>
              {sentTotal > 0 && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  posPct >= 65 ? 'bg-emerald-50 text-emerald-700' : posPct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                }`}>
                  {posPct >= 65 ? 'Healthy' : posPct >= 40 ? 'Mixed' : 'Needs Attention'}
                </span>
              )}
            </div>
            {loadingStats ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading…</p>
            ) : sentTotal === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-slate-400 mb-3">No AI analysis data yet.</p>
                <button type="button" onClick={() => navigate('/feedback-forms')}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                  Run Analysis →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Satisfied',   count: sentiment.positive, pct: posPct, bar: 'bg-emerald-400', text: 'text-emerald-700' },
                  { label: 'Mixed',       count: sentiment.neutral,  pct: sentTotal > 0 ? Math.round((sentiment.neutral/sentTotal)*100) : 0,  bar: 'bg-slate-300',   text: 'text-slate-500' },
                  { label: 'Unsatisfied', count: sentiment.negative, pct: negPct, bar: 'bg-red-400',     text: 'text-red-600' },
                ].map(({ label, count, pct, bar, text }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${text} w-8 text-right`}>{pct}%</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </div>
                ))}
                <button type="button" onClick={() => navigate('/reports')}
                  className="mt-2 text-xs font-semibold text-[#13462D] flex items-center gap-1 hover:gap-2 transition-all">
                  View full report <FaArrowRight className="text-[9px]" />
                </button>
              </div>
            )}
          </div>

          {/* Top topics + AI insight */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaLightbulb className="text-amber-500 text-sm" />
              <h2 className="text-sm font-semibold text-slate-700">Top AI Insights</h2>
            </div>
            {loadingStats ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading…</p>
            ) : topTopics.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">Analyse feedback forms to discover what students are discussing most.</p>
            ) : (
              <div className="space-y-3">
                {topTopic && (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 mb-1">Top Discussion Topic</p>
                    <p className="text-lg font-bold text-[#13462D]">{topTopic}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{topTopics[0]?.count ?? 0} student responses</p>
                  </div>
                )}
                {topTopics.slice(0, 5).map((t, i) => {
                  const max = topTopics[0]?.count ?? 1
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 truncate max-w-[70%]">{t.topic}</span>
                        <span className="text-slate-400">{t.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(t.count / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/feedback-forms')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700">
              <FaChartBar className="text-xs" /> View Feedback & Analysis
            </button>
            <button type="button" onClick={() => navigate('/reports')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700">
              <FaBook className="text-xs" /> Reports
            </button>
            {isCoordinator && (
              <button type="button" onClick={() => navigate('/staff-form-create')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700">
                <FaClipboardList className="text-xs" /> Create Feedback Form
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
