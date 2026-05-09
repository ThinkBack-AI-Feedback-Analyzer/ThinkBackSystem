import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa'
import { getFormByToken, submitFormResponse } from '../../services/feedback'
import institutionLogo from '../../assets/Logo_4.png'

export default function FeedbackRespondPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form,        setForm]        = useState(null)
  const [studentName, setStudentName] = useState('')
  const [answers,     setAnswers]     = useState({})
  const [status,      setStatus]      = useState('loading') // loading | ready | submitting | done | error
  const [errorMsg,    setErrorMsg]    = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('No token provided.'); return }
    getFormByToken(token)
      .then((data) => {
        setForm(data)
        setStudentName(data.student_name ?? '')
        const initial = {}
        data.questions.forEach((q) => { initial[q.id] = q.question_type === 'rating' ? null : '' })
        setAnswers(initial)
        setStatus('ready')
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail ?? 'Invalid or expired link.'
        setErrorMsg(msg)
        setStatus('error')
      })
  }, [token])

  const setAnswer = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }))

  const handleSubmit = async () => {
    const answersPayload = form.questions.map((q) => ({
      question_id: q.id,
      answer:      answers[q.id] != null ? String(answers[q.id]) : '',
    }))

    setStatus('submitting')
    try {
      await submitFormResponse(token, { answers: answersPayload })
      setStatus('done')
    } catch (err) {
      const msg = err?.response?.data?.detail ?? 'Submission failed. Please try again.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading your feedback form…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-100 shadow-sm p-10 text-center">
          <img src={institutionLogo} alt="ThinkBack" className="h-10 mx-auto mb-6 opacity-70" />
          <h1 className="text-lg font-bold text-slate-800 mb-2">Link Unavailable</h1>
          <p className="text-sm text-slate-500">{errorMsg}</p>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-100 shadow-sm p-10 text-center">
          <img src={institutionLogo} alt="ThinkBack" className="h-10 mx-auto mb-6" />
          <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h1>
          <p className="text-sm text-slate-500">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-[#13462D] px-6 py-5">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <img src={institutionLogo} alt="ThinkBack" className="h-8 brightness-0 invert opacity-90" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Feedback Form</p>
            <h1 className="text-lg font-bold text-white">{form.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {/* Greeting */}
        {studentName && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-6 py-4">
            <p className="text-sm text-emerald-700 font-medium">Hello, {studentName} 👋</p>
            <p className="text-xs text-emerald-600 mt-0.5">Please answer all questions honestly — your responses are anonymous.</p>
          </div>
        )}

        {/* Questions */}
        {form.questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <p className="mb-4 font-semibold text-slate-800 text-sm">
              <span className="mr-2 rounded-lg bg-[#13462D]/10 px-2 py-0.5 text-xs font-bold text-[#13462D]">{idx + 1}</span>
              {q.text}
            </p>

            {q.question_type === 'open_ended' && (
              <textarea
                rows={3}
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Your answer…"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
              />
            )}

            {(q.question_type === 'multiple_choice' || q.question_type === 'yes_no') && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${answers[q.id] === opt ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'rating' && (
              <div className="flex gap-2">
                {q.options.map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setAnswer(q.id, star)}
                    className="text-3xl transition hover:scale-110"
                  >
                    {answers[q.id] >= star
                      ? <FaStar className="text-amber-400" />
                      : <FaRegStar className="text-slate-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Submit */}
        <button
          type="button"
          disabled={status === 'submitting'}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-[#13462D] py-4 text-sm font-bold text-white shadow transition hover:bg-[#0f3a26] disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  )
}
