import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaDownload, FaChartBar, FaUsers, FaCheckCircle, FaClipboardList,
  FaSearch, FaExclamationTriangle, FaLightbulb, FaArrowRight,
  FaFire, FaThumbsUp, FaTrophy, FaBrain,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getFeedbackForms, getAnalysis } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function sentimentHealth(positive, total) {
  if (total === 0) return null
  const pct = (positive / total) * 100
  if (pct >= 65) return 'good'
  if (pct >= 40) return 'warning'
  return 'critical'
}

function aggregateFromRaw(rows) {
  const agg = { positive: 0, neutral: 0, negative: 0 }
  const topicCounts = {}
  const topicItems = []
  if (!Array.isArray(rows)) return { sentiment: agg, topTopic: null, topicCounts, topicItems }
  rows.forEach((group) => {
    const items = Array.isArray(group.results) ? group.results : []
    items.forEach((item) => {
      agg.positive += item.sentiment_summary?.positive ?? 0
      agg.neutral  += item.sentiment_summary?.neutral  ?? 0
      agg.negative += item.sentiment_summary?.negative ?? 0
      const key = item.topic ?? 'Unknown'
      topicCounts[key] = (topicCounts[key] ?? 0) + (item.feedback_count ?? 0)
      topicItems.push({ ...item, course_name: group.course_name })
    })
  })
  const topTopic = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a])[0] ?? null
  return { sentiment: agg, topTopic, topicCounts, topicItems }
}

