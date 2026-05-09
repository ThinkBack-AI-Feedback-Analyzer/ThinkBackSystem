import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaBook, FaChartBar, FaCog, FaEye,
  FaGlobe, FaGraduationCap, FaHome, FaPlus, FaRegStar, FaSave, FaStar, FaTrash, FaPaperPlane, FaTimes,
} from 'react-icons/fa'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar from '../../components/common/DashboardTopBar'
import institutionLogo from '../../assets/Logo_4.png'
import { createFeedbackForm, distributeForm } from '../../services/feedback'

const STAFF_NAV = [
  { key: 'dashboard', label: 'Dashboard',        icon: FaHome,          group: 'main' },
  { key: 'courses',   label: 'My Courses',        icon: FaBook,          group: 'main' },
  { key: 'students',  label: 'Students',          icon: FaGraduationCap, group: 'main' },
  { key: 'feedback',  label: 'Feedback Results',  icon: FaChartBar,      group: 'main' },
  { key: 'settings',  label: 'Settings',          icon: FaCog,           group: 'settings' },
]

const TYPE_OPTIONS = ['Exam', 'Lab', 'Course', 'Custom']
const Q_TYPES      = ['open_ended', 'multiple_choice', 'yes_no', 'rating']
const Q_LABEL      = { open_ended: 'Open Ended', multiple_choice: 'Multiple Choice', yes_no: 'Yes / No', rating: 'Rating' }
const TEMPLATES    = {
  Exam:   ['Was the exam difficulty appropriate?', 'Were the exam instructions clear?', 'Did the exam cover the syllabus?', 'Was enough time given?'],
  Lab:    ['Were lab sessions helpful?', 'Were the lab instructions clear?', 'Was lab equipment adequate?', 'How can lab sessions be improved?'],
  Course: ['How would you rate the overall course?', 'Was the course content well organised?', 'Was the lecturer clear in teaching?', 'What improvements would you suggest?'],
  Custom: [],
}

function makeQuestion(text = '', type = 'open_ended', options = []) {
  return { text, question_type: type, options, order: 0 }
}

