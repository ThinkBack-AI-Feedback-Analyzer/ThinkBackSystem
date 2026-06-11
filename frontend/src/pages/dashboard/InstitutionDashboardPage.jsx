import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUsers, FaChartLine, FaClipboardList, FaCheckCircle,
  FaBook, FaFileAlt, FaExclamationTriangle, FaArrowRight,
  FaFire, FaThumbsUp,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getDashboardStats } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'

/* ── CSS for 3-D stat cards ─────────────────────────────────────────────────── */
const CARD_STYLES = `
  .stat-card-3d {
    transform: perspective(2000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(var(--tz,0px));
    box-shadow: 0 0 0 1px rgba(16,185,129,0.06), var(--sx,0px) var(--sy,20px) 40px rgba(16,185,129,0.08),
      0 15px 25px -5px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.65);
    transition: transform .1s ease-out, box-shadow .1s ease-out, border-color .2s;
  }
  .stat-card-3d:hover { border-color: rgba(16,185,129,0.28) !important; }
  .stat-card-shine {
    background: radial-gradient(circle at var(--shx,50%) var(--shy,50%), rgba(255,255,255,0.12) 0%, transparent 70%);
    opacity: var(--sho,0); transition: opacity .4s;
  }
  .stat-card-3d:hover .stat-card-shine { --sho: 1; }
  .stat-ghost { background: var(--gc,rgba(16,185,129,0.03)); transition: all .6s cubic-bezier(0.34,1.56,0.64,1); transform: scale(var(--gs,1)) translateZ(-1px); }
  .stat-card-3d:hover .stat-ghost { transform: scale(1.2) translateZ(-1px); }
`

