import React, { useState, useRef, useEffect } from 'react'
import { FaEllipsisV } from 'react-icons/fa'

export function ActionMenu({ items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!items.length) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        title="More actions"
      >
        <FaEllipsisV size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false) }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed ${item.className || 'text-slate-600'}`}
            >
              {item.icon && <item.icon size={13} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
