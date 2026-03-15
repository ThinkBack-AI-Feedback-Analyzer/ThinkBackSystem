import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseIntroAside from '../components/course-create/CourseIntroAside'
import CourseIntroForm from '../components/course-create/CourseIntroForm'

const initialFormData = {
  courseName: '',
  courseCode: '',
  department: '',
  semester: '',
  description: '',
  coordinatorName: '',
  lecturerName: '',
}

function CreateCourseIntroPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleReset() {
    setFormData(initialFormData)
  }

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/course-create', { state: { courseInfo: formData } })
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="flex min-h-screen">
        <section className="flex w-full items-center justify-center px-6 py-10 md:w-3/5">
          <CourseIntroForm
            formData={formData}
            onChange={handleChange}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        </section>

        <CourseIntroAside />
      </div>
    </div>
  )
}

export default CreateCourseIntroPage