/* ─── sub-components ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
      status === 'published' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
    }`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  )
}

function SentimentBar({ positive = 0, neutral = 0, negative = 0 }) {
  const total = positive + neutral + negative
  if (total === 0) return <span className="text-xs text-slate-400">No data</span>
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-24 overflow-hidden rounded-full gap-px">
        {positive > 0 && <div style={{ width: `${(positive / total) * 100}%` }} className="bg-emerald-400" />}
        {neutral  > 0 && <div style={{ width: `${(neutral  / total) * 100}%` }} className="bg-slate-300" />}
        {negative > 0 && <div style={{ width: `${(negative / total) * 100}%` }} className="bg-red-400" />}
      </div>
      <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((positive / total) * 100)}%</span>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
        active
          ? 'bg-[#13462D] text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

/* ─── PDF generation ──────────────────────────────────────────────────────── */
function buildPDFHtml({ forms, enrichedMap, user, overallSent, institutionName }) {
  const date  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const total = overallSent.positive + overallSent.neutral + overallSent.negative
  const posPct = total > 0 ? Math.round((overallSent.positive / total) * 100) : 0
  const neuPct = total > 0 ? Math.round((overallSent.neutral  / total) * 100) : 0
  const negPct = total > 0 ? Math.round((overallSent.negative / total) * 100) : 0

  const allTopics = {}
  Object.values(enrichedMap).forEach(({ topicCounts }) => {
    Object.entries(topicCounts ?? {}).forEach(([t, c]) => {
      allTopics[t] = (allTopics[t] ?? 0) + c
    })
  })
  const topTopics = Object.entries(allTopics).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxTopicCount = topTopics[0]?.[1] ?? 1

  const allSuggestions = []
  Object.entries(enrichedMap).forEach(([fid, { topicItems }]) => {
    const form = forms.find((f) => String(f.id) === String(fid))
    ;(topicItems ?? []).forEach((item) => {
      if (item.suggestion) allSuggestions.push({ formTitle: form?.title ?? '—', topic: item.topic, text: item.suggestion })
    })
  })

  const formsHTML = forms.map((f) => {
    const data   = enrichedMap[f.id] ?? {}
    const sent   = data.sentiment   ?? { positive: 0, neutral: 0, negative: 0 }
    const t      = sent.positive + sent.neutral + sent.negative
    const rate   = f.distributed_count > 0 ? Math.round((f.response_count / f.distributed_count) * 100) : 0
    const pp     = t > 0 ? Math.round((sent.positive / t) * 100) : 0
    const np     = t > 0 ? Math.round((sent.negative / t) * 100) : 0
    const nep    = t > 0 ? Math.round((sent.neutral  / t) * 100) : 0
    const health = sentimentHealth(sent.positive, t)
    const healthColor = health === 'good' ? '#059669' : health === 'warning' ? '#d97706' : health === 'critical' ? '#dc2626' : '#94a3b8'
    return `
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;page-break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div style="font-size:15px;font-weight:700;color:#1e293b;max-width:70%">${f.title}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="background:${f.status==='published'?'#ecfdf5':'#fef9c3'};color:${f.status==='published'?'#065f46':'#854d0e'};font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px">${f.status}</span>
            <span style="background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px">${f.form_type}</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
          <div style="background:#f8fafc;border-radius:8px;padding:8px 12px">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Distributed</div>
            <div style="font-size:14px;font-weight:700;color:#1e293b">${f.distributed_count ?? 0}</div>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:8px 12px">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Responded</div>
            <div style="font-size:14px;font-weight:700;color:#1e293b">${f.response_count ?? 0}</div>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:8px 12px">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Response Rate</div>
            <div style="font-size:14px;font-weight:700;color:${rate>=70?'#059669':rate>=40?'#d97706':'#ef4444'}">${rate}%</div>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:8px 12px">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Satisfaction</div>
            <div style="font-size:14px;font-weight:700;color:${healthColor}">${t > 0 ? pp + '%' : '—'}</div>
          </div>
        </div>
        ${t > 0 ? `
        <div>
          <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:6px">
            <div style="width:${pp}%;background:#10b981"></div>
            <div style="width:${nep}%;background:#94a3b8"></div>
            <div style="width:${np}%;background:#f87171"></div>
          </div>
          <div style="font-size:10px;color:#94a3b8;display:flex;gap:12px">
            <span style="color:#059669">● ${sent.positive} Satisfied</span>
            <span style="color:#64748b">● ${sent.neutral} Mixed</span>
            <span style="color:#ef4444">● ${sent.negative} Unsatisfied</span>
            ${data.topTopic ? `<span style="margin-left:auto">Top topic: <strong style="color:#13462D">${data.topTopic}</strong></span>` : ''}
          </div>
        </div>` : '<div style="font-size:12px;color:#94a3b8;font-style:italic">No AI analysis available for this form</div>'}
      </div>
    `
  }).join('')

  const topicsHTML = topTopics.map(([name, count], i) => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:#1e293b">${name}</span>
        <span style="font-size:12px;color:#94a3b8">${count} responses</span>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
        <div style="width:${(count/maxTopicCount)*100}%;background:${i<2?'#10b981':'#94a3b8'};height:100%;border-radius:4px"></div>
      </div>
    </div>
  `).join('')

  const suggestionsHTML = allSuggestions.slice(0, 12).map((s) => `
    <div style="border:1px solid #fef3c7;background:#fffbeb;border-radius:10px;padding:14px;margin-bottom:10px;page-break-inside:avoid">
      <div style="display:flex;gap:10px;margin-bottom:6px">
        <span style="background:#13462D;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px">${s.topic}</span>
        <span style="font-size:11px;color:#94a3b8">${s.formTitle}</span>
      </div>
      <div style="font-size:13px;color:#92400e;line-height:1.5">${s.text}</div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ThinkBack Feedback Report — ${date}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#fff; color:#1e293b; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { margin:0; size:A4; }
    .page-break { page-break-after:always; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div style="height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:80px;background:linear-gradient(135deg,#0f3d27 0%,#13462D 55%,#1a5e3d 100%);position:relative;overflow:hidden;" class="page-break">
  <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>
  <div style="position:absolute;bottom:-120px;left:200px;width:480px;height:480px;border-radius:50%;background:rgba(255,255,255,0.03)"></div>
  <div style="position:relative;z-index:1">
    <div style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">AI Feedback Intelligence Platform</div>
    ${institutionName ? `<div style="color:rgba(255,255,255,0.75);font-size:15px;font-weight:600;margin-bottom:28px">${institutionName}</div>` : '<div style="margin-bottom:28px"></div>'}
    <div style="font-size:56px;font-weight:900;color:white;letter-spacing:-2px;margin-bottom:6px">Think<span style="color:#34d399">Back</span></div>
    <div style="color:rgba(255,255,255,0.45);font-size:14px;margin-bottom:72px">Student Feedback Analysis System</div>
    <div style="font-size:38px;font-weight:700;color:white;line-height:1.2;margin-bottom:12px">Feedback Analysis Report</div>
    <div style="font-size:16px;color:rgba(255,255,255,0.55);margin-bottom:64px">Comprehensive AI-driven insights across all feedback forms</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:14px;align-items:center">
        <span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;width:90px">Generated</span>
        <span style="color:rgba(255,255,255,0.8);font-size:14px;font-weight:500">${date}</span>
      </div>
      <div style="display:flex;gap:14px;align-items:center">
        <span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;width:90px">Prepared by</span>
        <span style="color:rgba(255,255,255,0.8);font-size:14px;font-weight:500">${user?.full_name ?? 'ThinkBack System'}</span>
      </div>
      <div style="display:flex;gap:14px;align-items:center">
        <span style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;width:90px">Forms</span>
        <span style="color:rgba(255,255,255,0.8);font-size:14px;font-weight:500">${forms.length} forms included</span>
      </div>
    </div>
  </div>
  <div style="position:absolute;bottom:36px;left:80px;right:80px;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:18px">
    <span style="color:rgba(255,255,255,0.3);font-size:11px">CONFIDENTIAL — For Internal Use Only</span>
    <span style="color:rgba(255,255,255,0.3);font-size:11px">ThinkBack AI Feedback System</span>
  </div>
</div>

<!-- PAGE 1: EXECUTIVE SUMMARY -->
<div style="padding:56px 60px;" class="page-break">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:32px;padding-bottom:18px;border-bottom:2px solid #e2e8f0">
    <div style="width:34px;height:34px;border-radius:9px;background:#13462D;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0">1</div>
    <div>
      <div style="font-size:22px;font-weight:800;color:#1e293b">Executive Summary</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:2px">Key performance metrics and sentiment overview</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px">
    ${[
      ['Total Forms',     forms.length,                                   '#1e293b'],
      ['Total Responses', forms.reduce((s,f)=>s+(f.response_count??0),0), '#1e293b'],
      ['AI Analyzed',     Object.keys(enrichedMap).length,                '#13462D'],
      ['Satisfaction',    posPct + '%',                                   posPct>=65?'#059669':posPct>=40?'#d97706':'#ef4444'],
    ].map(([label, value, color]) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
        <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${label}</div>
        <div style="font-size:30px;font-weight:800;color:${color};margin-bottom:4px">${value}</div>
      </div>
    `).join('')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
      <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px">Overall Sentiment Distribution</div>
      ${[['Satisfied', posPct, '#10b981', '#059669'], ['Mixed', neuPct, '#94a3b8', '#64748b'], ['Unsatisfied', negPct, '#f87171', '#ef4444']].map(([label, pct, fill, txt]) => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="font-size:13px;color:#475569;width:90px">${label}</div>
          <div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
            <div style="width:${pct}%;background:${fill};height:100%;border-radius:4px"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:${txt};width:36px;text-align:right">${pct}%</div>
        </div>
      `).join('')}
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">
        Based on ${total} total sentiment classifications from AI analysis
      </div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
      <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:18px">Top Discussion Topics</div>
      ${topicsHTML || '<div style="font-size:13px;color:#94a3b8;font-style:italic;padding:8px 0">No analysis data available yet</div>'}
    </div>
  </div>
</div>

<!-- PAGE 2: PER-FORM ANALYSIS -->
<div style="padding:56px 60px;" class="page-break">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:32px;padding-bottom:18px;border-bottom:2px solid #e2e8f0">
    <div style="width:34px;height:34px;border-radius:9px;background:#13462D;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0">2</div>
    <div>
      <div style="font-size:22px;font-weight:800;color:#1e293b">Form-by-Form Analysis</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:2px">Detailed breakdown of each feedback form</div>
    </div>
  </div>
  ${formsHTML}
</div>

<!-- PAGE 3: AI SUGGESTIONS -->
${allSuggestions.length > 0 ? `
<div style="padding:56px 60px;">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:32px;padding-bottom:18px;border-bottom:2px solid #e2e8f0">
    <div style="width:34px;height:34px;border-radius:9px;background:#13462D;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0">3</div>
    <div>
      <div style="font-size:22px;font-weight:800;color:#1e293b">AI-Generated Suggestions</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:2px">Actionable recommendations from AI analysis of student feedback</div>
    </div>
  </div>
  ${suggestionsHTML}
  <div style="margin-top:32px;padding:20px;background:#f0fdf4;border:1px solid #a7f3d0;border-radius:12px">
    <div style="font-size:13px;font-weight:600;color:#065f46;margin-bottom:6px">About These Suggestions</div>
    <div style="font-size:12px;color:#047857;line-height:1.6">These suggestions were generated by ThinkBack's T5 AI model trained on student feedback patterns. Each suggestion is based on negative sentiment responses grouped by topic, providing actionable steps to improve the learning experience.</div>
  </div>
</div>
` : ''}

</body>
</html>`
}

function openPDF(forms, enrichedMap, user, overallSent) {
  const institutionName = forms[0]?.institution_name ?? ''
  const html = buildPDFHtml({ forms, enrichedMap, user, overallSent, institutionName })
  const win  = window.open('', '_blank', 'width=960,height=760')
  if (!win) { toast.error('Pop-up blocked. Please allow pop-ups and try again.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); setTimeout(() => win.print(), 400) }
}

/* ─── Overview Tab ────────────────────────────────────────────────────────── */
function OverviewTab({ forms, enrichedMap, overallSent, navigate }) {
  const total     = overallSent.positive + overallSent.neutral + overallSent.negative
  const posPct    = total > 0 ? Math.round((overallSent.positive / total) * 100) : 0
  const health    = sentimentHealth(overallSent.positive, total)

  const allTopics = useMemo(() => {
    const tc = {}
    Object.values(enrichedMap).forEach(({ topicCounts }) => {
      Object.entries(topicCounts ?? {}).forEach(([t, c]) => { tc[t] = (tc[t] ?? 0) + c })
    })
    return Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 7)
  }, [enrichedMap])

  const maxCount = allTopics[0]?.[1] ?? 1

  const sorted = [...forms].filter((f) => enrichedMap[f.id]?.sentiment)
  const best   = [...sorted].sort((a, b) => {
    const sa = enrichedMap[a.id].sentiment, sb = enrichedMap[b.id].sentiment
    const ta = sa.positive + sa.neutral + sa.negative, tb = sb.positive + sb.neutral + sb.negative
    return (ta > 0 ? sb.positive/tb : 0) - (ta > 0 ? sa.positive/ta : 0)
  }).reverse().slice(0, 3)
  const worst  = [...sorted].sort((a, b) => {
    const sa = enrichedMap[a.id].sentiment, sb = enrichedMap[b.id].sentiment
    const ta = sa.positive + sa.neutral + sa.negative, tb = sb.positive + sb.neutral + sb.negative
    return (tb > 0 ? sb.negative/tb : 0) - (ta > 0 ? sa.negative/ta : 0)
  }).reverse().slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Sentiment health + topic bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Health gauge */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-widest mb-5">Overall Sentiment Health</h3>
          {total === 0 ? (
            <p className="text-sm text-slate-400 py-4">No AI analysis data yet. Run analysis on a feedback form to see insights.</p>
          ) : (
            <>
              <div className="flex items-end gap-4 mb-6">
                <div className={`text-6xl font-black ${health === 'good' ? 'text-emerald-600' : health === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                  {posPct}%
                </div>
                <div className="mb-2">
                  <div className={`text-sm font-bold ${health === 'good' ? 'text-emerald-600' : health === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                    {health === 'good' ? 'Healthy' : health === 'warning' ? 'Needs Attention' : 'Critical'}
                  </div>
                  <div className="text-xs text-slate-400">satisfaction rate</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Satisfied',   count: overallSent.positive, pct: posPct, bar: 'bg-emerald-400', text: 'text-emerald-700' },
                  { label: 'Mixed',       count: overallSent.neutral,  pct: total > 0 ? Math.round((overallSent.neutral/total)*100) : 0, bar: 'bg-slate-300',   text: 'text-slate-500' },
                  { label: 'Unsatisfied', count: overallSent.negative, pct: total > 0 ? Math.round((overallSent.negative/total)*100) : 0, bar: 'bg-red-400',     text: 'text-red-600' },
                ].map(({ label, count, pct, bar, text }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">{label}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${text}`}>{pct}%</span>
                    <span className="text-xs text-slate-400 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top topics */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-widest mb-5">Top Discussion Topics</h3>
          {allTopics.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">Run AI analysis on forms to discover feedback topics.</p>
          ) : (
            <div className="space-y-3">
              {allTopics.map(([topic, count], i) => (
                <div key={topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-semibold ${i < 2 ? 'text-[#13462D]' : 'text-slate-600'}`}>{topic}</span>
                    <span className="text-slate-400">{count} responses</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${i < 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sentiment trend across forms */}
      {forms.some((f) => enrichedMap[f.id]?.sentiment) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-widest mb-5">Sentiment Trend — All Forms</h3>
          <div className="flex items-end gap-2 overflow-x-auto pb-2">
            {forms.filter((f) => enrichedMap[f.id]?.sentiment).map((f) => {
              const s = enrichedMap[f.id].sentiment
              const t = s.positive + s.neutral + s.negative
              if (t === 0) return null
              const pp = Math.round((s.positive / t) * 100)
              const np = Math.round((s.neutral  / t) * 100)
              return (
                <div key={f.id} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                  <div className="w-10 flex flex-col-reverse overflow-hidden rounded-lg" style={{ height: 80 }}>
                    <div className="bg-emerald-400 w-full flex-shrink-0" style={{ height: `${pp}%` }} />
                    <div className="bg-slate-200 w-full flex-shrink-0" style={{ height: `${np}%` }} />
                    <div className="bg-red-400 w-full flex-shrink-0" style={{ height: `${100 - pp - np}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 text-center leading-tight max-w-[60px] truncate">{f.title}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Satisfied</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />Mixed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Unsatisfied</span>
          </div>
        </div>
      )}

      {/* Best & Worst */}
      {(best.length > 0 || worst.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {best.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaTrophy className="text-emerald-500 text-sm" />
                <h3 className="text-sm font-semibold text-emerald-700">Top Performing Forms</h3>
              </div>
              <div className="space-y-3">
                {best.map((f) => {
                  const s = enrichedMap[f.id].sentiment
                  const t = s.positive + s.neutral + s.negative
                  const pct = t > 0 ? Math.round((s.positive / t) * 100) : 0
                  return (
                    <div key={f.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate max-w-[200px]">{f.title}</span>
                      <span className="text-sm font-bold text-emerald-600">{pct}% satisfied</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {worst.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-red-500 text-sm" />
                <h3 className="text-sm font-semibold text-red-700">Forms Needing Attention</h3>
              </div>
              <div className="space-y-3">
                {worst.map((f) => {
                  const s = enrichedMap[f.id].sentiment
                  const t = s.positive + s.neutral + s.negative
                  const pct = t > 0 ? Math.round((s.negative / t) * 100) : 0
                  return (
                    <div key={f.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate max-w-[200px]">{f.title}</span>
                      <button
                        type="button"
                        onClick={() => navigate('/feedback-analysis', { state: { formId: f.id, formTitle: f.title } })}
                        className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        {pct}% negative <FaArrowRight className="text-[9px]" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Forms Tab ───────────────────────────────────────────────────────────── */
function FormsTab({ enriched, navigate, search, setSearch }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
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
        {search && <button type="button" onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>}
        <span className="text-xs text-slate-400">{enriched.length} form{enriched.length !== 1 ? 's' : ''}</span>
      </div>
      {enriched.length === 0 ? (
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
                const sent = f.sentiment ?? { positive: 0, neutral: 0, negative: 0 }
                const rate = f.distributed_count > 0 ? Math.round((f.response_count / f.distributed_count) * 100) : 0
                return (
                  <tr key={f.id} className="border-b border-[#e3ece6] text-slate-700 hover:bg-[#f6fbf8] transition">
                    <td className="px-5 py-4 font-semibold text-[#124f2f] max-w-[200px] truncate">{f.title}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-50 border-slate-200 text-slate-600">{f.form_type}</span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={f.status} /></td>
                    <td className="px-5 py-4 text-slate-600">{f.distributed_count ?? 0}</td>
                    <td className="px-5 py-4 font-semibold text-[#13462D]">{f.response_count ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold text-sm ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{rate}%</span>
                    </td>
                    <td className="px-5 py-4 min-w-[140px]"><SentimentBar {...sent} /></td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-[160px] truncate">{f.topTopic ?? '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => navigate('/feedback-analysis', { state: { formId: f.id, formTitle: f.title } })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <FaChartBar className="text-[10px]" /> Analysis
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
  )
}

/* ─── AI Insights Tab ─────────────────────────────────────────────────────── */
function AIInsightsTab({ forms, enrichedMap, navigate }) {
  const allSuggestions = useMemo(() => {
    const list = []
    Object.entries(enrichedMap).forEach(([fid, { topicItems }]) => {
      const form = forms.find((f) => String(f.id) === String(fid))
      ;(topicItems ?? []).forEach((item) => {
        if (item.suggestion) {
          list.push({ formId: fid, formTitle: form?.title ?? '—', topic: item.topic, text: item.suggestion, negative: item.sentiment_summary?.negative ?? 0 })
        }
      })
    })
    return list.sort((a, b) => b.negative - a.negative)
  }, [forms, enrichedMap])

  const alertForms = forms.filter((f) => {
    const s = enrichedMap[f.id]?.sentiment
    if (!s) return false
    const t = s.positive + s.neutral + s.negative
    return t > 0 && s.negative / t > 0.4
  })

  if (Object.keys(enrichedMap).length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <FaBrain className="mx-auto mb-4 text-5xl text-slate-200" />
        <p className="font-semibold text-slate-500 mb-1">No AI insights yet</p>
        <p className="text-sm text-slate-400 mb-6">Run analysis on feedback forms to see AI-powered insights here.</p>
        <button type="button" onClick={() => navigate('/feedback-forms')} className="inline-flex items-center gap-2 rounded-xl bg-[#13462D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3d27] transition">
          <FaArrowRight className="text-xs" /> Go to Feedback Forms
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Alert: forms needing attention */}
      {alertForms.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-red-500" />
            <span className="font-semibold text-red-700">Forms Requiring Immediate Attention</span>
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{alertForms.length} form{alertForms.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {alertForms.map((f) => {
              const s = enrichedMap[f.id].sentiment
              const t = s.positive + s.neutral + s.negative
              const negPct = t > 0 ? Math.round((s.negative / t) * 100) : 0
              return (
                <div key={f.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-red-100">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">{f.title}</span>
                    <span className="ml-2 text-xs text-red-500">{negPct}% negative sentiment</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/feedback-analysis', { state: { formId: f.id, formTitle: f.title } })}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    View Analysis <FaArrowRight className="text-[9px]" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {allSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaLightbulb className="text-amber-500" />
            <h3 className="font-semibold text-slate-700">AI-Generated Improvement Suggestions</h3>
            <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold border border-amber-100">{allSuggestions.length} suggestions</span>
          </div>
          <div className="space-y-3">
            {allSuggestions.map((s, i) => (
              <div key={i} className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-white bg-[#13462D] px-2.5 py-0.5 rounded-full">{s.topic}</span>
                  <span className="text-xs text-slate-400">{s.formTitle}</span>
                  {s.negative > 0 && <span className="ml-auto text-[10px] text-red-500 font-semibold">{s.negative} negative responses</span>}
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {allSuggestions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <FaThumbsUp className="mx-auto mb-3 text-4xl text-emerald-300" />
          <p className="font-semibold text-slate-600">No negative feedback to report</p>
          <p className="text-sm text-slate-400 mt-1">All analyzed forms have predominantly positive or mixed sentiment.</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const navigate = useNavigate()
  const user     = useCurrentUser()
  const [forms,       setForms]       = useState([])
  const [rawAnalysis, setRawAnalysis] = useState({})  // { [formId]: rawRows }
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState('overview')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(user.role)) { navigate('/'); return }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    getFeedbackForms()
      .then(async (data) => {
        const list      = Array.isArray(data) ? data : []
        setForms(list)
        const published = list.filter((f) => f.status === 'published')
        const results   = await Promise.allSettled(published.map((f) => getAnalysis(f.id)))
        const map = {}
        published.forEach((f, i) => {
          if (results[i].status === 'fulfilled') {
            const rows = results[i].value
            if (Array.isArray(rows) && rows.length) map[f.id] = rows
          }
        })
        setRawAnalysis(map)
      })
      .catch(() => toast.error('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [user])

  const enrichedMap = useMemo(() => {
    const out = {}
    Object.entries(rawAnalysis).forEach(([fid, rows]) => {
      out[fid] = aggregateFromRaw(rows)
    })
    return out
  }, [rawAnalysis])

  const overallSent = useMemo(() => Object.values(enrichedMap).reduce(
    (acc, { sentiment: s }) => ({ positive: acc.positive + s.positive, neutral: acc.neutral + s.neutral, negative: acc.negative + s.negative }),
    { positive: 0, neutral: 0, negative: 0 },
  ), [enrichedMap])

  const sentTotal  = overallSent.positive + overallSent.neutral + overallSent.negative
  const health     = sentimentHealth(overallSent.positive, sentTotal)

  const filtered   = useMemo(() => {
    const q = search.toLowerCase()
    return forms.filter((f) => f.title.toLowerCase().includes(q) || f.form_type.toLowerCase().includes(q) || f.status.toLowerCase().includes(q))
  }, [forms, search])

  const enriched   = useMemo(() => filtered.map((f) => ({
    ...f,
    ...(enrichedMap[f.id] ? { sentiment: enrichedMap[f.id].sentiment, topTopic: enrichedMap[f.id].topTopic } : {}),
  })), [filtered, enrichedMap])

  const stats = useMemo(() => ({
    total:     forms.length,
    published: forms.filter((f) => f.status === 'published').length,
    responses: forms.reduce((s, f) => s + (f.response_count ?? 0), 0),
    analyzed:  Object.keys(enrichedMap).length,
  }), [forms, enrichedMap])

  if (!user) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading…</div>

  return (
    <DashboardLayout activeNav="reports">

      {/* ── Hero ── */}
      <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Analytics & Reports</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Reports</h1>
              <p className="mt-1 text-sm text-white/55 max-w-md">AI-powered feedback analysis and insights across all forms.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { icon: FaClipboardList, label: 'Total Forms',     value: stats.total     },
                  { icon: FaCheckCircle,   label: 'Published',       value: stats.published  },
                  { icon: FaUsers,         label: 'Total Responses', value: stats.responses  },
                  { icon: FaBrain,         label: 'AI Analysed',     value: stats.analyzed  },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <p.icon className="text-sm text-white/90" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-none text-white">{loading ? '—' : p.value}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-white/60">{p.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => openPDF(forms, enrichedMap, user, overallSent)}
              disabled={forms.length === 0 || loading}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 disabled:opacity-50 lg:self-auto"
            >
              <FaDownload className="text-xs" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Alert Banner ── */}
      {!loading && health === 'critical' && sentTotal > 0 && (
        <div className="mx-4 mt-4 md:mx-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
          <FaFire className="text-red-500 shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-red-700">High dissatisfaction detected</span>
            <span className="text-sm text-red-500 ml-2">— less than 40% positive sentiment across analyzed forms.</span>
          </div>
          <button type="button" onClick={() => setActiveTab('insights')} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 whitespace-nowrap">
            View AI Insights <FaArrowRight className="text-[9px]" />
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="px-4 pt-4 md:px-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <TabButton active={activeTab === 'overview'}  onClick={() => setActiveTab('overview')}>Overview</TabButton>
          <TabButton active={activeTab === 'forms'}     onClick={() => setActiveTab('forms')}>All Forms</TabButton>
          <TabButton active={activeTab === 'insights'}  onClick={() => setActiveTab('insights')}>
            AI Insights
            {!loading && Object.keys(enrichedMap).length > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                {Object.keys(enrichedMap).length}
              </span>
            )}
          </TabButton>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="px-4 py-4 md:px-6 md:py-5 pb-16">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading reports…</div>
          ) : (
            <>
              {activeTab === 'overview'  && <OverviewTab forms={forms} enrichedMap={enrichedMap} overallSent={overallSent} navigate={navigate} />}
              {activeTab === 'forms'     && <FormsTab enriched={enriched} navigate={navigate} search={search} setSearch={setSearch} />}
              {activeTab === 'insights'  && <AIInsightsTab forms={forms} enrichedMap={enrichedMap} navigate={navigate} />}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
