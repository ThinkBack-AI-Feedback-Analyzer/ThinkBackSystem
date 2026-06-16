import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa'
import { getFormByToken, submitFormResponse } from '../../services/feedback'
import institutionLogo from '../../assets/Logo_4.png'

/* ── Draft helpers ─────────────────────────────────────────────────────────── */
function getDraftKey(t) { return `thinkback_draft_${t}` }
function loadDraft(t)   { try { return JSON.parse(localStorage.getItem(getDraftKey(t)) ?? 'null') } catch { return null } }
function saveDraft(t,a) { try { localStorage.setItem(getDraftKey(t), JSON.stringify(a)) } catch {} }
function clearDraft(t)  { try { localStorage.removeItem(getDraftKey(t)) } catch {} }

/* ── Star Rating ───────────────────────────────────────────────────────────── */
function StarRating({ options, value, onChange }) {
  const [hover, setHover] = useState(null)
  const active = hover ?? value
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {options.map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(star)}
          className="text-3xl transition-all duration-100 hover:scale-110 focus:outline-none"
          aria-label={`${star} star`}
        >
          {active >= star
            ? <FaStar className="text-amber-400" />
            : <FaRegStar className="text-slate-300" />}
        </button>
      ))}
      {value != null && (
        <span className="ml-3 text-sm font-semibold text-amber-600">
          {value} / {options[options.length - 1]}
        </span>
      )}
    </div>
  )
}

