import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  FaPlus, FaUpload, FaTrash, FaSearch,
  FaDownload, FaInfoCircle, FaTimes, FaUserGraduate, FaChevronDown,
} from 'react-icons/fa'
import * as Select from '@radix-ui/react-select'
import { getStudents, bulkCreate, deleteStudent } from '../../services/students'
import { getCourses } from '../../services/courses'

const CSV_COLUMNS = [
  { name: 'student_id', required: true,  example: 'STU001',           description: 'Unique student identifier (no spaces)' },
  { name: 'full_name',  required: true,  example: 'John Smith',       description: "Student's full name" },
  { name: 'email',      required: false, example: 'john@example.com', description: 'Email address for feedback delivery' },
]

const TEMPLATE_CSV =
  'student_id,full_name,email\n' +
  'STU001,John Smith,john@example.com\n' +
  'STU002,Jane Doe,jane@example.com\n' +
  'STU003,Ahmed Ali,ahmed@example.com'

export default function StudentManagementPage() {
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [search,      setSearch]      = useState('')

  // CSV state
  const [csvStudents, setCsvStudents] = useState([])
  const [csvFileName, setCsvFileName] = useState('')
  const [csvErrors,   setCsvErrors]   = useState([])
  const [importing,   setImporting]   = useState(false)
  const fileInputRef = useRef()

  // Manual add modal
  const [showModal,   setShowModal]   = useState(false)
  const [form,        setForm]        = useState({ student_id: '', full_name: '', email: '', course_id: '' })
  const [submitting,  setSubmitting]  = useState(false)
  const [courses,     setCourses]     = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getStudents()
      setStudents(data)
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  useEffect(() => {
    if (!showModal) return
    setCoursesLoading(true)
    getCourses()
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false))
  }, [showModal])

  // ── CSV Parsing ───────────────────────────────────────────────────────────

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setCsvFileName(file.name)
    setCsvErrors([])
    setCsvStudents([])

    const reader = new FileReader()
    reader.onload = (event) => {
      const text  = event.target.result
      const lines = text.split('\n').filter(l => l.trim())

      if (lines.length === 0) {
        setCsvErrors(['The file is empty.'])
        return
      }

      const rawHeaders = lines[0].split(',').map(h => h.trim())
      const headers    = rawHeaders.map(h =>
        h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      )

      const missing = ['student_id', 'full_name'].filter(c => !headers.includes(c))
      if (missing.length > 0) {
        setCsvErrors([`Missing required column(s): ${missing.join(', ')}`])
        return
      }

      const parsed = []
      const errs   = []

      lines.slice(1).forEach((row, i) => {
        const cols = row.split(',')
        const obj  = {}
        headers.forEach((key, idx) => { obj[key] = cols[idx]?.trim() ?? '' })

        if (!obj.student_id) { errs.push(`Row ${i + 2}: Missing student_id`); return }
        if (!obj.full_name)  { errs.push(`Row ${i + 2}: Missing full_name`);  return }
        parsed.push(obj)
      })

      setCsvStudents(parsed)
      if (errs.length) setCsvErrors(errs)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = async () => {
    if (csvStudents.length === 0) return
    setImporting(true)
    try {
      const result = await bulkCreate({ students: csvStudents })
      toast.success(`Imported: ${result.created} new, ${result.updated} updated`)
      if (result.errors?.length) toast.warning(`${result.errors.length} row(s) skipped`)
      setCsvStudents([])
      setCsvFileName('')
      setCsvErrors([])
      fetchStudents()
    } catch {
      toast.error('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id)
      setStudents(prev => prev.filter(s => s.id !== id))
      toast.success('Student removed')
    } catch {
      toast.error('Failed to delete student')
    }
  }

  // ── Manual Add ────────────────────────────────────────────────────────────

  const handleManualAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { course_id, ...studentData } = form
      const payload = { students: [studentData] }
      if (course_id) payload.course_id = course_id
      const result = await bulkCreate(payload)
      if (result.errors?.length) {
        toast.error(result.errors[0])
      } else {
        toast.success('Student added successfully')
        setForm({ student_id: '', full_name: '', email: '', course_id: '' })
        setShowModal(false)
        fetchStudents()
      }
    } catch {
      toast.error('Failed to add student')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Download Template ─────────────────────────────────────────────────────

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'students_template.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (
      s.student_id?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q)  ||
      s.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#ebf6ec] p-6 text-[#0f172a]">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#13462D]">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add students manually or import via CSV</p>
        </div>
        <button
          onClick={() => { setForm({ student_id: '', full_name: '', email: '', course_id: '' }); setShowModal(true) }}
          className="flex items-center gap-2 bg-[#13462D] text-white px-5 py-2.5 rounded-xl shadow hover:opacity-90 font-semibold"
        >
          <FaPlus className="text-xs" />
          Add Student
        </button>
      </div>

      {/* ── CSV Import Section ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md mb-6 border border-[#dae6dd] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#dae6dd]">
          <h2 className="text-base font-semibold text-[#13462D]">Import Students via CSV</h2>
        </div>

        {/* Format Instructions */}
        <div className="p-5 bg-amber-50 border-b border-amber-100">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-amber-500 text-lg mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 mb-3">CSV Format Requirements</p>

              {/* Column guide table */}
              <div className="overflow-x-auto rounded-lg border border-amber-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left px-3 py-2 text-amber-900 font-semibold">Column Name</th>
                      <th className="text-left px-3 py-2 text-amber-900 font-semibold">Required</th>
                      <th className="text-left px-3 py-2 text-amber-900 font-semibold">Example Value</th>
                      <th className="text-left px-3 py-2 text-amber-900 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {CSV_COLUMNS.map(col => (
                      <tr key={col.name}>
                        <td className="px-3 py-2 font-mono font-semibold text-amber-900">{col.name}</td>
                        <td className="px-3 py-2">
                          {col.required
                            ? <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold text-[10px]">Required</span>
                            : <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">Optional</span>
                          }
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">{col.example}</td>
                        <td className="px-3 py-2 text-slate-600">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sample preview */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Sample CSV content:</p>
                <pre className="text-xs bg-amber-100 text-amber-900 rounded-lg p-3 font-mono overflow-x-auto whitespace-pre-wrap">
{`student_id,full_name,email
STU001,John Smith,john@example.com
STU002,Jane Doe,jane@example.com`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="p-5 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-[#13462D] text-white px-5 py-2.5 rounded-xl hover:opacity-90 font-semibold text-sm"
          >
            <FaUpload className="text-xs" />
            Browse CSV File
          </button>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 border border-[#13462D] text-[#13462D] px-5 py-2.5 rounded-xl hover:bg-[#ebf6ec] font-semibold text-sm transition-colors"
          >
            <FaDownload className="text-xs" />
            Download Template
          </button>
          {csvFileName && (
            <span className="text-sm text-slate-500 flex items-center gap-1.5">
              <span className="text-base">📄</span>
              {csvFileName}
            </span>
          )}
        </div>

        {/* Validation Errors */}
        {csvErrors.length > 0 && (
          <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700 mb-1.5">Issues found in CSV:</p>
            <ul className="space-y-0.5">
              {csvErrors.map((err, i) => (
                <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">•</span>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CSV Preview */}
        {csvStudents.length > 0 && (
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">
                {csvStudents.length} student{csvStudents.length !== 1 ? 's' : ''} ready to import
              </p>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60 transition-colors"
              >
                {importing ? 'Importing…' : `Import ${csvStudents.length} Students`}
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#dae6dd]">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#13462D] text-white text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Student ID</th>
                    <th className="px-3 py-2.5">Full Name</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dae6dd]">
                  {csvStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-[#f4fbf5]">
                      <td className="px-3 py-2 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{s.student_id}</td>
                      <td className="px-3 py-2">{s.full_name}</td>
                      <td className="px-3 py-2 text-slate-500">{s.email || '—'}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setCsvStudents(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Students Table ────────────────────────────────────────────────── */}
      <div className="bg-white shadow-md rounded-2xl border border-[#dae6dd] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#dae6dd] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-base font-semibold text-[#13462D]">
            All Students{' '}
            <span className="text-sm font-normal text-slate-400">({students.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by ID, name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-[#c1d8c5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#13462D] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dae6dd]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    Loading students…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FaUserGraduate className="text-3xl opacity-30" />
                      <p className="text-sm">
                        {search ? 'No students match your search' : 'No students yet — add one or import a CSV'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-[#f4fbf5] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.student_id}</td>
                    <td className="px-4 py-3 font-medium">{student.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{student.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {student.courses?.length > 0
                          ? student.courses.map(c => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-100"
                              >
                                {c.code}
                              </span>
                            ))
                          : <span className="text-slate-400 text-xs">No courses</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FaTrash className="text-[10px]" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Student Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) { setForm({ student_id: '', full_name: '', email: '', course_id: '' }); setShowModal(false) } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ebf6ec] flex items-center justify-center">
                  <FaUserGraduate className="text-[#13462D] text-sm" />
                </div>
                <h3 className="text-base font-bold text-[#13462D]">Add Student Manually</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleManualAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  placeholder="e.g. STU001"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D] transition"
                />
                <p className="text-xs text-slate-400 mt-1">Must be unique within your institution</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. john@example.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D] transition"
                />
                <p className="text-xs text-slate-400 mt-1">Used to send feedback form links</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Assign to Course{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <Select.Root
                  value={form.course_id || '__none__'}
                  onValueChange={val => setForm(f => ({ ...f, course_id: val === '__none__' ? '' : val }))}
                  disabled={coursesLoading}
                >
                  <Select.Trigger className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D] transition disabled:opacity-60">
                    <Select.Value />
                    <Select.Icon>
                      <FaChevronDown className="text-slate-400 text-xs" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={6}
                      className="z-[9999] w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                    >
                      <Select.Viewport className="max-h-52 overflow-y-auto p-1">
                        <Select.Item
                          value="__none__"
                          className="flex items-center px-3 py-2 text-sm text-slate-400 rounded-lg cursor-pointer select-none outline-none hover:bg-slate-50 data-[highlighted]:bg-slate-50"
                        >
                          <Select.ItemText>{coursesLoading ? 'Loading courses…' : 'No course'}</Select.ItemText>
                        </Select.Item>
                        {courses.map(c => (
                          <Select.Item
                            key={c.id}
                            value={String(c.id)}
                            className="flex items-center px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer select-none outline-none hover:bg-[#ebf6ec] data-[highlighted]:bg-[#ebf6ec] data-[state=checked]:font-semibold data-[state=checked]:text-[#13462D]"
                          >
                            <Select.ItemText>
                              <span className="font-mono text-xs text-slate-500 mr-1.5">{c.code}</span>
                              {c.title}
                              <span className="ml-1.5 text-xs text-slate-400">({c.academic_year})</span>
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                <p className="text-xs text-slate-400 mt-1">Student will be enrolled in this course</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#13462D] text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {submitting ? 'Adding…' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
