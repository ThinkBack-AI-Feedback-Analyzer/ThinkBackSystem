import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaEllipsisV } from 'react-icons/fa'

export function RowActions({ actions }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 6,
      left: rect.right,
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const menu = open && createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: coords.top, left: coords.left, transform: 'translateX(-100%)', zIndex: 9999 }}
      className="w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={action.disabled}
          onClick={() => { setOpen(false); action.onClick() }}
          className={[
            'flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed',
            action.variant === 'danger'
              ? 'text-red-600 hover:bg-red-50'
              : 'text-slate-700 hover:bg-slate-50',
          ].join(' ')}
        >
          {action.icon && <action.icon className="text-xs shrink-0" />}
          {action.label}
        </button>
      ))}
    </div>,
    document.body,
  )

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openMenu}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
        aria-label="Actions"
      >
        <FaEllipsisV className="text-xs" />
      </button>
      {menu}
    </>
  )
}