/* ── Question Card ─────────────────────────────────────────────────────────── */
function QuestionCard({ question: q, index, answer, onChange }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
      {/* Question text */}
      <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-1">
        <span className="text-slate-400 mr-1">{index + 1}.</span>
        {q.text}
        <span className="ml-1 text-red-400">*</span>
      </p>

      {/* Answer inputs */}
      <div className="mt-4">

        {q.question_type === 'open_ended' && (
          <textarea
            rows={3}
            value={answer ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your answer here…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-0 resize-none transition-colors"
          />
        )}

        {(q.question_type === 'multiple_choice' || q.question_type === 'yes_no') && (
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answer === opt
              return (
                <label key={oi} className={`flex items-center gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-colors hover:bg-slate-50 hover:border-slate-300 ${selected ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'}`}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={selected}
                    onChange={() => onChange(opt)}
                    className="accent-[#13462D] h-4 w-4 shrink-0"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              )
            })}
          </div>
        )}

        {q.question_type === 'rating' && (
          <StarRating options={q.options} value={answer} onChange={onChange} />
        )}
      </div>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function FeedbackRespondPage() {
  const [searchParams] = useSearchParams()
  const token          = searchParams.get('token')

  const [form,            setForm]           = useState(null)
  const [studentName,     setStudentName]    = useState('')
  const [closeDate,       setCloseDate]      = useState(null)
  const [institutionName, setInstitutionName] = useState('')
  const [courseName,      setCourseName]     = useState(null)
  const [answers,         setAnswers]        = useState({})
  const [status,          setStatus]         = useState('loading')
  const [errorMsg,        setErrorMsg]       = useState('')
  const [hasDraft,        setHasDraft]       = useState(false)
  const [draftSaved,      setDraftSaved]     = useState(false)
  const draftTimer = useRef(null)

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('No token provided.'); return }
    getFormByToken(token)
      .then((data) => {
        setForm(data)
        setStudentName(data.student_name ?? '')
        setCloseDate(data.close_date ?? null)
        setInstitutionName(data.institution_name ?? '')
        setCourseName(data.course_name ?? null)

        const initial = {}
        data.questions.forEach((q) => { initial[q.id] = q.question_type === 'rating' ? null : '' })

        const draft = loadDraft(token)
        if (draft) { setAnswers({ ...initial, ...draft }); setHasDraft(true) }
        else        setAnswers(initial)

        setStatus('ready')
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.detail ?? 'Invalid or expired link.')
        setStatus('error')
      })
  }, [token])

  const setAnswer = (qId, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: value }
      clearTimeout(draftTimer.current)
      draftTimer.current = setTimeout(() => {
        saveDraft(token, next)
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }, 600)
      return next
    })
  }

  const handleSubmit = async () => {
    const answersPayload = form.questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] != null ? String(answers[q.id]) : '',
    }))
    setStatus('submitting')
    try {
      await submitFormResponse(token, { answers: answersPayload })
      clearDraft(token)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail ?? 'Submission failed. Please try again.')
      setStatus('error')
    }
  }

  const totalQ    = form?.questions?.length ?? 0
  const answeredQ = form?.questions?.filter((q) => { const a = answers[q.id]; return a !== '' && a !== null && a !== undefined }).length ?? 0
  const progressPct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0

  /* ── States ── */
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#4285f4] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading your feedback form…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f9] px-4">
        <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 shadow-sm p-10 text-center">
          <img src={institutionLogo} alt="ThinkBack" className="h-8 mx-auto mb-6 opacity-50" />
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl font-bold">!</span>
          </div>
          <h1 className="text-base font-semibold text-slate-800 mb-2">Link Unavailable</h1>
          <p className="text-sm text-slate-500">{errorMsg}</p>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f9] px-4">
        <div className="max-w-md w-full text-center">
          <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-10">
            <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-5" />
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Response Recorded</h1>
            <p className="text-sm text-slate-500 mb-1">Your response to <span className="font-medium text-slate-700">{form?.title}</span> has been submitted.</p>
            {courseName && <p className="text-xs text-slate-400 mt-1">{courseName}</p>}
            <p className="text-xs text-slate-400 mt-4">You may close this tab.</p>
          </div>
          <img src={institutionLogo} alt="ThinkBack" className="h-6 mx-auto mt-6 opacity-30" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">

      {/* ── Top progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-slate-200">
        <div
          className="h-full bg-[#4285f4] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Top nav ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={institutionLogo} alt="ThinkBack" className="h-7 opacity-80" />
            {institutionName && (
              <span className="text-sm text-slate-500 hidden sm:block">{institutionName}</span>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium">{answeredQ}/{totalQ} answered</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 pb-24 space-y-3">

        {/* ── Title card ── */}
        <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Colored top accent — like Google Forms */}
          <div className="h-2 bg-[#13462D]" />
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-1">{form.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {institutionName && (
                <span className="text-xs text-slate-500">{institutionName}</span>
              )}
              {courseName && (
                <span className="text-xs font-medium text-[#13462D] bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                  {courseName}
                </span>
              )}
              <span className="text-xs text-slate-400">{form.form_type} form</span>
            </div>

            {/* Divider */}
            <hr className="my-4 border-slate-100" />

            {/* Greeting */}
            {studentName && (
              <p className="text-sm text-slate-700 mb-1">Hello, <span className="font-medium">{studentName}</span></p>
            )}

            {/* Close date */}
            {closeDate && new Date(closeDate) > new Date() && (
              <p className="mt-2 text-xs text-amber-600">
                Closes {new Date(closeDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            <p className="mt-4 text-xs text-red-500">* Required</p>
          </div>
        </div>

        {/* ── Draft restored banner ── */}
        {hasDraft && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-blue-700 font-medium">Your previous answers were restored.</p>
            <button
              type="button"
              className="text-xs text-blue-500 hover:text-blue-700 font-semibold ml-4 shrink-0"
              onClick={() => {
                const initial = {}
                form.questions.forEach((q) => { initial[q.id] = q.question_type === 'rating' ? null : '' })
                setAnswers(initial)
                clearDraft(token)
                setHasDraft(false)
              }}
            >
              Start fresh
            </button>
          </div>
        )}

        {/* ── Questions ── */}
        {form.questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            answer={answers[q.id]}
            onChange={(val) => setAnswer(q.id, val)}
          />
        ))}

        {/* ── Submit row ── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={status === 'submitting' || answeredQ === 0}
            onClick={handleSubmit}
            className="rounded-md bg-[#13462D] px-8 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting'
              ? <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />Submitting…</span>
              : 'Submit'}
          </button>

          <div className="flex items-center gap-3">
            {draftSaved && <span className="text-xs text-emerald-600 font-medium">Draft saved</span>}
            {answeredQ < totalQ && (
              <span className="text-xs text-slate-400">{totalQ - answeredQ} question{totalQ - answeredQ !== 1 ? 's' : ''} remaining</span>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pt-4 pb-2 flex items-center justify-center gap-2 border-t border-slate-200">
          <img src={institutionLogo} alt="ThinkBack" className="h-5 opacity-30" />
          <span className="text-[11px] text-slate-400">Powered by ThinkBack</span>
        </div>

      </div>
    </div>
  )
}
