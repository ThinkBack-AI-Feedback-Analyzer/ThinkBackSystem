import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaCheck, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'

/**
 * Searchable select dropdown — Radix Select doesn't support search natively
 * so this uses a portal + filter approach.
 *
 * options: { value, label }[]
 */
export function SearchSelect({
  id,
  name,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  options = [],
  disabled = false,
}) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [coords, setCoords]   = useState({ top: 0, left: 0, width: 0 })
  const btnRef    = useRef(null)
  const menuRef   = useRef(null)
  const inputRef  = useRef(null)

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const openMenu = () => {
    if (disabled) return
    setOpen(true)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return
    const updateCoords = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect()
        setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      }
    }
    updateCoords()
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const pick = (opt) => {
    onChange({ target: { name, value: opt.value } })
    setOpen(false)
    setQuery('')
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange({ target: { name, value: '' } })
  }

  const dropdown = open && createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      {/* Search input */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
        <FaSearch className="shrink-0 text-xs text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500 transition">
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Options list */}
      <ul className="max-h-52 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-slate-400 text-center">No results found</li>
        ) : (
          filtered.map((opt) => (
            <li
              key={opt.value}
              onClick={() => pick(opt)}
              className={[
                'flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition',
                opt.value === value
                  ? 'bg-emerald-50/70 font-semibold text-emerald-700'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800',
              ].join(' ')}
            >
              <span>{opt.label}</span>
              {opt.value === value && <FaCheck className="text-xs text-emerald-600 shrink-0" />}
            </li>
          ))
        )}
      </ul>
    </div>,
    document.body,
  )

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        onClick={openMenu}
        disabled={disabled}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm text-left outline-none transition',
          disabled
            ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-default'
            : open
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300',
        ].join(' ')}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          {selected && !disabled && (
            <span
              onClick={clear}
              className="flex h-4 w-4 items-center justify-center rounded-full text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition"
            >
              <FaTimes className="text-[9px]" />
            </span>
          )}
          <FaChevronDown
            className={`text-xs text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {dropdown}
    </>
  )
}
