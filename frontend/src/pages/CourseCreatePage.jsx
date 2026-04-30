import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBook, FaCloudUploadAlt, FaFile, FaTimes, FaUsers } from 'react-icons/fa'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopBar from '../components/common/DashboardTopBar'
import { Select } from '../components/ui/Select'
import { SearchSelect } from '../components/ui/SearchSelect'
import institutionLogo from '../assets/Logo_4.png'
import { getInstitutionUsers } from '../services/users'

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028']

const MODE_CONTENT = {
  create: { title: 'Create Course',  description: "Add a new course to your institution's curriculum.", submit: 'Save Course',    badge: 'New Course' },
  edit:   { title: 'Edit Course',    description: 'Update the course information below.',              submit: 'Update Course', badge: 'Editing'    },
  view:   { title: 'Course Details', description: 'Viewing course information.',                       submit: '',              badge: 'View Only'  },
}

const BADGE_COLOR = {
  'New Course': 'bg-emerald-500/20 text-emerald-200',
  'Editing':    'bg-amber-500/20   text-amber-200',
  'View Only':  'bg-slate-500/20   text-slate-300',
}

function SectionCard({ number, icon: Icon, title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#13462D]">
          <Icon className="text-sm text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-slate-300">0{number}</span>
          <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, id, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = (disabled) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 outline-none transition ${
    disabled
      ? 'border-slate-100 bg-slate-50 text-slate-500 cursor-default'
      : 'border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
  }`

function CourseCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [authState] = useState(() => {
    try { return { user: JSON.parse(localStorage.getItem('user')) } }
    catch { return { user: null } }
  })

  const pageMode   = ['edit', 'view'].includes(location.state?.mode) ? location.state.mode : 'create'
  const isView     = pageMode === 'view'
  const content    = MODE_CONTENT[pageMode]
  const prefill    = location.state?.courseInfo ?? {}

  const [form, setForm] = useState({
    courseTitle:  prefill.courseName      ?? '',
    courseCode:   prefill.courseCode      ?? '',
    facultyName:  prefill.facultyName     ?? '',
    academicYear: prefill.academicYear    ?? '',
    description:  prefill.description     ?? '',
    coordinator:  prefill.coordinatorName ?? '',
    lecturer:     prefill.lecturerName    ?? '',
    studentFile:  null,
  })
  const [coordinators, setCoordinators] = useState([])
  const [lecturers,    setLecturers]    = useState([])
  const [saved,        setSaved]        = useState(false)
  const [errors,       setErrors]       = useState({})

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    if (authState.user.role !== 'institution_admin') navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    getInstitutionUsers()
      .then((data) => {
        if (!Array.isArray(data)) return
        setCoordinators(data.filter((u) => u.role === 'coordinator'))
        setLecturers(data.filter((u) => u.role === 'lecturer'))
      })
      .catch(() => {})
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleNav = useCallback((key) => {
    if (key === 'invite') { navigate('/manage-users', { state: { openInvite: true } }); return }
    const map = { dashboard: '/institution-dashboard', courses: '/courses', feedback: '/feedbackForm', users: '/manage-users' }
    if (map[key]) navigate(map[key])
  }, [navigate])

  const handleChange = useCallback((e) => {
    if (isView) return
    const { name, value, files } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'studentFile' ? (files?.[0] ?? null) : value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSaved(false)
  }, [isView])

  const validate = () => {
    const e = {}
    if (!form.courseTitle.trim())  e.courseTitle  = 'Course title is required.'
    if (!form.courseCode.trim())   e.courseCode   = 'Course code is required.'
    if (!form.facultyName.trim())  e.facultyName  = 'Faculty name is required.'
    if (!form.academicYear)        e.academicYear = 'Please select an academic year.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isView) return
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSaved(true)
    if (pageMode === 'create') setTimeout(() => navigate('/courses'), 1200)
  }

  if (!authState.user) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400 text-sm">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DashboardSidebar
        activeNav="courses"
        onNavChange={handleNav}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar
          userName={authState.user.full_name}
          userEmail={authState.user.email}
          searchPlaceholder="Search courses"
        />

        {/* Hero banner */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide mb-3 ${BADGE_COLOR[content.badge]}`}>
                {content.badge}
              </span>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{content.title}</h1>
              <p className="mt-1.5 text-sm text-white/60">{content.description}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:self-auto"
            >
              <FaArrowLeft className="text-xs" />
              Back to Courses
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mx-4 my-6 md:mx-6 space-y-4 max-w-4xl xl:mx-auto">

          {/* Section 1 — Course Information */}
          <SectionCard number={1} icon={FaBook} title="Course Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Course Title" id="courseTitle" required error={errors.courseTitle}>
                <input
                  id="courseTitle" name="courseTitle" type="text"
                  value={form.courseTitle} onChange={handleChange}
                  placeholder="e.g. Introduction to Software Engineering"
                  disabled={isView} className={inputCls(isView)}
                />
              </Field>

              <Field label="Course Code" id="courseCode" required error={errors.courseCode}>
                <input
                  id="courseCode" name="courseCode" type="text"
                  value={form.courseCode} onChange={handleChange}
                  placeholder="e.g. SE201"
                  disabled={isView} className={inputCls(isView)}
                />
              </Field>

              <Field label="Faculty Name" id="facultyName" required error={errors.facultyName}>
                <input
                  id="facultyName" name="facultyName" type="text"
                  value={form.facultyName} onChange={handleChange}
                  placeholder="e.g. Faculty of Engineering"
                  disabled={isView} className={inputCls(isView)}
                />
              </Field>

              <Field label="Academic Year" id="academicYear" required error={errors.academicYear}>
                <Select
                  id="academicYear" name="academicYear"
                  value={form.academicYear} onChange={handleChange}
                  placeholder="Select academic year"
                  options={ACADEMIC_YEARS}
                  disabled={isView}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Description" id="description">
                <textarea
                  id="description" name="description" rows={3}
                  value={form.description} onChange={handleChange}
                  placeholder="A short summary of what this course covers…"
                  disabled={isView}
                  className={`${inputCls(isView)} resize-none`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Section 2 — Assigned Staff */}
          <SectionCard number={2} icon={FaUsers} title="Assigned Staff">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Coordinator" id="coordinator">
                {isView
                  ? <input value={form.coordinator || '—'} disabled className={inputCls(true)} />
                  : <SearchSelect
                      id="coordinator" name="coordinator"
                      value={form.coordinator} onChange={handleChange}
                      placeholder="Select coordinator"
                      searchPlaceholder="Search coordinators…"
                      options={coordinators.map((u) => ({ value: u.full_name, label: u.full_name }))}
                    />
                }
              </Field>

              <Field label="Lecturer" id="lecturer">
                {isView
                  ? <input value={form.lecturer || '—'} disabled className={inputCls(true)} />
                  : <SearchSelect
                      id="lecturer" name="lecturer"
                      value={form.lecturer} onChange={handleChange}
                      placeholder="Select lecturer"
                      searchPlaceholder="Search lecturers…"
                      options={lecturers.map((u) => ({ value: u.full_name, label: u.full_name }))}
                    />
                }
              </Field>
            </div>

            {!isView && coordinators.length === 0 && lecturers.length === 0 && (
              <p className="mt-3 text-xs text-amber-600">
                No staff found.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/manage-users', { state: { openInvite: true } })}
                  className="font-semibold underline"
                >
                  Add staff first
                </button>.
              </p>
            )}
          </SectionCard>

          {/* Section 3 — Student Roster */}
          {!isView && (
            <SectionCard number={3} icon={FaCloudUploadAlt} title={<>Student Roster <span className="ml-1.5 text-[11px] font-normal text-slate-400 normal-case tracking-normal">(optional)</span></>}>
              <label
                htmlFor="studentFile"
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                  form.studentFile
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                {form.studentFile ? (
                  <>
                    <FaFile className="text-2xl text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">{form.studentFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setForm((p) => ({ ...p, studentFile: null })) }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-red-500"
                    >
                      <FaTimes className="text-[10px]" /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <FaCloudUploadAlt className="text-xl text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Click to upload student list</p>
                      <p className="mt-0.5 text-xs text-slate-400">CSV, XLS or XLSX — student names, IDs, emails</p>
                    </div>
                  </>
                )}
                <input id="studentFile" name="studentFile" type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleChange} />
              </label>
            </SectionCard>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pb-6">
            {!isView && (
              <>
                <button
                  type="submit"
                  className="rounded-xl bg-[#13462D] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
                >
                  {content.submit}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm({ courseTitle:'',courseCode:'',facultyName:'',academicYear:'',description:'',coordinator:'',lecturer:'',studentFile:null }); setErrors({}); setSaved(false) }}
                  className="rounded-xl border border-slate-200 bg-white px-7 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="rounded-xl border border-slate-200 bg-white px-7 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              {isView ? 'Back to Courses' : 'Cancel'}
            </button>

            {saved && (
              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                ✓ {pageMode === 'create' ? 'Course saved! Redirecting…' : 'Course updated successfully.'}
              </span>
            )}
          </div>

        </form>
      </main>
    </div>
  )
}

export default CourseCreatePage
