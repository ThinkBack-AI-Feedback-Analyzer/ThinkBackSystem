import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  getNotifications,
  getUnreadCount,
  markAsRead    as apiMarkAsRead,
  markAllAsRead as apiMarkAllRead,
} from '../services/notifications'

const NotificationContext = createContext(null)

const POLL_INTERVAL = 30_000

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const timerRef = useRef(null)

  const isLoggedIn = () => !!localStorage.getItem('access_token')

  const fetchAll = useCallback(async () => {
    if (!isLoggedIn()) return
    try {
      setLoading(true)
      const [list, countData] = await Promise.all([getNotifications(), getUnreadCount()])
      setNotifications(list)
      setUnreadCount(countData.count)
    } catch {
      // silently fail — notification errors must not disrupt the app
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silently fail */ }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetchAll])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchAll, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