export default function StaffFormCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const course   = location.state?.course ?? null

  const [authState] = useState(() => {
    const s = localStorage.getItem('user')
    if (!s) return { user: null }
    try { return { user: JSON.parse(s) } } catch { return { user: null } }
  })

  const [title,           setTitle]           = useState(course ? `${course.title} Feedback` : '')
  const [formType,        setFormType]        = useState('Course')
  const [questions,       setQuestions]       = useState([])
  const [isSaving,        setIsSaving]        = useState(false)
  const [previewMode,     setPreviewMode]     = useState(false)
  const [answers,         setAnswers]         = useState({})

  const [distributeModal, setDistributeModal] = useState(false)
  const [publishedFormId, setPublishedFormId] = useState(null)
  const [isDistributing,  setIsDistributing]  = useState(false)

  const [editableTemplates, setEditableTemplates] = useState([...TEMPLATES['Course']])
  const [newTemplateQ,      setNewTemplateQ]      = useState('')

  const [customText,    setCustomText]    = useState('')
  const [customType,    setCustomType]    = useState('open_ended')
  const [customOptions, setCustomOptions] = useState([''])
  const [starCount,     setStarCount]     = useState(5)

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    const allowed = ['coordinator', 'lecturer']
    if (!allowed.includes(authState.user.role)) navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    setEditableTemplates([...(TEMPLATES[formType] ?? [])])
  }, [formType])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleSidebarNav = useCallback((key) => {
    const map = {
      dashboard: '/staff-dashboard',
      courses:   '/courses',
      students:  '/students',
      feedback:  '/feedback-forms',
    }
    if (map[key]) navigate(map[key])
  }, [navigate])

  /* ── template helpers ── */
  const updateTemplateQ = (idx, val) => setEditableTemplates((p) => p.map((q, i) => i === idx ? val : q))
  const removeTemplateQ = (idx)      => setEditableTemplates((p) => p.filter((_, i) => i !== idx))
  const addToTemplate   = () => {
    if (!newTemplateQ.trim()) return
    setEditableTemplates((p) => [...p, newTemplateQ.trim()])
    setNewTemplateQ('')
  }
  const loadTemplate = () => {
    if (!editableTemplates.length) return
    setQuestions((p) => [...p, ...editableTemplates.map((t) => makeQuestion(t, 'open_ended'))])
    toast.success(`${editableTemplates.length} questions added.`)
  }

  /* ── custom question helpers ── */
  const addCustomQuestion = () => {
    if (!customText.trim()) return
    const opts =
      customType === 'multiple_choice' ? customOptions.filter(Boolean)
      : customType === 'yes_no'        ? ['Yes', 'No']
      : customType === 'rating'        ? Array.from({ length: starCount }, (_, i) => i + 1)
      : []
    setQuestions((p) => [...p, makeQuestion(customText.trim(), customType, opts)])
    setCustomText('')
    setCustomOptions([''])
  }

  const updateQuestion = (idx, field, val) =>
    setQuestions((p) => p.map((q, i) => i === idx ? { ...q, [field]: val } : q))

  const removeQuestion = (idx) =>
    setQuestions((p) => p.filter((_, i) => i !== idx))

  const addOptionToQuestion = (qIdx) =>
    setQuestions((p) => p.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q))

  const updateOptionInQuestion = (qIdx, oIdx, val) =>
    setQuestions((p) => p.map((q, i) => {
      if (i !== qIdx) return q
      const opts = [...q.options]; opts[oIdx] = val
      return { ...q, options: opts }
    }))

  const removeOptionFromQuestion = (qIdx, oIdx) =>
    setQuestions((p) => p.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.filter((_, oi) => oi !== oIdx) } : q
    ))

  /* ── save ── */
  const save = async (status) => {
    if (!title.trim())     { toast.error('Please enter a form title.');        return }
    if (!questions.length) { toast.error('Please add at least one question.'); return }
    setIsSaving(true)
    try {
      const savedForm = await createFeedbackForm({
        title:     title.trim(),
        form_type: formType,
        status,
        questions: questions.map((q, i) => ({ ...q, order: i })),
      })
      toast.success(status === 'published' ? 'Form published!' : 'Draft saved.')
      if (status === 'published') {
        setPublishedFormId(savedForm.id)
        setDistributeModal(true)
      } else {
        navigate('/courses')
      }
    } catch {
      toast.error('Failed to save form.')
    } finally {
      setIsSaving(false)
    }
  }

  /* ── distribute ── */
  const handleDistribute = async () => {
    if (!publishedFormId) return
    setIsDistributing(true)
    try {
      const payload = course ? { course_ids: [course.id] } : { all: true }
      const result  = await distributeForm(publishedFormId, payload)
      toast.success(`Emails queued for ${result.queued} student(s).`)
    } catch {
      toast.error('Distribution failed. You can retry later.')
    } finally {
      setIsDistributing(false)
      setDistributeModal(false)
      navigate('/courses')
    }
  }

  if (!authState.user) return null

  /* ── Preview ── */
  if (previewMode) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <DashboardSidebar
          navItems={STAFF_NAV}
          activeNav="courses"
          onNavChange={handleSidebarNav}
          onLogout={handleLogout}
          logoSrc={institutionLogo}
          logoAlt="ThinkBack logo"
        />
        <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
          <DashboardTopBar userName={authState.user.full_name} userEmail={authState.user.email} />

          <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-4">
              <button type="button" onClick={() => setPreviewMode(false)}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
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
                    <textarea rows={3} placeholder="Your answer…"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-emerald-400" />
                  )}
                  {(q.question_type === 'multiple_choice' || q.question_type === 'yes_no') &&
                    q.options.map((opt, oi) => (
                      <label key={oi} className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 px-4 py-2.5 hover:bg-emerald-50/50">
                        <input type="radio" name={`pq-${idx}`} className="accent-emerald-600" />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    ))
                  }
                  {q.question_type === 'rating' && (
                    <div className="flex gap-2">
                      {q.options.map((star) => (
                        <button key={star} type="button" onClick={() => setAnswers((a) => ({ ...a, [idx]: star }))} className="text-2xl">
                          {answers[idx] >= star ? <FaStar className="text-amber-400" /> : <FaRegStar className="text-slate-300" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!questions.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                  No questions yet.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Builder ── */
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Distribution modal */}
      {distributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FaPaperPlane className="text-[#13462D] text-sm" /> Send to Students
              </h2>
              <button type="button" onClick={() => { setDistributeModal(false); navigate('/courses') }} className="text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>

            {course ? (
              <p className="text-sm text-slate-600 mb-6">
                Send this form to all students enrolled in <span className="font-semibold text-slate-800">{course.code} — {course.title}</span>.
              </p>
            ) : (
              <p className="text-sm text-slate-600 mb-6">Send this form to all students in your institution.</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setDistributeModal(false); navigate('/courses') }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={isDistributing}
                onClick={handleDistribute}
                className="flex-1 rounded-xl bg-[#13462D] py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a26] disabled:opacity-50"
              >
                {isDistributing ? 'Sending…' : 'Send Emails'}
              </button>
            </div>
          </div>
        </div>
      )}
      <DashboardSidebar
        navItems={STAFF_NAV}
        activeNav="courses"
        onNavChange={handleSidebarNav}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar userName={authState.user.full_name} userEmail={authState.user.email} />

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate('/courses')}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
                <FaArrowLeft className="text-[10px]" /> My Courses
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  Create Feedback Form
                </p>
                <h1 className="text-xl font-bold text-white">{title || 'Untitled Form'}</h1>
                {course && (
                  <p className="text-xs text-white/40 mt-0.5">{course.code} · {course.faculty_name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPreviewMode(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20">
                <FaEye className="text-xs" /> Preview
              </button>
              <button type="button" disabled={isSaving} onClick={() => save('draft')}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50">
                <FaSave className="text-xs" /> Save Draft
              </button>
              <button type="button" disabled={isSaving} onClick={() => save('published')}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#13462D] shadow transition hover:bg-emerald-50 disabled:opacity-50">
                <FaGlobe className="text-xs" /> Publish
              </button>
            </div>
          </div>
        </div>

        {/* ── Builder body ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Left: panels */}
            <div className="space-y-5 lg:col-span-8">

              {/* 01 Form details */}
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. End-of-Semester Feedback"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Form Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                      {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 02 Template questions */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                      <span className="text-xs font-bold">02</span>
                    </div>
                    <h2 className="font-semibold text-slate-800">Template Questions</h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{editableTemplates.length}</span>
                </div>
                <p className="mb-4 text-sm text-slate-500 pl-11">Edit or remove suggestions, then add them all at once.</p>

                <div className="space-y-2 mb-4">
                  {editableTemplates.map((q, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="shrink-0 w-6 text-center text-xs font-semibold text-slate-400">{i + 1}.</span>
                      <input
                        value={q}
                        onChange={(e) => updateTemplateQ(i, e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                      <button type="button" onClick={() => removeTemplateQ(i)}
                        className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 transition hover:bg-red-100">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  {!editableTemplates.length && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-5 text-center text-xs text-slate-400 italic">
                      No template questions — add some below.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    value={newTemplateQ}
                    onChange={(e) => setNewTemplateQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToTemplate()}
                    placeholder="Type a new template question and press Enter or +"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button type="button" onClick={addToTemplate} disabled={!newTemplateQ.trim()}
                    className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40">
                    <FaPlus />
                  </button>
                </div>

                <button type="button" onClick={loadTemplate} disabled={!editableTemplates.length}
                  className="rounded-xl bg-[#13462D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0f3a26] disabled:opacity-40">
                  Add All to Form ({editableTemplates.length})
                </button>
              </div>

              {/* 03 Custom question */}
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
                            onChange={(e) => { const u = [...customOptions]; u[oi] = e.target.value; setCustomOptions(u) }}
                            placeholder={`Option ${oi + 1}`}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                          <button type="button" onClick={() => setCustomOptions(customOptions.filter((_, i) => i !== oi))}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition hover:bg-red-100">
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setCustomOptions([...customOptions, ''])}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                        <FaPlus className="inline mr-1" /> Add Option
                      </button>
                    </div>
                  )}

                  {customType === 'rating' && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Number of Stars</label>
                      <input
                        type="number" min={2} max={10}
                        value={starCount}
                        onChange={(e) => setStarCount(Number(e.target.value))}
                        className="w-32 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="mt-2 flex gap-1">
                        {Array.from({ length: starCount }).map((_, i) => <FaStar key={i} className="text-amber-400 text-sm" />)}
                      </div>
                    </div>
                  )}

                  <button type="button" onClick={addCustomQuestion} disabled={!customText.trim()}
                    className="rounded-xl bg-[#13462D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0f3a26] disabled:opacity-40">
                    <FaPlus className="inline mr-1.5 text-xs" /> Add Question
                  </button>
                </div>
              </div>

              {/* 04 Questions list */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#13462D]/10 text-[#13462D]">
                      <span className="text-xs font-bold">04</span>
                    </div>
                    <h2 className="font-semibold text-slate-800">
                      Questions
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{questions.length}</span>
                    </h2>
                  </div>
                </div>

                {!questions.length ? (
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
                            <textarea
                              rows={2}
                              value={q.text}
                              onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={q.question_type}
                                onChange={(e) => updateQuestion(idx, 'question_type', e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600 outline-none focus:border-emerald-400"
                              >
                                {Q_TYPES.map((t) => <option key={t} value={t}>{Q_LABEL[t]}</option>)}
                              </select>
                            </div>

                            {q.question_type === 'multiple_choice' && (
                              <div className="space-y-1.5 mt-2">
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className="flex gap-2">
                                    <input value={opt} onChange={(e) => updateOptionInQuestion(idx, oi, e.target.value)}
                                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs outline-none focus:border-emerald-400" />
                                    <button type="button" onClick={() => removeOptionFromQuestion(idx, oi)}
                                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-600 hover:bg-red-100"><FaTrash /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addOptionToQuestion(idx)} className="text-xs text-emerald-600 hover:underline">
                                  <FaPlus className="inline mr-0.5" /> option
                                </button>
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
                          <button type="button" onClick={() => removeQuestion(idx)}
                            className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-600 transition hover:bg-red-100">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom action bar */}
              <div className="flex gap-3 pb-8">
                <button type="button" onClick={() => setPreviewMode(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
                  <FaEye className="text-xs" /> Preview Form
                </button>
                <button type="button" disabled={isSaving} onClick={() => save('draft')}
                  className="flex items-center gap-2 rounded-xl border border-[#13462D] bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-sm transition hover:bg-emerald-50 disabled:opacity-50">
                  <FaSave className="text-xs" /> {isSaving ? 'Saving…' : 'Save Draft'}
                </button>
                <button type="button" disabled={isSaving} onClick={() => save('published')}
                  className="flex items-center gap-2 rounded-xl bg-[#13462D] px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0f3a26] disabled:opacity-50">
                  <FaGlobe className="text-xs" /> {isSaving ? 'Publishing…' : 'Publish Form'}
                </button>
              </div>
            </div>

            {/* Right: summary panel */}
            <div className="lg:col-span-4 space-y-4">
              {course && (
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                  <h3 className="mb-4 text-sm font-semibold text-slate-800">Course</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-slate-800">{course.title}</p>
                    <p className="text-xs text-slate-400">{course.code}</p>
                    <p className="text-xs text-slate-400">{course.faculty_name}</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {course.academic_year}
                    </span>
                  </div>
                </div>
              )}

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

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-xs font-semibold text-amber-700 mb-1">Tips</p>
                <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                  <li>Use templates as a starting point</li>
                  <li>Mix question types for richer data</li>
                  <li>Save as Draft to continue later</li>
                  <li>Publish when ready to distribute</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
