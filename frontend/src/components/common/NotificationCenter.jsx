import { useEffect, useRef, useState } from 'react'
import { FaBell, FaCheckDouble } from 'react-icons/fa'
import {
  MdAnalytics, MdErrorOutline, MdFeedback,
  MdBusiness, MdCheckCircle, MdCancel, MdEmail,
} from 'react-icons/md'
import { useNotifications } from '../../context/NotificationContext'

const TYPE_CONFIG = {
  analysis_complete:    { Icon: MdAnalytics,   color: 'text-emerald-500', bg: 'bg-emerald-50' },
  analysis_failed:      { Icon: MdErrorOutline, color: 'text-red-500',     bg: 'bg-red-50'     },
  feedback_response:    { Icon: MdFeedback,     color: 'text-blue-500',    bg: 'bg-blue-50'    },
  institution_approved: { Icon: MdCheckCircle,  color: 'text-emerald-500', bg: 'bg-emerald-50' },
  institution_rejected: { Icon: MdCancel,       color: 'text-red-500',     bg: 'bg-red-50'     },
  new_institution:      { Icon: MdBusiness,     color: 'text-purple-500',  bg: 'bg-purple-50'  },
  contact_message:      { Icon: MdEmail,        color: 'text-amber-500',   bg: 'bg-amber-50'   },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleItemClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <FaBell className="text-sm" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <FaCheckDouble className="text-[10px]" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                <FaBell className="text-2xl opacity-30" />
                <span className="text-sm">No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.notification_type] ?? TYPE_CONFIG.feedback_response
                const { Icon, color, bg } = cfg
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!n.is_read ? 'bg-slate-50/70' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center mt-0.5`}>
                      <Icon className={`text-base ${color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-sm font-medium leading-tight ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400">Showing last {notifications.length} notifications</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
