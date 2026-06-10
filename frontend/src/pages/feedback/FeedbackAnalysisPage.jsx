import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaSync, FaChartBar, FaUsers,
  FaCheckCircle, FaClock, FaLightbulb, FaQuoteLeft,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getFeedbackForm, analyzeForm, getAnalysis } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'

// ── Donut chart (pure CSS conic-gradient) ─────────────────────────────────────
function DonutChart({ positive, neutral, negative }) {
  const total = positive + neutral + negative
  if (total === 0) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
        No data
      </div>
    )
  }
  const pDeg   = (positive / total) * 360
  const nDeg   = (neutral  / total) * 360
  return (
    <div className="relative h-40 w-40 shrink-0">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(
            #10b981 0deg ${pDeg}deg,
            #94a3b8 ${pDeg}deg ${pDeg + nDeg}deg,
            #f87171 ${pDeg + nDeg}deg 360deg
          )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{total}</p>
          <p className="text-[10px] text-slate-400">total</p>
        </div>
      </div>
    </div>
  )
}

// ── Stacked sentiment bar ──────────────────────────────────────────────────────
function SentimentBar({ positive, neutral, negative }) {
  const total = positive + neutral + negative
  if (total === 0) return <div className="h-2.5 rounded-full bg-slate-100" />
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full gap-px">
      {positive > 0 && (
        <div style={{ width: `${(positive / total) * 100}%` }} className="bg-emerald-400" />
      )}
      {neutral > 0 && (
        <div style={{ width: `${(neutral / total) * 100}%` }} className="bg-slate-300" />
      )}
      {negative > 0 && (
        <div style={{ width: `${(negative / total) * 100}%` }} className="bg-red-400" />
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, colorClass }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="text-sm" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FeedbackAnalysisPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { formId, formTitle } = location.state ?? {}
  const authUser = useCurrentUser()
  const authState = { user: authUser }

  const [formStats, setFormStats] = useState({ distributed_count: 0, response_count: 0 })
  const [analysis,  setAnalysis]  = useState([])
  const [status,    setStatus]    = useState('loading') // loading | idle | running | done | error | timeout
  const pollRef = useRef(null)

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    if (!formId)         { navigate('/feedback-forms'); return }
  }, [authState.user, formId, navigate])

  useEffect(() => {
    if (!formId) return
    getFeedbackForm(formId)
      .then((data) => setFormStats({ distributed_count: data.distributed_count ?? 0, response_count: data.response_count ?? 0 }))
      .catch(() => {})

    getAnalysis(formId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnalysis(data)
          setStatus('done')
        } else {
          setStatus('idle')
        }
      })
      .catch(() => setStatus('idle'))
  }, [formId])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const handleAnalyse = async () => {
    setStatus('running')
    try {
      await analyzeForm(formId)
      const triggeredAt = new Date()
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        try {
          const data = await getAnalysis(formId)
          const hasNew = Array.isArray(data) && data.some((r) => new Date(r.analyzed_at) > triggeredAt)
          if (hasNew) {
            setAnalysis(data)
            setStatus('done')
            clearInterval(pollRef.current)
            toast.success('Analysis complete!')
          } else if (attempts >= 24) {
            setStatus('timeout')
            clearInterval(pollRef.current)
          }
        } catch {
          if (attempts >= 24) { setStatus('error'); clearInterval(pollRef.current) }
        }
      }, 5000)
    } catch {
      setStatus('error')
      toast.error('Failed to start analysis. Is the AI service running?')
    }
  }

  const overall = analysis.reduce(
    (acc, group) => {
      group.results.forEach((item) => {
        acc.positive += item.sentiment_summary.positive
        acc.neutral  += item.sentiment_summary.neutral
        acc.negative += item.sentiment_summary.negative
      })
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 },
  )

  const responseRate = formStats.distributed_count > 0
    ? Math.round((formStats.response_count / formStats.distributed_count) * 100)
    : 0

  if (!authState.user) return null

  return (
    <DashboardLayout activeNav="feedback">

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/feedback-forms')}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20"
              >
                <FaArrowLeft className="text-[10px]" /> Back
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">AI Feedback Analysis</p>
                <h1 className="text-xl font-bold text-white">{formTitle ?? 'Analysis'}</h1>
              </div>
            </div>
            <button
              type="button"
              disabled={status === 'running'}
              onClick={handleAnalyse}
              className="flex items-center gap-2 self-start rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#13462D] shadow transition hover:bg-emerald-50 disabled:opacity-60 sm:self-auto"
            >
              {status === 'running'
                ? <><FaSync className="text-xs animate-spin" /> Analysing…</>
                : <><FaChartBar className="text-xs" /> {analysis.length > 0 ? 'Re-run Analysis' : 'Run Analysis'}</>
              }
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mx-4 mt-4 md:mx-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Distributed"    value={formStats.distributed_count}                               Icon={FaUsers}       colorClass="bg-blue-50 text-blue-500" />
          <StatCard label="Responded"      value={formStats.response_count}                                  Icon={FaCheckCircle} colorClass="bg-emerald-50 text-emerald-500" />
          <StatCard label="Pending"        value={formStats.distributed_count - formStats.response_count}    Icon={FaClock}       colorClass="bg-amber-50 text-amber-500" />
          <StatCard label="Response Rate"  value={`${responseRate}%`}                                        Icon={FaChartBar}    colorClass="bg-violet-50 text-violet-500" />
        </div>

        <div className="px-4 py-6 md:px-6 space-y-6 pb-16">

          {/* ── Idle ── */}
          {status === 'idle' && (
            <div className="mx-auto max-w-7xl rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
              <FaChartBar className="mx-auto mb-4 text-5xl text-slate-200" />
              <p className="mb-1 font-semibold text-slate-500">No analysis yet</p>
              <p className="mb-6 text-sm text-slate-400">
                Click <span className="font-semibold text-[#13462D]">Run Analysis</span> to process student responses with AI.
              </p>
            </div>
          )}

          {/* ── Running ── */}
          {status === 'running' && (
            <div className="mx-auto max-w-7xl rounded-2xl border border-emerald-100 bg-emerald-50 py-24 text-center">
              <FaSync className="mx-auto mb-4 text-4xl text-emerald-400 animate-spin" />
              <p className="font-semibold text-emerald-700">AI is analysing student responses…</p>
              <p className="mt-1 text-sm text-emerald-500">This may take up to a minute. Please wait.</p>
            </div>
          )}

          {/* ── Error / Timeout ── */}
          {(status === 'error' || status === 'timeout') && (
            <div className="mx-auto max-w-7xl rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
              <p className="font-semibold text-red-600">
                {status === 'timeout'
                  ? 'Analysis is taking longer than expected. Try again.'
                  : 'Analysis failed. Make sure the AI service is running on port 8001.'}
              </p>
              <button type="button" onClick={handleAnalyse} className="mt-4 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">
                Retry
              </button>
            </div>
          )}

          {/* ── Results ── */}
          {status === 'done' && analysis.length > 0 && (
            <div className="mx-auto max-w-7xl space-y-6">

              {/* Overview row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Sentiment donut */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold text-slate-800">Overall Sentiment</h3>
                  <div className="flex items-center gap-8">
                    <DonutChart positive={overall.positive} neutral={overall.neutral} negative={overall.negative} />
                    <div className="space-y-4">
                      {[
                        { label: 'Satisfied',   value: overall.positive, dot: 'bg-emerald-400', text: 'text-emerald-700' },
                        { label: 'Mixed',       value: overall.neutral,  dot: 'bg-slate-300',   text: 'text-slate-500'  },
                        { label: 'Unsatisfied', value: overall.negative, dot: 'bg-red-400',     text: 'text-red-600'   },
                      ].map(({ label, value, dot, text }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${dot}`} />
                          <span className="w-16 text-sm text-slate-500">{label}</span>
                          <span className={`text-lg font-bold ${text}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Response rate gauge */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="mb-5 font-semibold text-slate-800">Response Rate</h3>
                  <div>
                    <div className="mb-2 flex items-end gap-1">
                      <span className="text-6xl font-bold text-[#13462D]">{responseRate}</span>
                      <span className="mb-2 text-2xl font-semibold text-slate-400">%</span>
                    </div>
                    <div className="mb-3 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#13462D] transition-all duration-700"
                        style={{ width: `${responseRate}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-400">
                      {formStats.response_count} of {formStats.distributed_count} students responded
                    </p>
                  </div>

                  {/* Mini breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                    {[
                      { label: 'Satisfied',   value: overall.positive, cls: 'text-emerald-600 bg-emerald-50' },
                      { label: 'Mixed',       value: overall.neutral,  cls: 'text-slate-500 bg-slate-50'    },
                      { label: 'Unsatisfied', value: overall.negative, cls: 'text-red-500 bg-red-50'        },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className={`rounded-xl px-3 py-2 text-center ${cls}`}>
                        <p className="text-lg font-bold">{value}</p>
                        <p className="text-[10px] font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Per-course sections */}
              {analysis.map((group) => (
                <div key={group.course_name}>

                  {/* Course divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {group.course_name}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {group.results.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-400">
                      No open-ended responses found for this course.
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.results.map((item) => (
                      <div key={item.topic} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">

                        {/* Topic header */}
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-[#13462D]/10 px-3 py-1 text-xs font-bold text-[#13462D]">
                            {item.topic}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.feedback_count} response{item.feedback_count !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Sentiment bar */}
                        <div className="space-y-1.5">
                          <SentimentBar
                            positive={item.sentiment_summary.positive}
                            neutral={item.sentiment_summary.neutral}
                            negative={item.sentiment_summary.negative}
                          />
                          <div className="flex gap-4 text-[11px] font-semibold">
                            <span className="text-emerald-600">+{item.sentiment_summary.positive} positive</span>
                            <span className="text-slate-400">{item.sentiment_summary.neutral} neutral</span>
                            <span className="text-red-500">-{item.sentiment_summary.negative} negative</span>
                          </div>
                        </div>

                        {/* Common feedback */}
                        {item.common_feedback.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Common Feedback</p>
                            {item.common_feedback.slice(0, 3).map((fb, i) => (
                              <div key={i} className="flex gap-2 items-start rounded-xl bg-slate-50 px-3 py-2.5">
                                <FaQuoteLeft className="mt-0.5 shrink-0 text-[9px] text-slate-300" />
                                <p className="text-xs leading-relaxed text-slate-600">{fb}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* AI suggestion */}
                        {item.suggestion && (
                          <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <FaLightbulb className="mt-0.5 shrink-0 text-sm text-amber-400" />
                            <div>
                              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-widest text-amber-600">
                                AI Suggestion
                              </p>
                              <p className="text-xs leading-relaxed text-amber-800">{item.suggestion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="text-center text-xs text-slate-400 pb-4">
                Last analysed: {new Date(analysis[0]?.analyzed_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
    </DashboardLayout>
  )
}
