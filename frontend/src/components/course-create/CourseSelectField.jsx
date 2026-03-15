function CourseSelectField({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  inputClassName = 'border-slate-300 bg-white',
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-semibold text-slate-800 md:text-lg"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl border px-4 py-4 pr-12 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 md:text-lg ${inputClassName}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default CourseSelectField
