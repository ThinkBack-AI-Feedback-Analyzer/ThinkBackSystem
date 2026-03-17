function CourseFormField({
  id,
  label,
  name,
  placeholder,
  value,
  onChange,
  type = 'text',
  compact = false,
  inputClassName = 'border-slate-300 bg-white',
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-slate-700 ${
          compact ? 'mb-1.5 text-xs font-semibold' : 'mb-2 text-sm font-medium'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 ${
          compact
            ? 'rounded-lg px-3.5 py-3 text-sm'
            : 'rounded-xl px-4 py-4'
        } ${inputClassName}`}
      />
    </div>
  )
}

export default CourseFormField
