function CourseFileUpload({ selectedFileName, onChange }) {
  return (
    <div className="group relative block">
      <label
        htmlFor="studentFile"
        className="absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm"
      >
        Student Details
      </label>
      <span className="pointer-events-none absolute right-5 top-5 z-10 h-2.5 w-2.5 rounded-full bg-[#c3d8c8]" />
      <div className="rounded-[26px] border border-dashed border-[#c7d3c9] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7f2_100%)] p-5 shadow-sm transition duration-200 hover:border-[#9db7a5] hover:shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#56836c]">
              Student Roster
            </p>
            <p className="mt-2 font-semibold text-slate-800">
              Upload student file
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedFileName ?? 'Upload CSV, XLS, or XLSX'}
            </p>
          </div>
          <label
            htmlFor="studentFile"
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#184d35] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(24,77,53,0.2)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Choose File
          </label>
        </div>
        <input
          id="studentFile"
          type="file"
          name="studentFile"
          onChange={onChange}
          className="hidden"
          accept=".csv,.xls,.xlsx"
        />
      </div>
      {selectedFileName ? (
        <p className="mt-3 pl-2 text-sm font-medium text-emerald-700">
          Selected file: {selectedFileName}
        </p>
      ) : null}
      <p className="mt-2 pl-2 text-xs leading-5 text-[#61726a]">
        Upload an Excel or CSV file containing student names, IDs, and emails.
      </p>
    </div>
  )
}

export default CourseFileUpload
