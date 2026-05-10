import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaFileAlt, FaDownload, FaChartBar, FaUsers,
  FaCheckCircle, FaClipboardList, FaSearch,
} from 'react-icons/fa'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar  from '../../components/common/DashboardTopBar'
import institutionLogo  from '../../assets/Logo_4.png'
import { getFeedbackForms, getAnalysis } from '../../services/feedback'
import { useSidebarNav } from '../../hooks/useSidebarNav'

function StatusBadge({ status }) {
  const cls = status === 'published'
    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
    : 'bg-amber-50 border-amber-100 text-amber-700'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  )
}

function SentimentMini({ positive = 0, neutral = 0, negative = 0 }) {
  const total = positive + neutral + negative
  if (total === 0) return <span className="text-xs text-slate-400">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-24 overflow-hidden rounded-full gap-px">
        {positive > 0 && <div style={{ width: `${(positive / total) * 100}%` }} className="bg-emerald-400" />}
        {neutral  > 0 && <div style={{ width: `${(neutral  / total) * 100}%` }} className="bg-slate-300"   />}
        {negative > 0 && <div style={{ width: `${(negative / total) * 100}%` }} className="bg-red-400"     />}
      </div>
      <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((positive / total) * 100)}%</span>
    </div>
  )
}

function exportToCSV(rows) {
  const headers = ['Form Title', 'Type', 'Status', 'Questions', 'Distributed', 'Responded', 'Response Rate %', 'Positive %', 'Neutral %', 'Negative %', 'Top Topic', 'Created At']
  const lines = [
    headers.join(','),
    ...rows.map((r) => {
      const sent  = r.sentiment ?? { positive: 0, neutral: 0, negative: 0 }
      const total = sent.positive + sent.neutral + sent.negative
      const pct   = (n) => total > 0 ? Math.round((n / total) * 100) : 0
      const rate  = r.distributed_count > 0 ? Math.round((r.response_count / r.distributed_count) * 100) : 0
      return [
        `"${r.title}"`,
        r.form_type,
        r.status,
        r.question_count,
        r.distributed_count,
        r.response_count,
        rate,
        pct(sent.positive),
        pct(sent.neutral),
        pct(sent.negative),
        `"${r.topTopic ?? '—'}"`,
        new Date(r.created_at).toLocaleDateString(),
      ].join(',')
    }),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `thinkback-reports-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { navItems, handleNav, handleLogout, user } = useSidebarNav()
  const [forms,     setForms]     = useState([])
  const [analysisMap, setAnalysisMap] = useState({})
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(user.role)) { navigate('/'); return }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    getFeedbackForms()
      .then(async (data) => {
        const list = Array.isArray(data) ? data : []
        setForms(list)
        // fetch analysis for published forms in background
        const published = list.filter((f) => f.status === 'published')
        const results   = await Promise.allSettled(published.map((f) => getAnalysis(f.id)))
        const map = {}
        published.forEach((f, i) => {
          if (results[i].status === 'fulfilled') {
            const rows = results[i].value
            if (Array.isArray(rows) && rows.length) {
              // aggregate across courses
              const agg = { positive: 0, neutral: 0, negative: 0 }
              const topicCounts = {}
              rows.forEach((r) => {
                const s = r.results?.sentiment_distribution ?? {}
                agg.positive += s.positive ?? 0
                agg.neutral  += s.neutral  ?? 0
                agg.negative += s.negative ?? 0
                ;(r.results?.topics ?? []).forEach((t) => {
                  topicCounts[t.topic] = (topicCounts[t.topic] ?? 0) + t.count
                })
              })
              const topTopic = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a])[0] ?? null
              map[f.id] = { sentiment: agg, topTopic }
            }
          }
        })
        setAnalysisMap(map)
      })
      .catch(() => toast.error('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return forms.filter((f) =>
      f.title.toLowerCase().includes(q) || f.form_type.toLowerCase().includes(q) || f.status.toLowerCase().includes(q)
    )
  }, [forms, search])

  const enriched = useMemo(() => filtered.map((f) => ({
    ...f,
    ...(analysisMap[f.id] ?? {}),
  })), [filtered, analysisMap])

  const stats = useMemo(() => ({
    total:     forms.length,
    published: forms.filter((f) => f.status === 'published').length,
    responses: forms.reduce((s, f) => s + (f.response_count ?? 0), 0),
    analyzed:  Object.keys(analysisMap).length,
  }), [forms, analysisMap])

  if (!user) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading…</div>

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DashboardSidebar
        navItems={navItems}
        activeNav="reports"
        onNavChange={handleNav}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar userName={user.full_name} userEmail={user.email} searchPlaceholder="Search reports" />

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Analytics & Reports</p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Reports</h1>
                <p className="mt-2 max-w-md text-sm text-white/60">
                  Review feedback data and export results for all forms.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    { icon: FaClipboardList, label: 'Total Forms',     value: stats.total },
                    { icon: FaCheckCircle,   label: 'Published',       value: stats.published },
                    { icon: FaUsers,         label: 'Total Responses', value: stats.responses },
                    { icon: FaChartBar,      label: 'Analysed',        value: stats.analyzed },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                        <p.icon className="text-sm text-white/90" />
                      </div>
                      <div>
                        <p className="text-lg font-bold leading-none text-white">{p.value}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-white/60">{p.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportToCSV(enriched)}
                disabled={enriched.length === 0}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 disabled:opacity-50 lg:self-auto"
              >
                <FaDownload className="text-xs" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl rounded-[32px] bg-white shadow-md overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <label className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-9 cursor-text hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <FaSearch className="text-slate-400 text-xs shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, type, status…"
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
              )}
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">Loading reports…</div>
            ) : enriched.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                {search ? `No results for "${search}"` : 'No feedback forms found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#13462D] text-white">
                    <tr>
                      {['Form Title', 'Type', 'Status', 'Distributed', 'Responses', 'Rate', 'Sentiment', 'Top Topic', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-4 whitespace-nowrap font-semibold first:rounded-tl-2xl last:rounded-tr-2xl">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map((f) => {
                      const sent  = f.sentiment ?? { positive: 0, neutral: 0, negative: 0 }
                      const rate  = f.distributed_count > 0 ? Math.round((f.response_count / f.distributed_count) * 100) : 0
                      return (
                        <tr key={f.id} className="border-b border-[#e3ece6] text-slate-700 hover:bg-[#f6fbf8] transition">
                          <td className="px-5 py-4 font-semibold text-[#124f2f] max-w-[200px] truncate">{f.title}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-50 border-slate-200 text-slate-600">{f.form_type}</span>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={f.status} /></td>
                          <td className="px-5 py-4 text-slate-600">{f.distributed_count ?? 0}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <FaUsers className="text-xs text-slate-400" />
                              <span className="font-semibold text-[#13462D]">{f.response_count ?? 0}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold text-sm ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                              {rate}%
                            </span>
                          </td>
                          <td className="px-5 py-4 min-w-[140px]">
                            <SentimentMini {...sent} />
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 max-w-[160px] truncate">{f.topTopic ?? '—'}</td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => navigate('/feedback-analysis', { state: { formId: f.id, formTitle: f.title } })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <FaChartBar className="text-[10px]" />
                              Analysis
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
