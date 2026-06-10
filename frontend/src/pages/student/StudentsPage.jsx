import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaBook, FaDownload, FaGraduationCap,
  FaPlus, FaSearch, FaTimes, FaTrash, FaUpload,
  FaUsers, FaFilter, FaInfoCircle,
} from 'react-icons/fa'
import DashboardLayout from '../../components/common/DashboardLayout'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchSelect } from '../../components/ui/SearchSelect'
import { getStudents, bulkCreate, deleteStudent } from '../../services/students'
import { getCourses } from '../../services/courses'
import { useCurrentUser } from '../../hooks/useSidebarNav'

/* ── CSV helpers ── */
const normalize = (str) =>
  str?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

const detectColumn = (headers, ...candidates) => {
  const norm = headers.map(normalize)
  for (const c of candidates) {
    const idx = norm.findIndex((h) => h.includes(c))
    if (idx !== -1) return headers[idx]
  }
  return null
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
        <Icon className="text-sm text-white/90" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-[11px] font-medium text-white/60">{label}</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   CSV IMPORT PANEL
   ════════════════════════════════════════════ */
function ImportPanel({ courses, isAdmin, onImported }) {
  const fileRef = useRef()
  const [fileName,   setFileName]   = useState('')
  const [csvRows,    setCsvRows]    = useState([])
  const [csvHeaders, setCsvHeaders] = useState([])
  const [idCol,      setIdCol]      = useState('')
  const [nameCol,    setNameCol]    = useState('')
  const [emailCol,   setEmailCol]   = useState('')
  const [courseId,   setCourseId]   = useState('')
  const [isSaving,   setIsSaving]   = useState(false)

  const reset = () => {
    setFileName(''); setCsvRows([]); setCsvHeaders([])
    setIdCol(''); setNameCol(''); setEmailCol(''); setCourseId('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      if (!lines.length) return
      const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      setCsvHeaders(rawHeaders)
      setIdCol(detectColumn(rawHeaders,   'student_id', 'id', 'reg', 'number') ?? '')
      setNameCol(detectColumn(rawHeaders, 'name', 'full_name', 'student_name') ?? '')
      setEmailCol(detectColumn(rawHeaders,'email') ?? '')
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(',')
        const obj  = {}
        rawHeaders.forEach((h, i) => { obj[normalize(h)] = cols[i]?.trim().replace(/^"|"$/g, '') ?? '' })
        return obj
      })
      setCsvRows(rows)
    }
    reader.readAsText(file)
  }

  const handleSave = async () => {
    if (!csvRows.length) { toast.error('No rows to import.'); return }
    if (!idCol)          { toast.error('Please select the Student ID column.'); return }
    if (!nameCol)        { toast.error('Please select the Name column.'); return }
    setIsSaving(true)
    try {
      const students = csvRows.map((row) => ({
        student_id: row[normalize(idCol)]    ?? '',
        full_name:  row[normalize(nameCol)]  ?? '',
        email:      row[normalize(emailCol)] ?? '',
      }))
      const res = await bulkCreate({ students, course_id: courseId || null })
      toast.success(`Imported ${res.created} new, updated ${res.updated}.`)
      if (res.errors?.length) toast.error(`${res.errors.length} rows skipped.`)
      reset()
      onImported()
    } catch {
      toast.error('Import failed.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">

      {/* CSV Format Instructions */}
      <div className="p-5 bg-amber-50 border-b border-amber-100">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-amber-500 text-base mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-2">CSV Format Requirements</p>
            <div className="overflow-x-auto rounded-lg border border-amber-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="px-3 py-2 text-left font-semibold text-amber-900">Column Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-900">Required</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-900">Example</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-900">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {[
                    { name: 'student_id', required: true,  example: 'STU001',           desc: 'Unique student identifier' },
                    { name: 'full_name',  required: true,  example: 'John Smith',       desc: "Student's full name" },
                    { name: 'email',      required: false, example: 'john@example.com', desc: 'For sending feedback links' },
                  ].map(col => (
                    <tr key={col.name}>
                      <td className="px-3 py-1.5 font-mono font-semibold text-amber-900">{col.name}</td>
                      <td className="px-3 py-1.5">
                        {col.required
                          ? <span className="inline-flex px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold text-[10px]">Required</span>
                          : <span className="inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">Optional</span>}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-slate-600">{col.example}</td>
                      <td className="px-3 py-1.5 text-slate-500">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2.5 p-2.5 bg-amber-100 rounded-lg">
              <p className="text-[10px] font-semibold text-amber-800 mb-1">Sample CSV:</p>
              <pre className="text-[10px] font-mono text-amber-900 whitespace-pre-wrap">{`student_id,full_name,email\nSTU001,John Smith,john@example.com\nSTU002,Jane Doe,jane@example.com`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1 + 2: Course picker & file upload — always visible */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Import from CSV</h3>
          <p className="text-xs text-slate-400">Select the course, then upload a CSV with student_id, name, and email columns.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          {/* Course dropdown — always visible */}
          <div className="flex-1 min-w-0">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Assign to Course</label>
            <SearchSelect
              id="import-course-select"
              name="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: `${c.title} (${c.code})` }))}
              placeholder="— select a course —"
              searchPlaceholder="Search courses..."
            />
          </div>

          {/* File picker */}
          <div className="flex items-center gap-3 shrink-0">
            {fileName && (
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 max-w-[180px] truncate">
                {fileName}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-[#13462D] bg-white px-4 py-2.5 text-sm font-semibold text-[#13462D] transition hover:bg-emerald-50"
            >
              <FaUpload className="text-xs" /> Browse CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </div>
        </div>
      </div>

      {/* Step 3: Column mapping + preview — shown after upload */}
      {csvRows.length > 0 && (
        <div className="border-t border-slate-100 p-6 space-y-5">
          {/* Column mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Student ID column *', value: idCol,    setter: setIdCol },
              { label: 'Name column *',        value: nameCol,  setter: setNameCol },
              { label: 'Email column',         value: emailCol, setter: setEmailCol },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">— not mapped —</option>
                  {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Preview table */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Preview — first 5 rows</p>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Student ID</th>
                    <th className="px-3 py-2 text-left font-semibold">Full Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{idCol    ? row[normalize(idCol)]    : '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{nameCol  ? row[normalize(nameCol)]  : '—'}</td>
                      <td className="px-3 py-2 text-slate-400">{emailCol ? row[normalize(emailCol)] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvRows.length > 5 && (
              <p className="mt-1.5 text-xs text-slate-400">…and {csvRows.length - 5} more rows</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-[#13462D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f3a26] disabled:opacity-50"
            >
              <FaDownload className="text-xs" /> {isSaving ? 'Importing…' : `Import ${csvRows.length} Students`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */
export default function StudentsPage() {
  const navigate   = useNavigate()
  const authUser = useCurrentUser()
  const authState = { user: authUser }

  const isAdmin = authState.user?.role === 'institution_admin'

  const [students,      setStudents]      = useState([])
  const [courses,       setCourses]       = useState([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterCourse,  setFilterCourse]  = useState('')
  const [filterYear,    setFilterYear]    = useState('')
  const [currentPage,   setCurrentPage]   = useState(1)
  const [showImport,    setShowImport]    = useState(false)
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [addForm,       setAddForm]       = useState({ student_id: '', full_name: '', email: '' })
  const [isAdding,      setIsAdding]      = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [selectedIds,     setSelectedIds]     = useState(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [isBulkDeleting,  setIsBulkDeleting]  = useState(false)

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(authState.user.role)) navigate('/')
  }, [authState.user, navigate])

  const loadStudents = useCallback((course) => {
    setIsLoading(true)
    getStudents(course ? { course } : {})
      .then((r) => setStudents(Array.isArray(r) ? r : []))
      .catch(() => toast.error('Failed to load students.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!authState.user) return
    getCourses()
      .then((r) => setCourses(Array.isArray(r) ? r : []))
      .catch(() => {})
    loadStudents()
  }, [authState.user, loadStudents])

  const handleCourseFilter = (courseId) => {
    setFilterCourse(courseId)
    loadStudents(courseId)
  }


  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteStudent(deleteTarget.id)
      setStudents((p) => p.filter((s) => s.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.full_name}" removed.`)
    } catch {
      toast.error('Failed to delete student.')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleBulkDelete = async () => {
    const ids = [...selectedIds]
    setIsBulkDeleting(true)
    try {
      await Promise.all(ids.map((id) => deleteStudent(id)))
      setStudents((prev) => prev.filter((s) => !ids.includes(s.id)))
      toast.success(`${ids.length} student${ids.length > 1 ? 's' : ''} removed.`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Failed to delete some students.')
    } finally {
      setIsBulkDeleting(false)
      setBulkConfirmOpen(false)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const result = await bulkCreate({ students: [addForm] })
      if (result.errors?.length) {
        toast.error(result.errors[0])
      } else {
        toast.success('Student added successfully')
        setAddForm({ student_id: '', full_name: '', email: '' })
        setShowAddModal(false)
        loadStudents(filterCourse)
      }
    } catch {
      toast.error('Failed to add student')
    } finally {
      setIsAdding(false)
    }
  }

  const filtered = students.filter((s) => {
    if (search) {
      const q = search.toLowerCase()
      if (!s.student_id?.toLowerCase().includes(q) &&
          !s.full_name?.toLowerCase().includes(q)  &&
          !s.email?.toLowerCase().includes(q)) return false
    }
    if (filterYear) {
      const hasYear = s.courses?.some(c => c.academic_year === filterYear)
      if (!hasYear) return false
    }
    return true
  })

  const uniqueYears = useMemo(() => {
    const years = new Set(courses.map(c => c.academic_year).filter(Boolean))
    return Array.from(years).sort().reverse()
  }, [courses])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [search, filterYear, filterCourse])

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedStudents = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:   students.length,
    courses: new Set(students.flatMap((s) => s.courses?.map(c => c.id) || [])).size,
  }

  const allPageSelected = paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedIds.has(s.id))
  const somePageSelected = !allPageSelected && paginatedStudents.some((s) => selectedIds.has(s.id))

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginatedStudents.forEach((s) => next.delete(s.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginatedStudents.forEach((s) => next.add(s.id))
        return next
      })
    }
  }

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!authState.user) return null

  return (
    <DashboardLayout activeNav="students">

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
                {isAdmin ? 'Student Management' : 'My Students'}
              </p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Students</h1>
              <p className="mt-2 max-w-md text-sm text-white/60">
                {isAdmin
                  ? 'Manage all students across your institution. Import via CSV or add individually.'
                  : 'Students enrolled in your assigned courses.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <StatPill icon={FaGraduationCap} label="Total Students"   value={stats.total} />
                <StatPill icon={FaBook}          label="Courses Covered"  value={stats.courses} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/20 border border-white/30 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-white/20"
                >
                  <FaPlus className="text-xs" />
                  Add Student
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowImport((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50"
              >
                {showImport ? <FaTimes className="text-xs" /> : <FaUpload className="text-xs" />}
                {showImport ? 'Close Import' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 md:px-6 md:py-8 space-y-5">

          {/* ── CSV import panel ── */}
          {showImport && (
            <ImportPanel
              courses={courses}
              isAdmin={isAdmin}
              onImported={() => { setShowImport(false); loadStudents(filterCourse) }}
            />
          )}

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name or email…"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <SearchSelect
                id="filter-year-select"
                name="filterYear"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                options={uniqueYears.map((y) => ({ value: y, label: y }))}
                placeholder="All Years"
                searchPlaceholder="Search year..."
              />
            </div>
            <div className="relative w-full sm:w-64 shrink-0">
              <SearchSelect
                id="filter-course-select"
                name="filterCourse"
                value={filterCourse}
                onChange={(e) => handleCourseFilter(e.target.value)}
                options={courses.map((c) => ({ value: c.id, label: `${c.title} (${c.code})` }))}
                placeholder="All Courses"
                searchPlaceholder="Search course..."
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                <span className="text-sm font-medium text-emerald-800">
                  {selectedIds.size} {selectedIds.size === 1 ? 'student' : 'students'} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkConfirmOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <FaTrash className="text-[10px]" />
                    Delete {selectedIds.size} selected
                  </button>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-400">Loading students…</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <FaGraduationCap className="mx-auto mb-3 text-3xl text-slate-200" />
                <p className="text-sm font-medium text-slate-400">
                  {students.length === 0 ? 'No students yet. Import a CSV to get started.' : 'No students match your search.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          ref={(el) => { if (el) el.indeterminate = somePageSelected }}
                          onChange={toggleAll}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-600"
                        />
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Course</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.map((s) => (
                      <tr key={s.id} className={`hover:bg-slate-50/60 transition-colors ${selectedIds.has(s.id) ? 'bg-emerald-50/60' : ''}`}>
                        <td className="px-5 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={() => toggleRow(s.id)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-600"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            {s.student_id}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{s.full_name}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{s.email || '—'}</td>
                        <td className="px-5 py-3.5">
                          {s.courses && s.courses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {s.courses.map((c) => (
                                <span key={c.id} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                  {c.title} <span className="ml-1 text-slate-400">({c.code})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <FaTrash className="text-[10px]" /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <div className="text-xs text-slate-500">
                    Showing {filtered.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-emerald-600 transition"
                    >
                      Previous
                    </button>
                    <div className="text-xs font-medium text-slate-600 px-2 min-w-[5rem] text-center">
                      Page {currentPage} of {totalPages || 1}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-emerald-600 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Student"
        description={`Are you sure you want to remove "${deleteTarget?.full_name}" (${deleteTarget?.student_id})? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={(o) => !isBulkDeleting && setBulkConfirmOpen(o)}
        title={`Remove ${selectedIds.size} ${selectedIds.size === 1 ? 'Student' : 'Students'}?`}
        description="This action cannot be undone. All selected students will be permanently removed."
        confirmLabel={isBulkDeleting ? 'Removing…' : `Remove ${selectedIds.size}`}
        onConfirm={handleBulkDelete}
      />

      {/* ── Add Student Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FaGraduationCap className="text-[#13462D] text-sm" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Add Student</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.student_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, student_id: e.target.value }))}
                  placeholder="e.g. STU001"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">Must be unique within your institution</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. john@example.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">Used to send feedback form links</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 rounded-xl bg-[#13462D] py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a26] disabled:opacity-60 transition-colors"
                >
                  {isAdding ? 'Adding…' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
