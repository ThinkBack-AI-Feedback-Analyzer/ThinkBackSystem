import CourseFormField from './CourseFormField'
import CourseFormTextarea from './CourseFormTextarea'

const softInputClassName = 'border-slate-200 bg-[#f8fbf9]'

function CourseIntroForm({ formData, onChange, onReset, onSubmit }) {
  return (
    <div className="w-full max-w-3xl rounded-[28px] bg-white p-8 shadow-xl shadow-slate-900/10 md:p-12">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Course setup
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[#124f2f]">
          Course Information
        </h1>
        <p className="mt-3 text-base text-slate-500">
          Add the essential academic details to create a clean course profile.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CourseFormField
            id="courseName"
            name="courseName"
            label="Course Name"
            placeholder="Enter the official course title"
            value={formData.courseName}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
          <CourseFormField
            id="courseCode"
            name="courseCode"
            label="Course Code"
            placeholder="Enter the unique course code"
            value={formData.courseCode}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
          <CourseFormField
            id="department"
            name="department"
            label="Department / Faculty"
            placeholder="Department name"
            value={formData.department}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
          <CourseFormField
            id="semester"
            name="semester"
            label="Semester / Academic Period"
            placeholder="The time period when the course is offered"
            value={formData.semester}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
        </div>

        <CourseFormTextarea
          id="description"
          name="description"
          label="Description"
          placeholder="Any note about the course"
          value={formData.description}
          onChange={onChange}
          inputClassName={softInputClassName}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CourseFormField
            id="coordinatorName"
            name="coordinatorName"
            label="Coordinator Name"
            placeholder="Name of the course coordinator"
            value={formData.coordinatorName}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
          <CourseFormField
            id="lecturerName"
            name="lecturerName"
            label="Lecturer Name"
            placeholder="One or more lecturers teaching the course"
            value={formData.lecturerName}
            onChange={onChange}
            inputClassName={softInputClassName}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-[#124f2f] px-8 py-3 text-lg font-semibold text-[#124f2f] transition hover:bg-[#124f2f] hover:text-white"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-[#124f2f] px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#0f4228]"
          >
            Create Course
          </button>
        </div>
      </form>
    </div>
  )
}

export default CourseIntroForm
