function CourseFileUpload({ selectedFileName, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-800 md:text-base">
        Student Details <span className="font-normal">(optional)</span>
      </label>
      <p className="mb-3 text-xs leading-5 text-slate-500 md:text-sm">
        Upload an Excel or CSV file containing student information such as
        name, student ID, and email.
      </p>

      <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50">
        <span className="mb-2 rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 8 5-5 5 5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <span className="text-base font-semibold text-slate-800 md:text-lg">
          Click to upload or drag and drop
        </span>
        <span className="mt-1.5 text-xs text-slate-500 md:text-sm">
          Excel (.xlsx, .xls) or CSV files only
        </span>
        <input
          type="file"
          name="studentFile"
          onChange={onChange}
          className="hidden"
          accept=".csv,.xls,.xlsx"
        />
      </label>

      {selectedFileName ? (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          Selected file: {selectedFileName}
        </p>
      ) : null}
    </div>
  )
}

export default CourseFileUpload
