import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaPen, FaTrash } from 'react-icons/fa'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopBar from '../components/common/DashboardTopBar'
import institutionLogo from '../assets/Logo_4.png'

const initialCourses = [
  {
    id: 1,
    title: 'Introduction to Software Engineering',
    code: 'SE201',
    facultyName: 'Faculty of Engineering',
    academicYear: '2025-2026',
    description:
      'Foundations of software development processes, teamwork, modeling, and testing practices.',
    coordinator: 'Dr. Nadeesha Perera',
    lecturer: 'Prof. Malith Jayasinghe',
  },
  {
    id: 2,
    title: 'Database Management Systems',
    code: 'CS312',
    facultyName: 'Faculty of Science',
    academicYear: '2025-2026',
    description:
      'Relational database design, SQL, indexing, normalization, and transaction processing concepts.',
    coordinator: 'Dr. Hasini Fernando',
    lecturer: 'Ms. Tharushi Wickramasinghe',
  },
  {
    id: 3,
    title: 'Human Computer Interaction',
    code: 'IT224',
    facultyName: 'Faculty of Computing',
    academicYear: '2026-2027',
    description:
      'Designing accessible and user-centered interfaces with usability evaluation methods.',
    coordinator: 'Mr. Dilshan Rathnayake',
    lecturer: 'Dr. Sachini Gunawardena',
  },
  {
    id: 4,
    title: 'Data Structures and Algorithms',
    code: 'CS210',
    facultyName: 'Faculty of Science',
    academicYear: '2026-2027',
    description:
      'Core data structures, algorithm analysis, recursion, graph traversal, and optimization techniques.',
    coordinator: 'Dr. Kavindu Abeysekera',
    lecturer: 'Prof. Ishara De Silva',
  },
]

function truncateText(text, maxLength = 30) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

function CoursesPage() {
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
  const [courses, setCourses] = useState(initialCourses)

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

  const handleCreateCourse = useCallback(() => {
    navigate('/course-create')
  }, [navigate])

  const handleEditCourse = useCallback(
    (course) => {
      navigate('/course-create', {
        state: {
          mode: 'edit',
          courseInfo: {
            courseName: course.title,
            courseCode: course.code,
            facultyName: course.facultyName,
            academicYear: course.academicYear,
            description: course.description,
            coordinatorName: course.coordinator,
            lecturerName: course.lecturer,
          },
        },
      })
    },
    [navigate],
  )

  const handleViewCourse = useCallback(
    (course) => {
      navigate('/course-create', {
        state: {
          mode: 'view',
          courseInfo: {
            courseName: course.title,
            courseCode: course.code,
            facultyName: course.facultyName,
            academicYear: course.academicYear,
            description: course.description,
            coordinatorName: course.coordinator,
            lecturerName: course.lecturer,
          },
        },
      })
    },
    [navigate],
  )

  const handleDeleteCourse = useCallback((courseId) => {
    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== courseId),
    )
  }, [])

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
          <div className="mx-auto mb-5 flex max-w-7xl flex-col gap-4 rounded-[24px] border border-[#d8e7dd] bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#124f2f] md:text-3xl">
                Courses
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Review, manage, and maintain your institution&apos;s course
                catalog in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateCourse}
              className="inline-flex items-center justify-center rounded-xl bg-[#13462D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
            >
              + Create Course
            </button>
          </div>

          <div className="mx-auto max-w-7xl rounded-[32px] bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#13462D] text-sm font-semibold text-white">
                  <tr>
                    <th className="px-5 py-4">Course Title</th>
                    <th className="px-5 py-4">Course Code</th>
                    <th className="px-5 py-4">Faculty Name</th>
                    <th className="px-5 py-4">Academic Year</th>
                    <th className="px-5 py-4">Description</th>
                    <th className="px-5 py-4">Coordinator Name</th>
                    <th className="px-5 py-4">Lecturer Name</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[#e3ece6] text-sm text-slate-700 transition hover:bg-[#f6fbf8]"
                    >
                      <td className="px-5 py-4 font-semibold text-[#124f2f]">
                        {course.title}
                      </td>
                      <td className="px-5 py-4">{course.code}</td>
                      <td className="px-5 py-4">{course.facultyName}</td>
                      <td className="px-5 py-4">{course.academicYear}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {truncateText(course.description)}
                      </td>
                      <td className="px-5 py-4">{course.coordinator}</td>
                      <td className="px-5 py-4">{course.lecturer}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleViewCourse(course)}
                            aria-label={`View ${course.title}`}
                            title="View course"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#cfe0d5] bg-white text-sm text-[#124f2f] shadow-sm transition hover:border-[#13462D] hover:bg-[#f1f7f3]"
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditCourse(course)}
                            aria-label={`Edit ${course.title}`}
                            title="Edit course"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#b9d6c5] bg-[#e8f4ed] text-sm text-[#124f2f] shadow-sm transition hover:bg-[#d7ecdf]"
                          >
                            <FaPen />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id)}
                            aria-label={`Delete ${course.title}`}
                            title="Delete course"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f1c9cf] bg-[#fff1f3] text-sm text-[#b4233d] shadow-sm transition hover:bg-[#ffe3e8]"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {courses.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No courses available right now.
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

export default CoursesPage
