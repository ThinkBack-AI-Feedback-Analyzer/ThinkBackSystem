function ActionButton({ type = 'button', onClick, variant, children, icon }) {
  const baseClassName =
    'inline-flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition md:px-5'

  const variantClassName =
    variant === 'primary'
      ? 'bg-[#124f2f] text-white hover:bg-[#0f4228]'
      : 'border border-slate-300 text-[#124f2f] hover:bg-slate-100'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClassName} ${variantClassName}`}
    >
      {icon}
      {children}
    </button>
  )
}

function ActionIcon({ type }) {
  const commonProps = {
    'aria-hidden': 'true',
    viewBox: '0 0 24 24',
    className: 'h-[18px] w-[18px]',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (type === 'save') {
    return (
      <svg {...commonProps}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8" />
        <path d="M7 3v5h8" />
      </svg>
    )
  }

  if (type === 'reset') {
    return (
      <svg {...commonProps}>
        <path d="M3 2v6h6" />
        <path d="M3 8a9 9 0 1 0 2.64-6.36L3 4" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function CourseFormActions({ onReset, onCancel }) {
  return (
    <div className="flex flex-wrap gap-3">
      <ActionButton type="submit" variant="primary" icon={<ActionIcon type="save" />}>
        Save Course
      </ActionButton>
      <ActionButton variant="secondary" onClick={onReset} icon={<ActionIcon type="reset" />}>
        Reset
      </ActionButton>
      <ActionButton variant="secondary" onClick={onCancel} icon={<ActionIcon type="cancel" />}>
        Cancel
      </ActionButton>
    </div>
  )
}

export default CourseFormActions
