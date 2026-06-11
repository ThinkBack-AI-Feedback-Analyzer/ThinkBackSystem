import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaSync, FaChartBar, FaUsers, FaCheckCircle, FaClock,
  FaDownload, FaCheck, FaBrain,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getFeedbackForm, analyzeForm, getAnalysis, getAnalysisJobs } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function getSuggestionKey(formId, courseIndex, topic) {
  return `thinkback_suggestion_${formId}_${courseIndex}_${topic}`
}

function scoreColor(pct) {
  if (pct === null) return { ring: 'ring-slate-200',  bg: 'bg-slate-50',   text: 'text-slate-400',  label: '—'        }
  if (pct >= 65)   return { ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Healthy'  }
  if (pct >= 40)   return { ring: 'ring-amber-300',   bg: 'bg-amber-50',   text: 'text-amber-600',  label: 'Mixed'    }
  return               { ring: 'ring-red-300',      bg: 'bg-red-50',     text: 'text-red-600',    label: 'Critical' }
}

function calcScore(pos, neu, neg) {
  const t = pos + neu + neg
  return t > 0 ? Math.round((pos / t) * 100) : null
}

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
}

function AnalysisSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48 lg:col-span-1" />
        <Skeleton className="h-48 lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  )
}

/* ─── Donut chart ─────────────────────────────────────────────────────────── */
function DonutChart({ positive, neutral, negative, size = 160 }) {
  const total = positive + neutral + negative
  if (total === 0) return (
    <div className="flex items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400"
      style={{ width: size, height: size }}>No data</div>
  )
  const pDeg = (positive / total) * 360
  const nDeg = (neutral  / total) * 360
  const score = Math.round((positive / total) * 100)
  const col = scoreColor(score)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full" style={{
        background: `conic-gradient(#10b981 0deg ${pDeg}deg, #94a3b8 ${pDeg}deg ${pDeg + nDeg}deg, #f87171 ${pDeg + nDeg}deg 360deg)`,
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-full bg-white shadow-sm"
          style={{ width: size * 0.6, height: size * 0.6 }}>
          <p className={`font-black leading-none ${col.text}`} style={{ fontSize: size * 0.2 }}>{score}%</p>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: size * 0.075 }}>satisfied</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Sentiment bar ───────────────────────────────────────────────────────── */
function SentimentBar({ positive, neutral, negative, height = 'h-3' }) {
  const total = positive + neutral + negative
  if (total === 0) return <div className={`${height} rounded-full bg-slate-100`} />
  return (
    <div className={`flex ${height} overflow-hidden rounded-full`}>
      {positive > 0 && <div style={{ width: `${(positive / total) * 100}%` }} className="bg-emerald-400 transition-all duration-700" />}
      {neutral  > 0 && <div style={{ width: `${(neutral  / total) * 100}%` }} className="bg-slate-300 transition-all duration-700" />}
      {negative > 0 && <div style={{ width: `${(negative / total) * 100}%` }} className="bg-red-400 transition-all duration-700" />}
    </div>
  )
}

/* ─── Suggestion action card ──────────────────────────────────────────────── */
function SuggestionCard({ suggestion, storageKey }) {
  const [actionStatus, setActionStatus] = useState(() => localStorage.getItem(storageKey) ?? 'new')

  const handleAction = (next) => {
    setActionStatus(next)
    localStorage.setItem(storageKey, next)
    toast.success(next === 'acknowledged' ? 'Acknowledged' : 'Marked as acted on')
  }

  return (
    <div className="pt-3.5 mt-3.5 border-t border-slate-100">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Recommendation</p>
        {actionStatus === 'acted' && (
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <FaCheck className="text-[8px]" /> Acted on
          </span>
        )}
        {actionStatus === 'acknowledged' && (
          <span className="text-[10px] text-slate-400">Acknowledged</span>
        )}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{suggestion}</p>
      {actionStatus === 'new' && (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleAction('acknowledged')}
            className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition">
            Acknowledge
          </button>
          <button type="button" onClick={() => handleAction('acted')}
            className="text-xs text-emerald-700 border border-emerald-200 rounded-md px-3 py-1.5 hover:bg-emerald-50 transition">
            Mark as Acted
          </button>
        </div>
      )}
      {actionStatus === 'acknowledged' && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => handleAction('acted')}
            className="text-xs text-emerald-700 border border-emerald-200 rounded-md px-3 py-1.5 hover:bg-emerald-50 transition">
            Mark as Acted
          </button>
          <button type="button" onClick={() => { setActionStatus('new'); localStorage.removeItem(storageKey) }}
            className="text-xs text-slate-400 hover:text-slate-500">Reset</button>
        </div>
      )}
      {actionStatus === 'acted' && (
        <button type="button" onClick={() => { setActionStatus('new'); localStorage.removeItem(storageKey) }}
          className="text-xs text-slate-400 hover:text-slate-500">Reset</button>
      )}
    </div>
  )
}

