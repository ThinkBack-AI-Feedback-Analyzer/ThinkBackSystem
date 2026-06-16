import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaEye, FaEdit, FaSave, FaGlobe,
  FaPlus, FaTrash, FaStar, FaRegStar, FaPaperPlane, FaTimes,
  FaChartBar, FaUsers, FaCheckCircle, FaClock,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { getFeedbackForm, createFeedbackForm, updateFeedbackForm, distributeForm } from '../../services/feedback'
import { useCurrentUser } from '../../hooks/useSidebarNav'
import { getCourses } from '../../services/courses'

const TYPE_OPTIONS = ['Exam', 'Lab', 'Course', 'Custom']
const Q_TYPES      = ['open_ended', 'multiple_choice', 'yes_no', 'rating']
const Q_LABEL      = { open_ended: 'Open Ended', multiple_choice: 'Multiple Choice', yes_no: 'Yes / No', rating: 'Rating' }

const TEMPLATES = {
  Exam:   ['Was the exam difficulty appropriate?', 'Were the exam instructions clear?', 'Did the exam cover the syllabus properly?', 'Was enough time given?'],
  Lab:    ['Were lab sessions helpful for understanding concepts?', 'Were the lab instructions clear?', 'Was lab equipment adequate?', 'How can lab sessions be improved?'],
  Course: ['How would you rate the overall course?', 'Was the course content well organized?', 'Was the lecturer clear in teaching?', 'What improvements would you suggest?'],
  Custom: [],
}

function makeQuestion(text = '', type = 'open_ended', options = []) {
  return { text, question_type: type, options, order: 0 }
}

