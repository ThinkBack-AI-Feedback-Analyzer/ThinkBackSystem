function CourseSelectField({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  compact = false,
  inputClassName = 'border-slate-300 bg-white',
}) {
  const labelClassName = compact
    ? 'absolute left-4 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#244e39] shadow-sm'
    : 'absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm'

  const selectClassName = compact
    ? 'w-full appearance-none rounded-2xl border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-4 py-3 pr-14 text-sm text-slate-800 shadow-sm outline-none transition duration-200 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'
    : 'w-full appearance-none rounded-3xl border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-4 pr-16 text-base text-slate-800 shadow-sm outline-none transition duration-200 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'

  const iconWrapperClassName = compact
    ? 'pointer-events-none absolute right-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#e9f2ec] text-[#184d35] shadow-sm'
    : 'pointer-events-none absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#e9f2ec] text-[#184d35] shadow-sm'

  return (
    <div className="group relative block">
      <span className="pointer-events-none absolute inset-x-3 bottom-3 top-3 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(24,77,53,0.08),transparent_65%)] opacity-0 transition duration-300 group-focus-within:opacity-100" />
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <span className="pointer-events-none absolute right-5 top-5 z-10 h-2.5 w-2.5 rounded-full bg-[#c3d8c8] transition duration-300 group-focus-within:bg-[#184d35] group-focus-within:shadow-[0_0_0_7px_rgba(24,77,53,0.12)]" />
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${selectClassName} ${inputClassName}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={iconWrapperClassName}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default CourseSelectField
