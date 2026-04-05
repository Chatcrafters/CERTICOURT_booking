'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { IconBell, IconCheck, IconClock, IconCourt, IconRacket } from '@/components/icons'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  booking_id: string | null
  created_at: string
}

function TypeIcon({ type, read }: { type: string; read: boolean }) {
  const cls = `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
    !read ? 'bg-cc-blue text-white' : 'bg-gray-100 text-gray-400'
  }`
  switch (type) {
    case 'booking_confirmed': return <div className={cls}><IconCheck size={20} /></div>
    case 'reminder': return <div className={cls}><IconClock size={20} /></div>
    case 'court_free': return <div className={cls}><IconCourt size={20} /></div>
    case 'operator_message': return <div className={cls}><IconRacket size={20} /></div>
    default: return <div className={cls}><IconBell size={20} /></div>
  }
}

function groupByDate(items: Notification[]) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]

  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Hoy', items: [] },
    { label: 'Ayer', items: [] },
    { label: 'Esta semana', items: [] },
    { label: 'Anteriores', items: [] },
  ]

  for (const n of items) {
    const d = n.created_at.split('T')[0]
    if (d === today) groups[0].items.push(n)
    else if (d === yesterday) groups[1].items.push(n)
    else if (d >= weekAgo) groups[2].items.push(n)
    else groups[3].items.push(n)
  }

  return groups.filter(g => g.items.length > 0)
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setNotifications(data)
      setLoading(false)

      supabase.channel('notifications-page')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
    }
    load()
    return () => { supabase.channel('notifications-page').unsubscribe() }
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

  const groups = groupByDate(notifications)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/home" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">Notificaciones</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-cc-blue font-semibold">
              Marcar todas leidas
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Cargando...</div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-gray-300 flex justify-center mb-3"><IconBell size={48} /></div>
          <p className="text-sm text-gray-500 font-medium">No tienes notificaciones</p>
          <p className="text-xs text-gray-400 mt-1">Aqui apareceran tus reservas y avisos</p>
        </div>
      ) : (
        <div className="pb-4">
          {groups.map(group => (
            <div key={group.label}>
              <div className="px-5 py-2 mt-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.label}</h2>
              </div>
              <div className="space-y-1 px-4">
                {group.items.map(n => (
                  <button key={n.id} onClick={() => markAsRead(n.id)}
                    className={`w-full text-left bg-white rounded-2xl p-4 flex items-start gap-3 transition-colors
                      ${!n.read ? 'border-l-4 border-cc-blue' : 'border border-gray-100'}`}>
                    <TypeIcon type={n.type} read={n.read} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-cc-dark truncate">{n.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-cc-blue flex-shrink-0 mt-2"></span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
