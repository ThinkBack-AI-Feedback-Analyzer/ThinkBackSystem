import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FaBook, FaBuilding, FaCalendarAlt,
  FaClipboardList, FaEye, FaLayerGroup,
  FaPen, FaPlus, FaTrash,
} from 'react-icons/fa'
import { createColumnHelper } from '@tanstack/react-table'
import { RowActions } from '../../components/ui/RowActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import DashboardLayout from '../../components/common/DashboardLayout'
import { DataTable } from '../../components/ui/DataTable'
import { getCourses, deleteCourse } from '../../services/courses'
import { useCurrentUser } from '../../hooks/useSidebarNav'

const columnHelper = createColumnHelper()

function truncate(text, max = 40) {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`
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

/* ── Staff course card — read-only with "Create Form" navigate ── */
function StaffCourseCard({ course, userRole, onCreateForm }) {
  const isCoordinator = userRole === 'coordinator'
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200">
      <div className={`h-1 w-full ${isCoordinator ? 'bg-amber-400' : 'bg-sky-400'}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{course.code}</span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {course.academic_year}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 leading-snug mb-1">{course.title}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
          <FaBuilding className="shrink-0" />
          {course.faculty_name}
        </p>
        {course.description ? (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{course.description}</p>
        ) : (
          <p className="text-sm text-slate-300 italic mb-4">No description provided.</p>
        )}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
            isCoordinator
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-sky-50 text-sky-700 border-sky-100'
          }`}>
            {isCoordinator ? 'Coordinator' : 'Lecturer'}
          </span>
          <button
            type="button"
            onClick={() => onCreateForm(course)}
            className="flex items-center gap-1.5 rounded-xl bg-[#13462D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0f3a26]"
          >
            <FaClipboardList className="text-[10px]" /> Create Form
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Staff view: card grid ── */
function StaffCoursesView({ courses, isLoading, user, stats, navigate }) {
  const roleLabel = user.role === 'coordinator' ? 'Coordinator' : 'Lecturer'

  const handleCreateForm = (course) => {
    navigate('/staff-form-create', { state: { course } })
  }

  return (
    <>
      <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">My Courses</p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Your Assigned Courses</h1>
          <p className="mt-2 max-w-md text-sm text-white/60">
            Courses you are assigned to as {roleLabel}. Click <strong className="text-white/80">Create Form</strong> on any course to build a feedback form.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <StatPill icon={FaBook}       label="Assigned Courses" value={stats.total} />
            <StatPill icon={FaLayerGroup} label="Faculties"        value={stats.faculties} />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-6 md:py-8">
        {isLoading ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-16 text-center text-sm text-slate-400">
            Loading your courses…
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-16 text-center">
            <FaBook className="mx-auto mb-3 text-3xl text-slate-200" />
            <p className="text-sm font-medium text-slate-400">No courses assigned to you yet.</p>
            <p className="text-xs text-slate-300 mt-1">Contact your institution admin to be assigned to a course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => (
              <StaffCourseCard
                key={course.id}
                course={course}
                userRole={user.role}
                onCreateForm={handleCreateForm}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Admin view: full table with actions ── */
function AdminCoursesView({ courses, isLoading, stats, navigate, columns, onBulkDelete }) {
  return (
    <>
      <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Course Management</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Courses</h1>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Manage and maintain your institution&apos;s full course catalog in one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <StatPill icon={FaBook}        label="Total Courses"  value={stats.total} />
                <StatPill icon={FaBuilding}    label="Faculties"      value={stats.faculties} />
                <StatPill icon={FaCalendarAlt} label="Academic Years" value={stats.years} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/course-create')}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 lg:self-auto"
            >
              <FaPlus className="text-xs" />
              Create Course
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-12 text-center text-sm text-slate-400">
              Loading courses…
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={courses}
              searchPlaceholder="Search by title, code, faculty…"
              pageSize={8}
              onDeleteSelected={onBulkDelete}
              filterDefs={[
                { column: 'faculty_name',   label: 'Faculty' },
                { column: 'academic_year',  label: 'Year' },
              ]}
            />
          )}
        </div>
      </div>
    </>
  )
}

/* ── Page ── */
function CoursesPage() {
  const navigate = useNavigate()
  const authUser = useCurrentUser()
  const authState = { user: authUser }
  const [courses, setCourses]           = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const isAdmin = authState.user?.role === 'institution_admin'

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(authState.user.role)) navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    if (!authState.user) return
    setIsLoading(true)
    getCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load courses.'))
      .finally(() => setIsLoading(false))
  }, [authState.user])

  const courseInfo = (course) => ({
    id:              course.id,
    courseName:      course.title,
    courseCode:      course.code,
    facultyName:     course.faculty_name,
    academicYear:    course.academic_year,
    description:     course.description,
    coordinatorName: course.coordinator,
    lecturerName:    course.lecturer,
  })

  const handleView = useCallback((course) => {
    navigate('/course-create', { state: { mode: 'view', courseInfo: courseInfo(course) } })
  }, [navigate])

  const handleEdit = useCallback((course) => {
    navigate('/course-create', { state: { mode: 'edit', courseInfo: courseInfo(course) } })
  }, [navigate])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteCourse(deleteTarget.id)
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title}" deleted successfully.`)
    } catch {
      toast.error('Failed to delete course.')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleBulkDelete = useCallback(async (rows) => {
    await Promise.all(rows.map((r) => deleteCourse(r.id)))
    setCourses((prev) => prev.filter((c) => !rows.some((r) => r.id === c.id)))
    toast.success(`${rows.length} course${rows.length > 1 ? 's' : ''} deleted.`)
  }, [])

  const stats = useMemo(() => ({
    total:     courses.length,
    faculties: new Set(courses.map((c) => c.faculty_name)).size,
    years:     new Set(courses.map((c) => c.academic_year)).size,
  }), [courses])

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Course Title',
      cell: (info) => (
        <div>
          <p className="font-semibold text-[#124f2f]">{info.getValue()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{info.row.original.code}</p>
        </div>
      ),
    }),
    columnHelper.accessor('faculty_name', { header: 'Faculty' }),
    columnHelper.accessor('academic_year', {
      header: 'Academic Year',
      cell: (info) => (
        <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      enableSorting: false,
      cell: (info) => <span className="text-slate-400 text-xs">{truncate(info.getValue())}</span>,
    }),
    columnHelper.accessor('coordinator', {
      header: 'Coordinator',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('lecturer', {
      header: 'Lecturer',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original
        return (
          <RowActions actions={[
            { label: 'View',   icon: FaEye,   onClick: () => handleView(course) },
            { label: 'Edit',   icon: FaPen,   onClick: () => handleEdit(course) },
            { label: 'Delete', icon: FaTrash, variant: 'danger', onClick: () => setDeleteTarget({ id: course.id, title: course.title }) },
          ]} />
        )
      },
    }),
  ], [handleView, handleEdit])

  if (!authState.user) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>
  }

  return (
    <DashboardLayout activeNav="courses">

        {isAdmin ? (
          <AdminCoursesView
            courses={courses}
            isLoading={isLoading}
            stats={stats}
            navigate={navigate}
            columns={columns}
            onBulkDelete={handleBulkDelete}
          />
        ) : (
          <StaffCoursesView
            courses={courses}
            isLoading={isLoading}
            user={authState.user}
            stats={stats}
            navigate={navigate}
          />
        )}

      {isAdmin && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          title="Delete Course"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
        />
      )}
    </DashboardLayout>
  )
}

export default CoursesPage