/* ── Reusable components ─────────────────────────────────────────────────────── */
function StatCard({ stat }) {
  const ref = React.useRef(null)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const rx = ((y - r.height / 2) / (r.height / 2)) * -15
    const ry = ((x - r.width  / 2) / (r.width  / 2)) * 15
    const el = ref.current
    el.style.setProperty('--rx',  `${rx}deg`)
    el.style.setProperty('--ry',  `${ry}deg`)
    el.style.setProperty('--tz',  '50px')
    el.style.setProperty('--shx', `${(x / r.width) * 100}%`)
    el.style.setProperty('--shy', `${(y / r.height) * 100}%`)
    el.style.setProperty('--sx',  `${(ry / 15) * -12}px`)
    el.style.setProperty('--sy',  `${(rx / 15) * 12 + 15}px`)
    el.style.setProperty('--gs',  '1.3')
  }
  const leave = () => {
    const el = ref.current
    ;['--rx','--ry','--tz','--sx','--gs'].forEach(p => el.style.setProperty(p, p === '--sy' ? '10px' : p === '--gs' ? '1' : p === '--tz' ? '0px' : '0deg'))
    el.style.setProperty('--sy', '10px')
    el.style.setProperty('--gs', '1')
  }
  return (
    <div ref={ref} className="stat-card-3d relative overflow-hidden flex flex-col bg-white rounded-2xl border border-[rgba(24,80,55,0.14)] p-5 cursor-pointer [transform-style:preserve-3d]"
      style={{ '--gc': 'rgba(16,185,129,0.07)' }} onMouseMove={move} onMouseLeave={leave}>
      <div className="stat-card-shine absolute inset-0 pointer-events-none z-[5]" />
      <div className="stat-ghost absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full z-0" />
      <div className="relative z-[1] flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[#f0fdf9] text-emerald-500">
            {stat.icon}
          </div>
          <div className="flex items-end gap-[3px] h-7">
            {[40,60,30,80,stat.progress].map((h, i) => (
              <div key={i} className={`w-[5px] rounded-sm ${i === 4 ? 'bg-emerald-500' : 'bg-slate-100'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">{stat.label}</div>
        <div className="text-3xl font-bold text-slate-800 mb-3 leading-none tracking-tight">{stat.value}</div>
        <div className="mt-auto w-full">
          <div className="w-full h-1 bg-slate-100 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SentimentDonut({ positive, neutral, negative }) {
  const total = positive + neutral + negative
  if (total === 0) return <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">No data</div>
  const pDeg = (positive / total) * 360
  const nDeg = (neutral  / total) * 360
  return (
    <div className="relative h-36 w-36 shrink-0">
      <div className="h-full w-full rounded-full" style={{
        background: `conic-gradient(#10b981 0deg ${pDeg}deg, #94a3b8 ${pDeg}deg ${pDeg + nDeg}deg, #f87171 ${pDeg + nDeg}deg 360deg)`,
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <p className="text-xl font-bold text-slate-800">{total}</p>
          <p className="text-[10px] text-slate-400">responses</p>
        </div>
      </div>
    </div>
  )
}

function TopicsBar({ topics }) {
  if (!topics.length) return <p className="text-xs text-slate-400 py-4 text-center">No analysis data yet</p>
  const max = topics[0].count
  return (
    <div className="space-y-3">
      {topics.map((t, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 truncate max-w-[70%]">{t.topic}</span>
            <span className="text-slate-400">{t.count}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(t.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────────────────────── */
const InstitutionDashboardPage = () => {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'institution_admin') { navigate('/'); return }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading…</div>

  const statCards = [
    { label: 'TOTAL COURSES',   value: loading ? '—' : stats?.total_courses   ?? 0, icon: <FaBook />,          progress: 65 },
    { label: 'STAFF MEMBERS',   value: loading ? '—' : stats?.total_staff      ?? 0, icon: <FaUsers />,         progress: 45 },
    { label: 'ACTIVE FORMS',    value: loading ? '—' : stats?.active_forms     ?? 0, icon: <FaCheckCircle />,   progress: 55 },
    { label: 'TOTAL RESPONSES', value: loading ? '—' : stats?.total_responses  ?? 0, icon: <FaChartLine />,     progress: 85 },
  ]

  const sentiment  = stats?.sentiment  ?? { positive: 0, neutral: 0, negative: 0 }
  const topTopics  = stats?.top_topics ?? []
  const sentTotal  = sentiment.positive + sentiment.neutral + sentiment.negative
  const negPct     = sentTotal > 0 ? Math.round((sentiment.negative / sentTotal) * 100) : 0
  const posPct     = sentTotal > 0 ? Math.round((sentiment.positive / sentTotal) * 100) : 0
  const topTopic   = topTopics[0]?.topic ?? null
  const isHighNeg  = sentTotal > 0 && negPct > 40
  const isHealthy  = sentTotal > 0 && posPct >= 65

  return (
    <DashboardLayout activeNav="dashboard">
      <style>{CARD_STYLES}</style>

          {/* ── AI Alert Banner ── */}
          {!loading && isHighNeg && (
            <div className="mx-6 mt-6 flex items-center gap-3 rounded-2xl bg-white border border-slate-200 pl-4 pr-5 py-3.5 shadow-sm overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
              <FaFire className="text-red-500 shrink-0 text-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">High student dissatisfaction detected</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {negPct}% negative sentiment across analysed forms
                  {topTopic ? ` — most discussed topic: ${topTopic}` : ''}.
                </p>
              </div>
              <button type="button" onClick={() => navigate('/reports')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0">
                View AI Insights <FaArrowRight className="text-[9px]" />
              </button>
            </div>
          )}
          {!loading && isHealthy && (
            <div className="mx-6 mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
              <FaThumbsUp className="text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">AI Report: Student satisfaction is healthy</span>
                {' '}— {posPct}% positive sentiment{topTopic ? `. Top topic: ${topTopic}` : ''}.
              </p>
              <button type="button" onClick={() => navigate('/reports')}
                className="ml-auto text-xs font-semibold text-emerald-700 flex items-center gap-1 whitespace-nowrap hover:gap-2 transition-all">
                Full Report <FaArrowRight className="text-[9px]" />
              </button>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-6">
            {statCards.map((s, i) => <StatCard key={i} stat={s} />)}
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pb-6">

            {/* Sentiment overview */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Overall Sentiment</h2>
              {loading ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading…</p>
              ) : (
                <div className="flex items-center gap-6">
                  <SentimentDonut {...sentiment} />
                  <div className="flex-1 space-y-3">
                    {[
                      { label: 'Satisfied',   count: sentiment.positive, color: 'bg-emerald-500' },
                      { label: 'Mixed',       count: sentiment.neutral,  color: 'bg-slate-400'  },
                      { label: 'Unsatisfied', count: sentiment.negative, color: 'bg-red-400'    },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{s.label}</span>
                          <span className="text-slate-400">{sentTotal > 0 ? Math.round((s.count / sentTotal) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full transition-all duration-700`}
                            style={{ width: sentTotal > 0 ? `${(s.count / sentTotal) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    ))}
                    {sentTotal === 0 && <p className="text-xs text-slate-400">Run analysis on a feedback form to see sentiment data.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Top topics */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Top Feedback Topics</h2>
              {loading ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading…</p>
              ) : (
                <TopicsBar topics={topTopics} />
              )}
            </div>
          </div>

          {/* ── Quick links ── */}
          <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Feedback Forms', sub: 'Manage questionnaires', icon: <FaClipboardList />, route: '/feedback-forms' },
              { label: 'Reports',        sub: 'Export and review data', icon: <FaFileAlt />,       route: '/reports' },
              { label: 'Manage Staff',   sub: 'Invite and organise staff', icon: <FaUsers />,      route: '/manage-users' },
            ].map((q) => (
              <button key={q.route} type="button" onClick={() => navigate(q.route)}
                className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 text-left hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#f0fdf9] text-emerald-600 flex items-center justify-center text-base">{q.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{q.label}</p>
                  <p className="text-xs text-slate-400">{q.sub}</p>
                </div>
              </button>
            ))}
          </div>
    </DashboardLayout>
  )
}

export default InstitutionDashboardPage
