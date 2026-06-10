import { useCallback, useEffect, useState } from 'react'
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaSearch } from 'react-icons/fa'
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar'
import { getContactMessages, markMessageRead, deleteContactMessage } from '../../services/superadmin'
import { toast } from 'sonner'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function ContactMessagesPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')

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

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this message?')) return
    try {
      await deleteContactMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Message deleted.')
    } catch {
      toast.error('Failed to delete message.')
    }
  }

  const filtered = messages.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div className="flex h-screen bg-slate-50 font-[Sora,sans-serif] overflow-hidden">
      <SuperAdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">Contact Messages</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">Messages submitted from the landing page contact form.</p>
          </div>

          {/* Search */}
          <div className="relative mb-5 max-w-sm">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or subject…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <FaEnvelope className="mx-auto mb-3 text-3xl text-slate-300" />
              <p className="text-sm text-slate-400">{search ? 'No messages match your search.' : 'No messages yet.'}</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-start">

              {/* List */}
              <div className="space-y-2">
                {filtered.map(msg => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleOpen(msg)}
                    className={[
                      'w-full text-left rounded-xl border p-4 transition hover:shadow-sm',
                      selected?.id === msg.id
                        ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                        : msg.is_read
                          ? 'border-slate-100 bg-white'
                          : 'border-slate-200 bg-white shadow-sm',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.is_read
                          ? <FaEnvelopeOpen className="shrink-0 text-slate-300 text-sm" />
                          : <FaEnvelope className="shrink-0 text-emerald-500 text-sm" />
                        }
                        <span className={`truncate text-sm ${msg.is_read ? 'font-medium text-slate-600' : 'font-semibold text-slate-800'}`}>
                          {msg.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => handleDelete(msg.id, e)}
                        className="shrink-0 text-slate-300 hover:text-red-500 transition p-0.5"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                    <p className={`mt-1 truncate text-xs ${msg.is_read ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      {msg.subject}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatTime(msg.created_at)}</p>
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              {selected ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">{selected.subject}</h2>
                      <p className="mt-0.5 text-sm text-slate-500">{selected.name} &mdash; <span className="text-emerald-700">{selected.email}</span></p>
                      <p className="mt-0.5 text-xs text-slate-400">{formatTime(selected.created_at)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => handleDelete(selected.id, e)}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100"
                    >
                      <FaTrash size={10} />
                      Delete
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                  <FaEnvelopeOpen className="mb-3 text-3xl text-slate-200" />
                  <p className="text-sm text-slate-400">Select a message to read it</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
