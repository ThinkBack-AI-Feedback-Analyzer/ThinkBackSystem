import { useCallback, useEffect, useState } from 'react'
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaSearch, FaCheckDouble, FaInbox } from 'react-icons/fa'
import SuperAdminLayout from '../../components/common/SuperAdminLayout'
import { getContactMessages, markMessageRead, deleteContactMessage } from '../../services/superadmin'
import { toast } from 'sonner'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatShort(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SenderAvatar({ name }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const palette = [
    'bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600',
    'bg-amber-100 text-amber-600', 'bg-pink-100 text-pink-600',
    'bg-teal-100 text-teal-600', 'bg-rose-100 text-rose-600',
  ]
  const color = palette[(name?.charCodeAt(0) || 0) % palette.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

function ConfirmDeleteDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Delete Message?</h3>
        <p className="text-sm text-slate-500 mb-6">This will permanently delete this message. This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read',   label: 'Read' },
]

export default function ContactMessagesPage() {
  const [messages,      setMessages]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [selected,      setSelected]      = useState(null)
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [markingAll,    setMarkingAll]    = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getContactMessages()
      setMessages(data)
    } catch {
      toast.error('Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleOpen = async (msg) => {
    setSelected(msg)
    if (!msg.is_read) {
      try {
        const updated = await markMessageRead(msg.id)
        setMessages(prev => prev.map(m => m.id === msg.id ? updated : m))
        setSelected(updated)
      } catch {}
    }
  }

  const handleDeleteRequest = (id, e) => {
    e.stopPropagation()
    setPendingDelete(id)
  }

  const handleDeleteConfirm = async () => {
    const id = pendingDelete
    setPendingDelete(null)
    try {
      await deleteContactMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Message deleted.')
    } catch {
      toast.error('Failed to delete message.')
    }
  }

  const handleMarkAllRead = async () => {
    const unread = messages.filter(m => !m.is_read)
    if (!unread.length) return
    setMarkingAll(true)
    try {
      const updated = await Promise.all(unread.map(m => markMessageRead(m.id)))
      const map = Object.fromEntries(updated.map(m => [m.id, m]))
      setMessages(prev => prev.map(m => map[m.id] ?? m))
      if (selected && map[selected.id]) setSelected(map[selected.id])
      toast.success('All messages marked as read.')
    } catch {
      toast.error('Failed to mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  const filtered = messages.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'unread' && !m.is_read) ||
      (filter === 'read'   &&  m.is_read)
    return matchSearch && matchFilter
  })

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Contact Messages</h1>
            <p className="text-xs text-slate-400 mt-0.5">Messages from the landing page contact form</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                <FaEnvelope size={9} /> {unreadCount} unread
              </span>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FaCheckDouble size={11} />
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email or subject…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shrink-0">
            {FILTERS.map(f => {
              const count = f.key === 'unread' ? messages.filter(m => !m.is_read).length
                : f.key === 'read' ? messages.filter(m => m.is_read).length
                : messages.length
              return (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f.key ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {f.label}
                  {count > 0 && (
                    <span className={`ml-1.5 ${filter === f.key ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="grid gap-3 lg:grid-cols-[300px_1fr]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <FaInbox className="mx-auto mb-3 text-4xl text-slate-200" />
            <p className="text-sm text-slate-400">
              {search ? 'No messages match your search.' : filter !== 'all' ? `No ${filter} messages.` : 'No messages yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:items-start">

            {/* Message list */}
            <div className="space-y-2 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
              {filtered.map(msg => (
                <button key={msg.id} onClick={() => handleOpen(msg)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    selected?.id === msg.id
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                      : msg.is_read
                        ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                        : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                  }`}>
                  <div className="flex items-start gap-3">
                    <SenderAvatar name={msg.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm leading-tight truncate ${msg.is_read ? 'font-medium text-slate-600' : 'font-semibold text-slate-800'}`}>
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatShort(msg.created_at)}</span>
                      </div>
                      <p className={`mt-0.5 text-xs truncate ${msg.is_read ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 truncate">{msg.email}</p>
                    </div>
                    {!msg.is_read && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            {selected ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Sender header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <SenderAvatar name={selected.name} />
                    <div>
                      <p className="font-semibold text-slate-800">{selected.name}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">{selected.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTime(selected.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => handleDeleteRequest(selected.id, e)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 shrink-0"
                  >
                    <FaTrash size={10} /> Delete
                  </button>
                </div>

                {/* Subject */}
                <div className="px-6 py-4 border-b border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.subject}</p>
                </div>

                {/* Message body */}
                <div className="px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Message</p>
                  <div className="bg-slate-50 rounded-xl px-5 py-4 text-sm text-slate-700 leading-7 whitespace-pre-wrap min-h-[120px]">
                    {selected.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24">
                <FaEnvelopeOpen className="mb-3 text-4xl text-slate-200" />
                <p className="text-sm font-medium text-slate-400">Select a message to read</p>
                <p className="text-xs text-slate-300 mt-1">{filtered.length} message{filtered.length !== 1 ? 's' : ''} in your inbox</p>
              </div>
            )}

          </div>
        )}

      </div>

      {pendingDelete && (
        <ConfirmDeleteDialog onConfirm={handleDeleteConfirm} onCancel={() => setPendingDelete(null)} />
      )}
    </SuperAdminLayout>
  )
}
