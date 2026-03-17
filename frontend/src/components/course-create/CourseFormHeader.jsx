function CourseFormHeader({ onBack }) {
  return (
    <div className="mb-8 flex flex-col gap-5 rounded-[28px] bg-[#c7e0cf] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 rounded-2xl p-2 text-slate-900 transition hover:bg-white/50"
          aria-label="Go back"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-[#124f2f] md:text-4xl">
            Create New Course
          </h1>
          <p className="mt-2 text-lg text-[#315443] md:text-xl">
            Add a new course to your curriculum
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 self-end lg:self-auto">
        <button
          type="button"
          className="rounded-2xl p-2 text-[#124f2f] transition hover:bg-white/40"
          aria-label="Notifications"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .738-1.674C19.41 13.858 18 12.054 18 8a6 6 0 1 0-12 0c0 4.054-1.411 5.858-2.738 7.326Z" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-[#4d6557] shadow-sm"
            aria-label="Anonymous profile"
            role="img"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 20a6 6 0 0 0-12 0" />
              <circle cx="12" cy="10" r="4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#234532]">
              Stefen
            </h3>
            <p className="text-sm text-slate-600">stefen@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseFormHeader
