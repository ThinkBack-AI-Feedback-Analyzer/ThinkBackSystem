function CourseSelectField({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  inputClassName = 'border-slate-300 bg-white',
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-slate-800 ${
          compact
            ? 'mb-1.5 text-xs font-semibold'
            : 'mb-2 text-base font-semibold md:text-lg'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none border text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 ${
            compact
              ? 'rounded-lg px-3.5 py-3 pr-10 text-sm'
              : 'rounded-xl px-4 py-4 pr-12 text-base md:text-lg'
          } ${inputClassName}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-500 ${
            compact ? 'right-3' : 'right-4'
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={compact ? 'h-4 w-4' : 'h-5 w-5'}
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
