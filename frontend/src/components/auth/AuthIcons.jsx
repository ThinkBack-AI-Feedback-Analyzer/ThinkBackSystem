function BaseAuthIcon({ children }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function UserIcon() {
  return (
    <BaseAuthIcon>
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </BaseAuthIcon>
  )
}

export function EnvelopeIcon() {
  return (
    <BaseAuthIcon>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m5 7 7 6 7-6" />
    </BaseAuthIcon>
  )
}

export function UniversityIcon() {
  return (
    <BaseAuthIcon>
      <path d="m3 9 9-4 9 4-9 4-9-4Z" />
      <path d="M6 11.5V17" />
      <path d="M10 13.5V17" />
      <path d="M14 13.5V17" />
      <path d="M18 11.5V17" />
      <path d="M4 19h16" />
    </BaseAuthIcon>
  )
}

export function LockIcon() {
  return (
    <BaseAuthIcon>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      <path d="M12 15v2.5" />
    </BaseAuthIcon>
  )
}
