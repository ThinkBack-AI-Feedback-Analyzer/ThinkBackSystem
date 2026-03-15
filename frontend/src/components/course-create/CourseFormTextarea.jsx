function CourseFormTextarea({
  id,
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 5,
  inputClassName = 'border-slate-300 bg-white',
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 ${inputClassName}`}
      />
    </div>
  )
}

export default CourseFormTextarea
