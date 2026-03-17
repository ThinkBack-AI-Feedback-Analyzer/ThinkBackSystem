import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CourseFileUpload from '../components/course-create/CourseFileUpload'
import CourseFormActions from '../components/course-create/CourseFormActions'
import CourseFormField from '../components/course-create/CourseFormField'
import CourseFormHeader from '../components/course-create/CourseFormHeader'
import CourseFormSidebar from '../components/course-create/CourseFormSidebar'
import CourseFormTextarea from '../components/course-create/CourseFormTextarea'
import CourseSelectField from '../components/course-create/CourseSelectField'

function buildInitialFormData(courseInfo) {
  return {
    courseTitle: courseInfo?.courseName ?? '',
    courseCode: courseInfo?.courseCode ?? '',
    department: courseInfo?.department ?? '',
    semester: courseInfo?.semester ?? '',
    description: courseInfo?.description ?? '',
    coordinator: courseInfo?.coordinatorName ?? '',
    lecturers: courseInfo?.lecturerName ?? '',
    studentFile: null,
  }
}

const semesterOptions = ['Semester 1', 'Semester 2', 'Year 1', 'Year 2']
const softInputClassName = 'border-[#d9e2db] bg-[#f8fbf9]'

function CourseCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialFormData = useMemo(
    () => buildInitialFormData(location.state?.courseInfo),
    [location.state],
  )
  const [formData, setFormData] = useState(initialFormData)
  const [statusMessage, setStatusMessage] = useState('')

  function handleChange(event) {
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
    navigate('/institution-dashboard')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setStatusMessage('Course saved successfully.')
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-slate-900">
      <div className="flex min-h-screen">
        <CourseFormSidebar />

        <main className="flex-1 p-4 md:p-6">
          <CourseFormHeader onBack={handleCancel} />

          <div className="mx-auto max-w-6xl rounded-[32px] bg-white px-6 py-7 shadow-md md:px-10 md:py-9">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#124f2f] md:text-4xl">
                Course Information
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500 md:text-sm">
                Complete the course profile and optionally upload the student
                roster for the first feedback cycle.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <CourseFormField
                  id="courseTitle"
                  name="courseTitle"
                  label="Course Title / Name"
                  placeholder="Enter the official course title"
                  value={formData.courseTitle}
                  onChange={handleChange}
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
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseFormField
                  id="department"
                  name="department"
                  label="Department / Faculty Name"
                  placeholder="Name of the faculty"
                  value={formData.department}
                  onChange={handleChange}
                  compact
                  inputClassName={softInputClassName}
                />
                <CourseSelectField
                  id="semester"
                  name="semester"
                  label="Semester / Academic Year"
                  placeholder="Select Semester"
                  options={semesterOptions}
                  value={formData.semester}
                  onChange={handleChange}
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
                  compact
                  inputClassName={softInputClassName}
                />
              </div>

              <CourseFileUpload
                selectedFileName={formData.studentFile?.name}
                onChange={handleChange}
              />

              {statusMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
                  {statusMessage}
                </div>
              ) : null}

              <CourseFormActions
                onReset={handleReset}
                onCancel={handleCancel}
              />
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CourseCreatePage
