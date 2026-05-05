import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FaBook, FaBuilding, FaCalendarAlt, FaEye, FaPen, FaPlus, FaTrash } from 'react-icons/fa'
import { createColumnHelper } from '@tanstack/react-table'
import { RowActions } from '../../components/ui/RowActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar from '../../components/common/DashboardTopBar'
import { DataTable } from '../../components/ui/DataTable'
import institutionLogo from '../../assets/Logo_4.png'
import { getCourses, deleteCourse } from '../../services/courses'

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

function CoursesPage() {
  const navigate = useNavigate()
  const [authState] = useState(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return { user: null }
    try { return { user: JSON.parse(storedUser) } }
    catch { return { user: null } }
  })
  const [courses, setCourses]         = useState([])
  const [isLoading, setIsLoading]     = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, title }

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    if (authState.user.role !== 'institution_admin') navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    if (!authState.user) return
    setIsLoading(true)
    getCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load courses.'))
      .finally(() => setIsLoading(false))
  }, [authState.user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleSidebarNavigation = useCallback((key) => {
    if (key === 'invite') { navigate('/manage-users', { state: { openInvite: true } }); return }
    const routeMap = {
      dashboard: '/institution-dashboard',
      courses: '/courses',
      feedback: '/feedback-forms',
      users: '/manage-users',
    }
    const route = routeMap[key]
    if (route) navigate(route)
  }, [navigate])

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
      cell: (info) => (
        <span className="text-slate-400 text-xs">{truncate(info.getValue())}</span>
      ),
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DashboardSidebar
        activeNav="courses"
        onNavChange={handleSidebarNavigation}
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

        {/* ── Hero banner ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
                  Course Management
                </p>
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

        {/* ── Table ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="rounded-[32px] bg-white shadow-md px-6 py-12 text-center text-sm text-slate-400">
                Loading courses…
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={courses}
                searchPlaceholder="Search by title, code, faculty…"
                pageSize={8}
              />
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default CoursesPage
