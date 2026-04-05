'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { IconBell, IconCheck, IconClock, IconRacket, IconCourt } from './icons'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `${min}m`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'booking_confirmed': return <IconCheck size={16} />
    case 'reminder': return <IconClock size={16} />
    case 'court_free': return <IconCourt size={16} />
    default: return <IconBell size={16} />
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setNotifications(data)

      // Realtime subscription
      supabase.channel('notifications')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
    }
    init()

    return () => { supabase.channel('notifications').unsubscribe() }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    if (!userId) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <IconBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-cc-dark">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-cc-blue font-semibold">
                Marcar todas leidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-gray-300 flex justify-center mb-2"><IconBell size={32} /></div>
                <p className="text-sm text-gray-400">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <button key={n.id} onClick={() => markAsRead(n.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors
                    ${!n.read ? 'border-l-2 border-cc-blue bg-cc-blue-light/30' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${!n.read ? 'bg-cc-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <TypeIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-cc-dark truncate">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-cc-blue flex-shrink-0 mt-2"></span>}
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link href="/notifications" onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-cc-blue py-3 border-t border-gray-100 hover:bg-gray-50">
              Ver todas
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
