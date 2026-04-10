import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopBar from '../components/common/DashboardTopBar'
import institutionLogo from '../assets/Logo_4.png'
import CourseFileUpload from '../components/course-create/CourseFileUpload'
import CourseFormActions from '../components/course-create/CourseFormActions'
import CourseFormField from '../components/course-create/CourseFormField'
import CourseFormTextarea from '../components/course-create/CourseFormTextarea'
import CourseSelectField from '../components/course-create/CourseSelectField'

function buildInitialFormData(courseInfo) {
  return {
    courseTitle: courseInfo?.courseName ?? '',
    courseCode: courseInfo?.courseCode ?? '',
    facultyName: courseInfo?.facultyName ?? '',
    academicYear: courseInfo?.academicYear ?? '',
    description: courseInfo?.description ?? '',
    coordinator: courseInfo?.coordinatorName ?? '',
    lecturers: courseInfo?.lecturerName ?? '',
    studentFile: null,
  }
}

const academicYearOptions = ['2024-2025', '2025-2026', '2026-2027', '2027-2028']
const softInputClassName = 'border-[#d9e2db] bg-[#f8fbf9]'
const pageContentByMode = {
  create: {
    title: 'Create New Course',
    description:
      'Add a new course to your curriculum and upload student details when needed.',
    submitLabel: 'Save Course',
    successMessage: 'Course saved successfully.',
  },
  edit: {
    title: 'Update Course',
    description:
      'Update this course information and keep the curriculum details accurate.',
    submitLabel: 'Update Course',
    successMessage: 'Course updated successfully.',
  },
  view: {
    title: 'Course Details',
    description: 'Review the selected course information for this specific course.',
    submitLabel: 'Save Course',
    successMessage: '',
  },
}

function CourseCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authState] = useState(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      return { user: null, loading: false }
    }

    try {
      return { user: JSON.parse(storedUser), loading: false }
    } catch {
      return { user: null, loading: false }
    }
  })
  const initialFormData = useMemo(
    () => buildInitialFormData(location.state?.courseInfo),
    [location.state],
  )
  const pageMode = location.state?.mode === 'edit' || location.state?.mode === 'view'
    ? location.state.mode
    : 'create'
  const isViewMode = pageMode === 'view'
  const pageContent = pageContentByMode[pageMode]
  const [formData, setFormData] = useState(initialFormData)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setFormData(initialFormData)
    setStatusMessage('')
  }, [initialFormData, pageMode])

  useEffect(() => {
    if (!authState.user) {
      navigate('/login')
      return
    }

    if (authState.user.role !== 'institution_admin') {
      navigate('/')
    }
  }, [authState.user, navigate])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleSidebarNavigation = useCallback(
    (key) => {
      const routeMap = {
        dashboard: '/institution-dashboard',
        courses: '/courses',
        feedback: '/feedbackForm',
        users: '/student-management',
      }

      const targetRoute = routeMap[key]

      if (targetRoute) {
        navigate(targetRoute)
      }
    },
    [navigate],
  )

  function handleChange(event) {
    if (isViewMode) {
      return
    }

    const { name, value, files } = event.target

    if (name === 'studentFile') {
      setFormData((previousData) => ({
        ...previousData,
        studentFile: files?.[0] ?? null,
      }))
      return
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  function handleReset() {
    setFormData(initialFormData)
    setStatusMessage('')
  }

  function handleCancel() {
    navigate('/courses')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (isViewMode) {
      return
    }

    setStatusMessage(pageContent.successMessage)
  }

  if (!authState.user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dash-wrapper">
      <DashboardSidebar
        activeNav="courses"
        onNavChange={handleSidebarNavigation}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="dashboard-main">
        <DashboardTopBar
          userName={authState.user.full_name}
          userEmail={authState.user.email}
          searchPlaceholder="Search courses"
        />

        <section className="dashboard-page-intro px-4 pb-4 md:px-6 md:pb-6">
          <div className="mx-auto mb-5 max-w-6xl rounded-[24px] border border-[#d8e7dd] bg-white px-6 py-5 shadow-sm md:px-8">
            <h1 className="text-2xl font-bold text-[#124f2f] md:text-3xl">
              {pageContent.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              {pageContent.description}
            </p>
          </div>

          <div className="mx-auto max-w-6xl rounded-[32px] bg-white px-6 py-7 shadow-md md:px-10 md:py-9">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <CourseFormField
                  id="courseTitle"
                  name="courseTitle"
                  label="Course Title / Name"
                  placeholder="Enter the official course title"
                  value={formData.courseTitle}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseFormField
                  id="courseCode"
                  name="courseCode"
                  label="Course Code"
                  placeholder="Enter the unique course code"
                  value={formData.courseCode}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseFormField
                  id="facultyName"
                  name="facultyName"
                  label="Faculty Name"
                  placeholder="Enter the faculty name"
                  value={formData.facultyName}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseSelectField
                  id="academicYear"
                  name="academicYear"
                  label="Academic Year"
                  placeholder="Select Academic Year"
                  options={academicYearOptions}
                  value={formData.academicYear}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
              </div>

              <CourseFormTextarea
                id="description"
                name="description"
                label="Description (optional)"
                placeholder="A short summary of what the course is about."
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                compact
                rows={4}
                inputClassName={softInputClassName}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <CourseFormField
                  id="coordinator"
                  name="coordinator"
                  label="Coordinator Name"
                  placeholder="Name of the course coordinator"
                  value={formData.coordinator}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseFormField
                  id="lecturers"
                  name="lecturers"
                  label="Lecturer Name(s)"
                  placeholder="One or more lecturers teaching the course"
                  value={formData.lecturers}
                  onChange={handleChange}
                  disabled={isViewMode}
                  compact
                  inputClassName={softInputClassName}
                />
              </div>

              <CourseFileUpload
                selectedFileName={formData.studentFile?.name}
                onChange={handleChange}
                disabled={isViewMode}
              />

              {statusMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
                  {statusMessage}
                </div>
              ) : null}

              <CourseFormActions
                onReset={handleReset}
                onCancel={handleCancel}
                submitLabel={pageContent.submitLabel}
                hideSubmit={isViewMode}
                hideReset={isViewMode}
                cancelLabel={isViewMode ? 'Back to Courses' : 'Cancel'}
              />
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CourseCreatePage