/* ─── Topic card ──────────────────────────────────────────────────────────── */
function TopicCard({ item, formId, groupIdx }) {
  const pos   = item.sentiment_summary?.positive ?? 0
  const neu   = item.sentiment_summary?.neutral  ?? 0
  const neg   = item.sentiment_summary?.negative ?? 0
  const total = pos + neu + neg
  const score = calcScore(pos, neu, neg)

  const dotColor =
    score === null ? 'bg-slate-300'
    : score >= 65  ? 'bg-emerald-400'
    : score >= 40  ? 'bg-amber-400'
    :                'bg-red-400'

  const scoreColor =
    score === null ? 'text-slate-300'
    : score >= 65  ? 'text-emerald-600'
    : score >= 40  ? 'text-amber-500'
    :                'text-red-500'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-4 hover:border-slate-300 hover:shadow-sm transition-all duration-150">

      {/* Header: status dot + topic + score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.topic}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.feedback_count} response{item.feedback_count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold leading-none tabular-nums ${scoreColor}`}>
            {score !== null ? `${score}%` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">satisfaction</p>
        </div>
      </div>

      {/* Sentiment bar + counts */}
      {total > 0 && (
        <div>
          <SentimentBar positive={pos} neutral={neu} negative={neg} height="h-2" />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{pos} satisfied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />{neu} neutral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{neg} unsatisfied
            </span>
          </div>
        </div>
      )}

      {/* Student feedback quotes */}
      {item.common_feedback?.length > 0 && (
        <div className="border-t border-slate-100 pt-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Student Feedback</p>
          <div className="space-y-2">
            {item.common_feedback.slice(0, 3).map((fb, i) => (
              <p key={i} className="text-xs text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-200">
                {fb}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* AI recommendation */}
      {item.suggestion && (
        <SuggestionCard
          suggestion={item.suggestion}
          storageKey={getSuggestionKey(formId, groupIdx, item.topic)}
        />
      )}
    </div>
  )
}

/* ─── PDF generation ──────────────────────────────────────────────────────── */
function openAnalysisPDF({ formTitle, formStats, analysis, overall, responseRate }) {
  const date   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const total  = overall.positive + overall.neutral + overall.negative
  const posPct = total > 0 ? Math.round((overall.positive / total) * 100) : 0
  const neuPct = total > 0 ? Math.round((overall.neutral  / total) * 100) : 0
  const negPct = total > 0 ? Math.round((overall.negative / total) * 100) : 0

  const courseSections = analysis.map((group) => {
    const itemsHTML = (Array.isArray(group.results) ? group.results : []).map((item) => {
      const t   = item.sentiment_summary
      const tot = t.positive + t.neutral + t.negative
      const pp  = tot > 0 ? Math.round((t.positive / tot) * 100) : 0
      const np  = tot > 0 ? Math.round((t.negative / tot) * 100) : 0
      const nep = tot > 0 ? Math.round((t.neutral  / tot) * 100) : 0
      return `
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;page-break-inside:avoid">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="background:#ecfdf5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px">${item.topic}</span>
            <span style="font-size:20px;font-weight:800;color:${pp>=65?'#059669':pp>=40?'#d97706':'#ef4444'}">${pp}%</span>
          </div>
          <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:8px">
            <div style="width:${pp}%;background:#10b981"></div>
            <div style="width:${nep}%;background:#94a3b8"></div>
            <div style="width:${np}%;background:#f87171"></div>
          </div>
          <div style="font-size:10px;display:flex;gap:12px;margin-bottom:${item.suggestion||item.common_feedback?.length?'12px':'0'}">
            <span style="color:#059669">+${t.positive} positive</span>
            <span style="color:#64748b">${t.neutral} neutral</span>
            <span style="color:#ef4444">-${t.negative} negative</span>
          </div>
          ${item.common_feedback?.length > 0 ? `
            <div style="margin-bottom:${item.suggestion?'12px':'0'}">
              ${item.common_feedback.slice(0, 2).map((fb) => `
                <div style="background:#f8fafc;border-radius:8px;padding:8px 12px;font-size:11px;color:#475569;line-height:1.5;margin-bottom:4px">"${fb}"</div>
              `).join('')}
            </div>
          ` : ''}
          ${item.suggestion ? `
            <div style="background:#fffbeb;border:1px solid #fef3c7;border-left:3px solid #f59e0b;border-radius:8px;padding:12px">
              <div style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">AI Suggestion</div>
              <div style="font-size:12px;color:#92400e;line-height:1.5">${item.suggestion}</div>
            </div>
          ` : ''}
        </div>
      `
    }).join('')

    return `
      <div style="margin-bottom:32px">
        <div style="background:#f1f5f9;border-radius:8px;padding:6px 14px;display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#64748b;margin-bottom:16px">${group.course_name}</div>
        ${itemsHTML || '<p style="text-align:center;color:#94a3b8;font-size:12px;padding:16px">No open-ended responses for this course.</p>'}
      </div>
    `
  }).join('')

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${formTitle} — Analysis Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#1e293b}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:A4}.pb{page-break-after:always}}</style></head><body>
<div class="pb" style="height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:80px;background:linear-gradient(135deg,#0f3d27,#13462D,#1a5e3d);position:relative;overflow:hidden">
  <div style="position:absolute;top:-80px;right:-80px;width:350px;height:350px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>
  <div style="position:relative;z-index:1">
    <div style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;margin-bottom:48px">AI Feedback Analysis</div>
    <div style="font-size:50px;font-weight:900;color:white;letter-spacing:-2px;margin-bottom:8px">Think<span style="color:#34d399">Back</span></div>
    <div style="color:rgba(255,255,255,0.45);font-size:14px;margin-bottom:60px">Student Feedback Analysis System</div>
    <div style="font-size:32px;font-weight:700;color:white;max-width:560px;line-height:1.3;margin-bottom:56px">${formTitle}</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:14px"><span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:2px;width:90px">Generated</span><span style="color:rgba(255,255,255,0.8);font-size:14px">${date}</span></div>
      <div style="display:flex;gap:14px"><span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:2px;width:90px">Distributed</span><span style="color:rgba(255,255,255,0.8);font-size:14px">${formStats.distributed_count} students</span></div>
      <div style="display:flex;gap:14px"><span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:2px;width:90px">Responded</span><span style="color:rgba(255,255,255,0.8);font-size:14px">${formStats.response_count} (${responseRate}%)</span></div>
    </div>
  </div>
  <div style="position:absolute;bottom:36px;left:80px;right:80px;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:18px">
    <span style="color:rgba(255,255,255,0.3);font-size:11px">CONFIDENTIAL</span>
    <span style="color:rgba(255,255,255,0.3);font-size:11px">ThinkBack AI System</span>
  </div>
</div>
<div class="pb" style="padding:56px 60px">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #e2e8f0">
    <div style="width:32px;height:32px;border-radius:8px;background:#13462D;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">1</div>
    <div><div style="font-size:20px;font-weight:800">Summary</div><div style="font-size:13px;color:#94a3b8">Overall response and sentiment metrics</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px">
    ${[['Distributed',formStats.distributed_count,'#1e293b'],['Responded',formStats.response_count,'#1e293b'],['Pending',formStats.distributed_count-formStats.response_count,'#1e293b'],['Response Rate',responseRate+'%',responseRate>=70?'#059669':responseRate>=40?'#d97706':'#ef4444']].map(([l,v,c])=>`
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${l}</div>
      <div style="font-size:26px;font-weight:800;color:${c}">${v}</div>
    </div>`).join('')}
  </div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
    <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px">Overall Sentiment</div>
    ${[['Satisfied',posPct,'#10b981','#059669',overall.positive],['Mixed',neuPct,'#94a3b8','#64748b',overall.neutral],['Unsatisfied',negPct,'#f87171','#ef4444',overall.negative]].map(([label,pct,fill,txt,count])=>`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="font-size:13px;color:#475569;width:90px">${label}</div>
      <div style="flex:1;height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden"><div style="width:${pct}%;background:${fill};height:100%;border-radius:5px"></div></div>
      <div style="font-size:13px;font-weight:700;color:${txt};width:38px;text-align:right">${pct}%</div>
      <div style="font-size:12px;color:#94a3b8;width:24px">${count}</div>
    </div>`).join('')}
  </div>
</div>
<div style="padding:56px 60px">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #e2e8f0">
    <div style="width:32px;height:32px;border-radius:8px;background:#13462D;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">2</div>
    <div><div style="font-size:20px;font-weight:800">Topic Analysis</div><div style="font-size:13px;color:#94a3b8">AI-analysed sentiment per topic</div></div>
  </div>
  ${courseSections}
</div>
</body></html>`

  const win = window.open('', '_blank', 'width=960,height=760')
  if (!win) { toast.error('Pop-up blocked. Please allow pop-ups and try again.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); setTimeout(() => win.print(), 400) }
}

/* ─── Activity Log ───────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

function duration(startStr, endStr) {
  if (!startStr || !endStr) return null
  const secs = Math.floor((new Date(endStr) - new Date(startStr)) / 1000)
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`
}

const JOB_CFG = {
  queued:    { dot: 'bg-slate-300',   text: 'text-slate-500',   bg: 'bg-white',      label: 'Queued',    pulse: false },
  running:   { dot: 'bg-blue-400',    text: 'text-blue-600',    bg: 'bg-blue-50/50', label: 'Running…',  pulse: true  },
  completed: { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-white',      label: 'Completed', pulse: false },
  failed:    { dot: 'bg-red-400',     text: 'text-red-600',     bg: 'bg-red-50/50',  label: 'Failed',    pulse: false },
}

function ActivityLog({ formId, refreshTrigger }) {
  const [jobs,    setJobs]  = useState([])
  const [open,    setOpen]  = useState(false)
  const pollRef = useRef(null)

  const fetchJobs = () => {
    getAnalysisJobs(formId).then((d) => setJobs(Array.isArray(d) ? d : [])).catch(() => {})
  }

  useEffect(() => { if (formId) fetchJobs() }, [formId, refreshTrigger])

  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === 'running' || j.status === 'queued')
    if (hasActive && !pollRef.current) {
      pollRef.current = setInterval(fetchJobs, 4000)
    } else if (!hasActive && pollRef.current) {
      clearInterval(pollRef.current); pollRef.current = null
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [jobs])

  const activeJob = jobs.find((j) => j.status === 'running' || j.status === 'queued')

  return (
    <div className="mx-auto max-w-7xl">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:border-emerald-200 transition group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition">
            <FaChartBar className="text-slate-400 group-hover:text-emerald-600 text-xs transition" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Analysis Activity Log</span>
          {activeJob && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
              {activeJob.status === 'queued' ? 'Queued' : 'Running now'}
            </span>
          )}
          {!activeJob && jobs.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{jobs.length} run{jobs.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {jobs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">No analysis runs yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {jobs.map((job) => {
                const cfg = JOB_CFG[job.status] ?? JOB_CFG.queued
                const dur = duration(job.started_at, job.completed_at)
                return (
                  <div key={job.id} className={`flex items-center gap-4 px-5 py-3.5 ${cfg.bg}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          job.trigger_source === 'manual'
                            ? 'bg-violet-50 border-violet-100 text-violet-600'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>{job.trigger_source === 'manual' ? 'Manual' : 'Auto'}</span>
                        {job.response_count != null && <span className="text-[10px] text-slate-400">{job.response_count} responses</span>}
                        {dur && <span className="text-[10px] text-slate-400">· {dur}</span>}
                      </div>
                      {job.status === 'running' && (
                        <div className="mt-1.5 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full w-3/5 animate-pulse" />
                        </div>
                      )}
                      {job.status === 'failed' && job.error_message && (
                        <p className="mt-0.5 text-[11px] text-red-500">{job.error_message}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-slate-400">{timeAgo(job.triggered_at)}</p>
                      <p className="text-[10px] text-slate-300">{new Date(job.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function FeedbackAnalysisPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { formId, formTitle } = location.state ?? {}
  const authUser  = useCurrentUser()

  const [formStats,   setFormStats]   = useState({ distributed_count: 0, response_count: 0 })
  const [analysis,    setAnalysis]    = useState([])
  const [status,      setStatus]      = useState('loading')
  const [hasNewResps, setHasNewResps] = useState(false)
  const [jobRefresh,  setJobRefresh]  = useState(0)
  const [activeCourse, setActiveCourse] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!authUser) { navigate('/login'); return }
    if (!formId)   { navigate('/feedback-forms'); return }
  }, [authUser, formId, navigate])

  useEffect(() => {
    if (!formId) return
    getFeedbackForm(formId)
      .then((data) => setFormStats({ distributed_count: data.distributed_count ?? 0, response_count: data.response_count ?? 0 }))
      .catch(() => {})

    getAnalysis(formId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnalysis(data)
          setActiveCourse(data[0]?.course_name ?? null)
          setStatus('done')
          getFeedbackForm(formId).then((formData) => {
            const lastAnalysedAt = new Date(data[0]?.analyzed_at)
            const lastResponseAt = formData.last_response_at ? new Date(formData.last_response_at) : null
            if (lastResponseAt && lastResponseAt > lastAnalysedAt) setHasNewResps(true)
          }).catch(() => {})
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
      setJobRefresh((n) => n + 1)
      const triggeredAt = new Date()
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        try {
          const data = await getAnalysis(formId)
          const hasNew = Array.isArray(data) && data.some((r) => new Date(r.analyzed_at) > triggeredAt)
          if (hasNew) {
            setAnalysis(data)
            setActiveCourse(data[0]?.course_name ?? null)
            setStatus('done')
            setHasNewResps(false)
            clearInterval(pollRef.current)
            toast.success('Analysis complete!')
          } else if (attempts >= 24) {
            setStatus('timeout'); clearInterval(pollRef.current)
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
      ;(Array.isArray(group.results) ? group.results : []).forEach((item) => {
        acc.positive += item.sentiment_summary?.positive ?? 0
        acc.neutral  += item.sentiment_summary?.neutral  ?? 0
        acc.negative += item.sentiment_summary?.negative ?? 0
      })
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 },
  )

  const responseRate   = formStats.distributed_count > 0 ? Math.round((formStats.response_count / formStats.distributed_count) * 100) : 0
  const overallScore   = calcScore(overall.positive, overall.neutral, overall.negative)
  const overallCol     = scoreColor(overallScore)
  const sentTotal      = overall.positive + overall.neutral + overall.negative
  const activeGroup    = analysis.find((g) => g.course_name === activeCourse)

  if (!authUser) return null

  return (
    <DashboardLayout activeNav="feedback">

      {/* ── Hero ── */}
      <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-48 w-96 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-7xl flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <button type="button" onClick={() => navigate('/feedback-forms')}
              className="mt-1 flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 shrink-0">
              <FaArrowLeft className="text-[10px]" /> Back
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-0.5">AI Feedback Analysis</p>
              <h1 className="text-xl font-bold text-white leading-tight">{formTitle ?? 'Analysis'}</h1>
              {status === 'done' && overallScore !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    overallScore >= 65 ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' :
                    overallScore >= 40 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                                         'bg-red-400/20 text-red-300 border border-red-400/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                      overallScore >= 65 ? 'bg-emerald-400' : overallScore >= 40 ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    {overallScore}% satisfaction — {overallCol.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {status === 'done' && (
              <button type="button"
                onClick={() => openAnalysisPDF({ formTitle: formTitle ?? 'Analysis', formStats, analysis, overall, responseRate })}
                className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                <FaDownload className="text-xs" /> Export PDF
              </button>
            )}
            <button type="button" disabled={status === 'running'} onClick={handleAnalyse}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 disabled:opacity-60">
              {status === 'running'
                ? <><FaSync className="text-xs animate-spin" /> Analysing…</>
                : <><FaBrain className="text-xs" /> {analysis.length > 0 ? 'Re-run Analysis' : 'Run Analysis'}</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="mx-4 mt-3 md:mx-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Distributed',   value: formStats.distributed_count,                            Icon: FaUsers,       cls: 'bg-sky-50 text-sky-500',      border: 'border-sky-100'     },
          { label: 'Responded',     value: formStats.response_count,                               Icon: FaCheckCircle, cls: 'bg-emerald-50 text-emerald-500', border: 'border-emerald-100' },
          { label: 'Pending',       value: formStats.distributed_count - formStats.response_count, Icon: FaClock,       cls: 'bg-amber-50 text-amber-500',  border: 'border-amber-100'   },
          { label: 'Response Rate', value: `${responseRate}%`,                                     Icon: FaChartBar,    cls: 'bg-violet-50 text-violet-500',border: 'border-violet-100'  },
        ].map(({ label, value, Icon, cls, border }) => (
          <div key={label} className={`flex items-center gap-3 rounded-2xl border ${border} bg-white px-4 py-3.5 shadow-sm`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="text-sm" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4 md:px-6 space-y-5 pb-16">

        {/* ── Loading skeleton ── */}
        {status === 'loading' && <AnalysisSkeleton />}

        {/* ── New responses banner ── */}
        {hasNewResps && status === 'done' && (
          <div className="mx-auto max-w-7xl flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <span className="font-semibold">New responses received</span> since the last analysis — re-run to include them.
            </p>
            <button type="button" onClick={() => { setHasNewResps(false); handleAnalyse() }}
              className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-200 transition whitespace-nowrap">
              Re-run Now
            </button>
          </div>
        )}

        {/* ── Idle state ── */}
        {status === 'idle' && (
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                <FaBrain className="text-2xl text-slate-300" />
              </div>
              <p className="font-semibold text-slate-600 mb-1">No analysis yet</p>
              <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
                Click <span className="font-semibold text-[#13462D]">Run Analysis</span> to process student responses with AI.
              </p>
              <button type="button" onClick={handleAnalyse}
                className="inline-flex items-center gap-2 rounded-xl bg-[#13462D] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3d27] transition shadow-sm">
                <FaBrain className="text-xs" /> Run AI Analysis
              </button>
            </div>
          </div>
        )}

        {/* ── Running state ── */}
        {status === 'running' && (
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white py-20 text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <FaSync className="text-xl text-emerald-500 animate-spin" />
              </div>
              <p className="font-semibold text-emerald-800 mb-1">AI is analysing student responses</p>
              <p className="text-sm text-emerald-600 mb-8">This may take up to a minute. Please wait.</p>
              <div className="flex justify-center gap-6 text-xs text-emerald-600">
                {['Topic classification', 'Sentiment analysis', 'Generating suggestions'].map((step, i) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"
                      style={{ animationDelay: `${i * 0.3}s` }} />
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Error / Timeout ── */}
        {(status === 'error' || status === 'timeout') && (
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
            <p className="font-semibold text-red-700 mb-1">
              {status === 'timeout' ? 'Analysis is taking longer than expected' : 'Analysis failed'}
            </p>
            <p className="text-sm text-red-500 mb-5">
              {status === 'timeout' ? 'Try running again.' : 'Make sure the AI service is running on port 8001.'}
            </p>
            <button type="button" onClick={handleAnalyse}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">
              <FaSync className="text-xs" /> Retry
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {status === 'done' && analysis.length > 0 && (
          <div className="mx-auto max-w-7xl space-y-5">

            {/* Overview panel */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Overall Sentiment Overview</h2>
                <span className="text-xs text-slate-400">
                  Last analysed: {new Date(analysis[0]?.analyzed_at).toLocaleString()}
                </span>
              </div>
              <div className="p-6 flex flex-col sm:flex-row items-center gap-8">
                {/* Donut */}
                <DonutChart positive={overall.positive} neutral={overall.neutral} negative={overall.negative} size={152} />

                {/* Breakdown bars */}
                <div className="flex-1 space-y-4 w-full">
                  {sentTotal === 0 ? (
                    <p className="text-sm text-slate-400">No sentiment data available.</p>
                  ) : [
                    { label: 'Satisfied',   count: overall.positive, pct: Math.round((overall.positive / sentTotal) * 100), bar: 'bg-emerald-400', text: 'text-emerald-700' },
                    { label: 'Mixed',       count: overall.neutral,  pct: Math.round((overall.neutral  / sentTotal) * 100), bar: 'bg-slate-300',   text: 'text-slate-500' },
                    { label: 'Unsatisfied', count: overall.negative, pct: Math.round((overall.negative / sentTotal) * 100), bar: 'bg-red-400',     text: 'text-red-600'   },
                  ].map(({ label, count, pct, bar, text }) => (
                    <div key={label} className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 w-22 shrink-0">{label}</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-9 text-right shrink-0 ${text}`}>{pct}%</span>
                      <span className="text-sm text-slate-400 w-6 shrink-0">{count}</span>
                    </div>
                  ))}

                  {/* Response rate inline */}
                  <div className="pt-3 mt-1 border-t border-slate-100 flex items-center gap-4">
                    <span className="text-sm text-slate-500 w-22 shrink-0">Response Rate</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#13462D] rounded-full transition-all duration-700" style={{ width: `${responseRate}%` }} />
                    </div>
                    <span className={`text-sm font-bold w-9 text-right shrink-0 ${responseRate >= 70 ? 'text-emerald-700' : responseRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{responseRate}%</span>
                    <span className="text-xs text-slate-400 shrink-0">{formStats.response_count}/{formStats.distributed_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course tabs — only shown if multiple courses */}
            {analysis.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                {analysis.map((group) => {
                  const items = Array.isArray(group.results) ? group.results : []
                  const pos = items.reduce((s, i) => s + (i.sentiment_summary?.positive ?? 0), 0)
                  const neu = items.reduce((s, i) => s + (i.sentiment_summary?.neutral  ?? 0), 0)
                  const neg = items.reduce((s, i) => s + (i.sentiment_summary?.negative ?? 0), 0)
                  const sc  = calcScore(pos, neu, neg)
                  const col = scoreColor(sc)
                  const isActive = activeCourse === group.course_name
                  return (
                    <button key={group.course_name} type="button"
                      onClick={() => setActiveCourse(group.course_name)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                        isActive
                          ? 'bg-[#13462D] text-white border-[#13462D] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}>
                      {group.course_name.split('—')[0].trim()}
                      {sc !== null && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : `${col.bg} ${col.text}`
                        }`}>{sc}%</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Topic grid */}
            {activeGroup && (
              <div>
                {analysis.length === 1 && (
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">{activeGroup.course_name}</h3>
                )}

                {(!Array.isArray(activeGroup.results) || activeGroup.results.length === 0) && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                    <p className="text-sm text-slate-400">No open-ended responses found for this course.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(activeGroup.results) ? activeGroup.results : []).map((item) => (
                    <TopicCard
                      key={item.topic}
                      item={item}
                      formId={formId}
                      groupIdx={analysis.indexOf(activeGroup)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Activity Log ── */}
        {formId && <ActivityLog formId={formId} refreshTrigger={jobRefresh} />}

      </div>
    </DashboardLayout>
  )
}
