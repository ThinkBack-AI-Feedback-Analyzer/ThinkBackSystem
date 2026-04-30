import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaFilter, FaPen, FaTrash } from 'react-icons/fa'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopBar from '../components/common/DashboardTopBar'
import institutionLogo from '../assets/Logo_4.png'

const initialCourses = [
  {
    id: 1,
    title: 'Introduction to Software Engineering',
    code: 'SE201',
    facultyName: 'Faculty of Engineering',
    departmentName: 'Department of Software Engineering',
    semester: 'Semester 1',
    year: '2025',
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
    departmentName: 'Department of Computer Science',
    semester: 'Semester 2',
    year: '2025',
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
    departmentName: 'Department of Information Technology',
    semester: 'Semester 1',
    year: '2026',
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
    departmentName: 'Department of Computer Science',
    semester: 'Semester 2',
    year: '2026',
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

const filterColumns = [
  { value: 'title', label: 'Course Title' },
  { value: 'code', label: 'Course Code' },
  { value: 'departmentName', label: 'Department Name' },
  { value: 'semester', label: 'Semester' },
  { value: 'year', label: 'Year' },
]

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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(filterColumns[0].value)
  const [selectedValue, setSelectedValue] = useState('')
  const [filteredCourses, setFilteredCourses] = useState(initialCourses)

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
    setCourses((currentCourses) => {
      const updatedCourses = currentCourses.filter((course) => course.id !== courseId)

      setFilteredCourses((currentFilteredCourses) =>
        currentFilteredCourses.filter((course) => course.id !== courseId),
      )

      return updatedCourses
    })
  }, [])

  const availableFilterValues = Array.from(
    new Set(
      courses
        .map((course) => course[selectedColumn])
        .filter((value) => value !== undefined && value !== null && value !== ''),
    ),
  )

  const handleColumnChange = useCallback((event) => {
    setSelectedColumn(event.target.value)
    setSelectedValue('')
  }, [])

  const handleApplyFilter = useCallback(() => {
    if (!selectedValue) {
      setFilteredCourses(courses)
      setIsFilterPanelOpen(false)
      return
    }

    const nextFilteredCourses = courses.filter(
      (course) => course[selectedColumn] === selectedValue,
    )

    setFilteredCourses(nextFilteredCourses)
    setIsFilterPanelOpen(false)
  }, [courses, selectedColumn, selectedValue])

  const handleClearFilter = useCallback(() => {
    setSelectedColumn(filterColumns[0].value)
    setSelectedValue('')
    setFilteredCourses(courses)
    setIsFilterPanelOpen(false)
  }, [courses])

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

          <div className="mx-auto mb-4 flex max-w-7xl justify-center sm:justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen((current) => !current)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe0d5] bg-[#f6fbf8] px-4 py-2 text-sm font-semibold text-[#124f2f] shadow-sm transition hover:border-[#13462D] hover:bg-[#edf7f1]"
              >
                <FaFilter className="text-xs" />
                Filter
              </button>

              {isFilterPanelOpen ? (
                <div className="absolute right-0 top-14 z-20 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-[#d8e7dd] bg-white p-4 shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="course-filter-column"
                        className="mb-1.5 block text-sm font-semibold text-[#124f2f]"
                      >
                        Filter Column
                      </label>
                      <select
                        id="course-filter-column"
                        value={selectedColumn}
                        onChange={handleColumnChange}
                        className="w-full rounded-xl border border-[#cfe0d5] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#13462D] focus:ring-2 focus:ring-[#d8e7dd]"
                      >
                        {filterColumns.map((column) => (
                          <option key={column.value} value={column.value}>
                            {column.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="course-filter-value"
                        className="mb-1.5 block text-sm font-semibold text-[#124f2f]"
                      >
                        Filter Value
                      </label>
                      <select
                        id="course-filter-value"
                        value={selectedValue}
                        onChange={(event) => setSelectedValue(event.target.value)}
                        className="w-full rounded-xl border border-[#cfe0d5] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#13462D] focus:ring-2 focus:ring-[#d8e7dd]"
                      >
                        <option value="">Select a value</option>
                        {availableFilterValues.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleClearFilter}
                        className="inline-flex items-center justify-center rounded-xl border border-[#cfe0d5] bg-white px-4 py-2 text-sm font-semibold text-[#124f2f] transition hover:bg-[#f6fbf8]"
                      >
                        Clear Filter
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilter}
                        className="inline-flex items-center justify-center rounded-xl bg-[#13462D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
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
                  {filteredCourses.map((course) => (
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

            {filteredCourses.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                {courses.length === 0
                  ? 'No courses available right now.'
                  : 'No matching courses found for the selected filter.'}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

export default CoursesPage