export default function FormCreatePage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { mode = 'create', formId } = location.state ?? {}

  const authUser = useCurrentUser()
  const authState = { user: authUser }

  const [title,        setTitle]        = useState('')
  const [formType,     setFormType]     = useState('Exam')
  const [closeDate,    setCloseDate]    = useState('')
  const [questions,    setQuestions]    = useState([])
  const [previewMode,  setPreviewMode]  = useState(false)
  const [answers,      setAnswers]      = useState({})
  const [isSaving,     setIsSaving]     = useState(false)
  const [isLoading,    setIsLoading]    = useState(mode !== 'create')
  const [formStats,    setFormStats]    = useState({ distributed_count: 0, response_count: 0 })

  // Distribution modal
  const [distributeModal,   setDistributeModal]   = useState(false)
  const [publishedFormId,   setPublishedFormId]   = useState(null)
  const [courses,           setCourses]           = useState([])
  const [selectedCourses,   setSelectedCourses]   = useState([])
  const [distributeAll,     setDistributeAll]     = useState(false)
  const [isDistributing,    setIsDistributing]    = useState(false)

  // Editable template questions
  const [editableTemplates, setEditableTemplates] = useState([...TEMPLATES['Exam']])
  const [newTemplateQ,      setNewTemplateQ]      = useState('')

  // Custom question builder state
  const [customText,    setCustomText]    = useState('')
  const [customType,    setCustomType]    = useState('open_ended')
  const [customOptions, setCustomOptions] = useState([''])
  const [starCount,     setStarCount]     = useState(5)

  const isReadOnly = mode === 'view'

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(authState.user.role)) navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    if (!formId || mode === 'create') return
    setIsLoading(true)
    getFeedbackForm(formId)
      .then((data) => {
        setTitle(data.title)
        setFormType(data.form_type)
        setCloseDate(data.close_date ? data.close_date.slice(0, 16) : '')
        setQuestions(data.questions ?? [])
        setFormStats({ distributed_count: data.distributed_count ?? 0, response_count: data.response_count ?? 0 })
      })
      .catch(() => toast.error('Failed to load form.'))
      .finally(() => setIsLoading(false))
  }, [formId, mode])


  // Reset editable templates when form type changes (only for new forms)
  useEffect(() => {
    if (mode === 'create') setEditableTemplates([...(TEMPLATES[formType] ?? [])])
  }, [formType, mode])

  // ── Template management ──
  const updateTemplateQ  = (idx, value) => setEditableTemplates((prev) => prev.map((q, i) => i === idx ? value : q))
  const removeTemplateQ  = (idx)        => setEditableTemplates((prev) => prev.filter((_, i) => i !== idx))
  const addToTemplate    = () => {
    if (!newTemplateQ.trim()) return
    setEditableTemplates((prev) => [...prev, newTemplateQ.trim()])
    setNewTemplateQ('')
  }
  const loadTemplate = () => {
    if (editableTemplates.length === 0) return
    const newQs = editableTemplates.map((text) => makeQuestion(text, 'open_ended'))
    setQuestions((prev) => [...prev, ...newQs])
    toast.success(`${editableTemplates.length} questions added to form.`)
  }

  // ── Custom question ──
  const addCustomQuestion = () => {
    if (!customText.trim()) return
    const opts =
      customType === 'multiple_choice' ? customOptions.filter(Boolean)
      : customType === 'yes_no'        ? ['Yes', 'No']
      : customType === 'rating'        ? Array.from({ length: starCount }, (_, i) => i + 1)
      : []
    setQuestions((prev) => [...prev, makeQuestion(customText.trim(), customType, opts)])
    setCustomText('')
    setCustomOptions([''])
  }

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const addOptionToQuestion = (qIdx) => {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q))
  }

  const updateOptionInQuestion = (qIdx, oIdx, value) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q
      const opts = [...q.options]
      opts[oIdx] = value
      return { ...q, options: opts }
    }))
  }

  const removeOptionFromQuestion = (qIdx, oIdx) => {
    setQuestions((prev) => prev.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.filter((_, oi) => oi !== oIdx) } : q
    ))
  }

  // ── Save ──
  const save = async (status) => {
    if (!title.trim()) { toast.error('Please enter a form title.'); return }
    if (questions.length === 0) { toast.error('Please add at least one question.'); return }

    setIsSaving(true)
    const payload = {
      title:        title.trim(),
      form_type:    formType,
      status,
      close_date:   closeDate || null,
      questions:    questions.map((q, i) => ({ ...q, order: i })),
    }

    try {
      let savedForm
      if (formId && mode === 'edit') {
        savedForm = await updateFeedbackForm(formId, payload)
        toast.success('Form updated successfully.')
      } else {
        savedForm = await createFeedbackForm(payload)
        toast.success(status === 'published' ? 'Form published!' : 'Draft saved.')
      }

      if (status === 'published') {
        setPublishedFormId(savedForm.id)
        getCourses().then((data) => setCourses(Array.isArray(data) ? data : [])).catch(() => setCourses([]))
        setSelectedCourses([])
        setDistributeAll(false)
        setDistributeModal(true)
      } else {
        navigate('/feedback-forms')
      }
    } catch (err) {
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to save form.'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Distribute ──
  const handleDistribute = async () => {
    if (!publishedFormId) return
    setIsDistributing(true)
    try {
      const payload = distributeAll
        ? { all: true }
        : { course_ids: selectedCourses }
      const result = await distributeForm(publishedFormId, payload)
      toast.success(`Emails queued for ${result.queued} student(s).`)
    } catch {
      toast.error('Distribution failed. You can retry from the form list.')
    } finally {
      setIsDistributing(false)
      setDistributeModal(false)
      navigate('/feedback-forms')
    }
  }

  if (!authState.user || isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>
  }

  // ── Preview mode ──
  if (previewMode) {
    return (
      <DashboardLayout activeNav="feedback">

          <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
            <div className="relative mx-auto max-w-7xl flex items-center gap-4">
              <button type="button" onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
                <FaArrowLeft className="text-[10px]" /> Back to Edit
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Preview</p>
                <h1 className="text-xl font-bold text-white">{title || 'Untitled Form'}</h1>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto max-w-3xl space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                  <p className="mb-4 font-semibold text-slate-800">{idx + 1}. {q.text}</p>

                  {q.question_type === 'open_ended' && (
                    <textarea rows={3} placeholder="Your answer…" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none" />
                  )}

                  {(q.question_type === 'multiple_choice' || q.question_type === 'yes_no') &&
                    q.options.map((opt, oi) => (
                      <label key={oi} className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 px-4 py-2.5 transition hover:bg-emerald-50/50">
                        <input type="radio" name={`q-${idx}`} className="accent-emerald-600" />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    ))
                  }

                  {q.question_type === 'rating' && (
                    <div className="flex gap-2">
                      {q.options.map((star) => (
                        <button key={star} type="button" onClick={() => setAnswers((a) => ({ ...a, [idx]: star }))} className="text-2xl transition">
                          {answers[idx] >= star
                            ? <FaStar className="text-amber-400" />
                            : <FaRegStar className="text-slate-300" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                  No questions yet.
                </div>
              )}
            </div>
          </div>
      </DashboardLayout>
    )
  }

  // ── Builder ──
  return (
    <DashboardLayout activeNav="feedback">
      {/* ── Distribution modal ── */}
      {distributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FaPaperPlane className="text-[#13462D] text-sm" /> Send to Students
              </h2>
              <button type="button" onClick={() => { setDistributeModal(false); navigate('/feedback-forms') }} className="text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-5">Choose who should receive this feedback form by email.</p>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 mb-4 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={distributeAll}
                onChange={(e) => { setDistributeAll(e.target.checked); setSelectedCourses([]) }}
                className="accent-emerald-600"
              />
              <span className="text-sm font-semibold text-slate-700">All students in institution</span>
            </label>

            {!distributeAll && courses.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Or select specific courses</p>
                {courses.map((c) => (
                  <label key={c.id} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition ${selectedCourses.includes(c.id) ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(c.id)}
                      onChange={(e) => setSelectedCourses((prev) => e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id))}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">{c.code} — {c.title}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setDistributeModal(false); navigate('/feedback-forms') }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={isDistributing || (!distributeAll && selectedCourses.length === 0)}
                onClick={handleDistribute}
                className="flex-1 rounded-xl bg-[#13462D] py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a26] disabled:opacity-50"
              >
                {isDistributing ? 'Sending…' : 'Send Emails'}
              </button>
            </div>
          </div>
        </div>
      )}
        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate('/feedback-forms')} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
                <FaArrowLeft className="text-[10px]" /> Back
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  {mode === 'view' ? 'Viewing' : mode === 'edit' ? 'Editing' : 'Creating'} Form
                </p>
                <h1 className="text-xl font-bold text-white">{title || 'Untitled Form'}</h1>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setPreviewMode(true)} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
                  <FaEye className="text-xs" /> Preview
                </button>
                <button type="button" disabled={isSaving} onClick={() => save('draft')} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50">
                  <FaSave className="text-xs" /> Save Draft
                </button>
                <button type="button" disabled={isSaving} onClick={() => save('published')} className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#13462D] shadow transition hover:bg-emerald-50 disabled:opacity-50">
                  <FaGlobe className="text-xs" /> Publish
                </button>
              </div>
            )}

            {isReadOnly && (
              <button
                type="button"
                onClick={() => navigate('/feedback-analysis', { state: { formId, formTitle: title } })}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#13462D] shadow transition hover:bg-emerald-50"
              >
                <FaChartBar className="text-xs" /> View Analysis
              </button>
            )}
          </div>
        </div>

        {/* ── Response Stats Bar (view mode only) ── */}
        {isReadOnly && (
          <div className="mx-4 mt-4 md:mx-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <FaUsers className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Distributed to</p>
                <p className="text-xl font-bold text-slate-800">{formStats.distributed_count} <span className="text-xs font-normal text-slate-400">students</span></p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <FaCheckCircle className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Responded</p>
                <p className="text-xl font-bold text-slate-800">{formStats.response_count} <span className="text-xs font-normal text-slate-400">students</span></p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <FaClock className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Pending</p>
                <p className="text-xl font-bold text-slate-800">{formStats.distributed_count - formStats.response_count} <span className="text-xs font-normal text-slate-400">students</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* ── Left: builder panels ── */}
            <div className="space-y-5 lg:col-span-8">

              {/* Form info */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                    <span className="text-xs font-bold">01</span>
                  </div>
                  <h2 className="font-semibold text-slate-800">Form Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Form Title</label>
                    <input
                      disabled={isReadOnly}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. End-of-Semester Feedback"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Form Type</label>
                    <select
                      disabled={isReadOnly}
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Auto-Close Date (optional)</label>
                    <input
                      type="datetime-local"
                      disabled={isReadOnly}
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Form will automatically close at this date and time.</p>
                  </div>
                </div>
              </div>

              {/* Template picker */}
              {!isReadOnly && (
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                        <span className="text-xs font-bold">02</span>
                      </div>
                      <h2 className="font-semibold text-slate-800">Template Questions</h2>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {editableTemplates.length}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-500 pl-11">
                    Edit, remove, or add questions to this template pool, then add them all to the form at once.
                  </p>

                  {/* Editable template list */}
                  <div className="space-y-2 mb-4">
                    {editableTemplates.map((q, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="shrink-0 w-6 text-center text-xs font-semibold text-slate-400">{i + 1}.</span>
                        <input
                          value={q}
                          onChange={(e) => updateTemplateQ(i, e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeTemplateQ(i)}
                          className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 transition hover:bg-red-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {editableTemplates.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-5 text-center text-xs text-slate-400 italic">
                        No template questions — add some below.
                      </p>
                    )}
                  </div>

                  {/* Add to template input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newTemplateQ}
                      onChange={(e) => setNewTemplateQ(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addToTemplate()}
                      placeholder="Type a new template question and press Enter or +"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={addToTemplate}
                      disabled={!newTemplateQ.trim()}
                      className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={loadTemplate}
                    disabled={editableTemplates.length === 0}
                    className="rounded-xl bg-[#13462D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0f3a26] disabled:opacity-40"
                  >
                    Add All to Form ({editableTemplates.length})
                  </button>
                </div>
              )}

              {/* Custom question builder */}
              {!isReadOnly && (
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                      <span className="text-xs font-bold">03</span>
                    </div>
                    <h2 className="font-semibold text-slate-800">Add Custom Question</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Question Text</label>
                      <textarea
                        rows={2}
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter your question…"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Question Type</label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      >
                        {Q_TYPES.map((t) => <option key={t} value={t}>{Q_LABEL[t]}</option>)}
                      </select>
                    </div>

                    {customType === 'multiple_choice' && (
                      <div className="space-y-2">
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Options</label>
                        {customOptions.map((opt, oi) => (
                          <div key={oi} className="flex gap-2">
                            <input
                              value={opt}
                              onChange={(e) => {
                                const updated = [...customOptions]; updated[oi] = e.target.value; setCustomOptions(updated)
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            />
                            <button type="button" onClick={() => setCustomOptions(customOptions.filter((_, i) => i !== oi))} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition hover:bg-red-100">
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setCustomOptions([...customOptions, ''])} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                          <FaPlus className="inline mr-1" /> Add Option
                        </button>
                      </div>
                    )}

                    {customType === 'rating' && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Number of Stars</label>
                        <input
                          type="number"
                          min={2} max={10}
                          value={starCount}
                          onChange={(e) => setStarCount(Number(e.target.value))}
                          className="w-32 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />
                        <div className="mt-2 flex gap-1">
                          {Array.from({ length: starCount }).map((_, i) => <FaStar key={i} className="text-amber-400 text-sm" />)}
                        </div>
                      </div>
                    )}

                    <button type="button" onClick={addCustomQuestion} disabled={!customText.trim()} className="rounded-xl bg-[#13462D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0f3a26] disabled:opacity-40">
                      <FaPlus className="inline mr-1.5 text-xs" /> Add Question
                    </button>
                  </div>
                </div>
              )}

              {/* Questions list */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                      <span className="text-xs font-bold">{isReadOnly ? '02' : '04'}</span>
                    </div>
                    <h2 className="font-semibold text-slate-800">Questions <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{questions.length}</span></h2>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-400">
                    No questions yet. Use the template or add custom questions above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-1 shrink-0 rounded-lg bg-[#13462D]/10 px-2 py-0.5 text-xs font-bold text-[#13462D]">{idx + 1}</span>
                          <div className="flex-1 space-y-2">
                            {isReadOnly ? (
                              <p className="text-sm font-medium text-slate-700">{q.text}</p>
                            ) : (
                              <textarea
                                rows={2}
                                value={q.text}
                                onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
                              />
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">{Q_LABEL[q.question_type] ?? q.question_type}</span>

                              {!isReadOnly && (
                                <select
                                  value={q.question_type}
                                  onChange={(e) => updateQuestion(idx, 'question_type', e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600 outline-none focus:border-emerald-400"
                                >
                                  {Q_TYPES.map((t) => <option key={t} value={t}>{Q_LABEL[t]}</option>)}
                                </select>
                              )}
                            </div>

                            {/* Inline options for MC */}
                            {q.question_type === 'multiple_choice' && (
                              <div className="space-y-1.5 mt-2">
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className="flex gap-2">
                                    {isReadOnly
                                      ? <span className="text-sm text-slate-600">• {opt}</span>
                                      : <>
                                          <input value={opt} onChange={(e) => updateOptionInQuestion(idx, oi, e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs outline-none focus:border-emerald-400" />
                                          <button type="button" onClick={() => removeOptionFromQuestion(idx, oi)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-600 hover:bg-red-100"><FaTrash /></button>
                                        </>
                                    }
                                  </div>
                                ))}
                                {!isReadOnly && (
                                  <button type="button" onClick={() => addOptionToQuestion(idx)} className="text-xs text-emerald-600 hover:underline">
                                    <FaPlus className="inline mr-0.5" /> option
                                  </button>
                                )}
                              </div>
                            )}

                            {q.question_type === 'yes_no' && (
                              <div className="flex gap-2 mt-1">
                                {['Yes', 'No'].map((o) => <span key={o} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{o}</span>)}
                              </div>
                            )}

                            {q.question_type === 'rating' && (
                              <div className="flex gap-1 mt-1">
                                {(q.options.length ? q.options : [1,2,3,4,5]).map((s) => <FaStar key={s} className="text-amber-400 text-sm" />)}
                              </div>
                            )}
                          </div>

                          {!isReadOnly && (
                            <button type="button" onClick={() => removeQuestion(idx)} className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-600 transition hover:bg-red-100">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Analysis shortcut (view mode only) ── */}
              {isReadOnly && (
                <button
                  type="button"
                  onClick={() => navigate('/feedback-analysis', { state: { formId, formTitle: title } })}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#13462D]/20 bg-[#13462D]/5 px-6 py-4 text-left transition hover:bg-[#13462D]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#13462D]/10 text-[#13462D]">
                      <FaChartBar className="text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#13462D]">View AI Analysis</p>
                      <p className="text-xs text-slate-500">Sentiment, topics, and improvement suggestions</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#13462D]">Open →</span>
                </button>
              )}

              {/* Bottom action bar */}
              {!isReadOnly && (
                <div className="flex gap-3 pb-8">
                  <button type="button" onClick={() => setPreviewMode(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
                    <FaEye className="text-xs" /> Preview Form
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => save('draft')} className="flex items-center gap-2 rounded-xl border border-[#13462D] bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-sm transition hover:bg-emerald-50 disabled:opacity-50">
                    <FaSave className="text-xs" /> {isSaving ? 'Saving…' : 'Save Draft'}
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => save('published')} className="flex items-center gap-2 rounded-xl bg-[#13462D] px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0f3a26] disabled:opacity-50">
                    <FaGlobe className="text-xs" /> {isSaving ? 'Publishing…' : 'Publish Form'}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: summary panel ── */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Form Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">Total Questions</span>
                    <span className="text-lg font-bold text-[#13462D]">{questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">Type</span>
                    <span className="text-xs font-semibold text-slate-700">{formType}</span>
                  </div>
                  {closeDate && (
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                      <span className="text-xs font-medium text-amber-600">Closes</span>
                      <span className="text-xs font-semibold text-amber-700">{new Date(closeDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {Object.entries(
                    questions.reduce((acc, q) => { acc[q.question_type] = (acc[q.question_type] ?? 0) + 1; return acc }, {})
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                      <span className="text-xs text-slate-500">{Q_LABEL[type] ?? type}</span>
                      <span className="text-xs font-semibold text-slate-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isReadOnly && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Tips</p>
                  <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                    <li>Use templates as a starting point</li>
                    <li>Mix question types for richer data</li>
                    <li>Save as Draft to continue later</li>
                    <li>Publish when ready to distribute</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
