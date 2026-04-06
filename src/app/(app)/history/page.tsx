'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatEur, formatDate, formatDateShort } from '@/lib/helpers'
import { IconClock, IconCourt, IconMoney, IconCalendar, IconPin, IconCreditCard } from '@/components/icons'

interface Booking {
  id: string
  date: string
  start_time: string
  end_time: string
  duration_min: number
  total_price: number
  status: string
  pin_code: string | null
  court: { name: string; display_name?: string; wpc_id?: string } | null
  center: { name: string; city: string } | null
}

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-amber-100 text-amber-700',
}

const statusLabels: Record<string, string> = {
  completed: 'Completada',
  confirmed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No presentado',
}

function groupByMonth(bookings: Booking[]) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  const groups: { label: string; items: Booking[] }[] = []
  const map = new Map<string, Booking[]>()

  for (const b of bookings) {
    const [y, m] = b.date.split('-')
    const key = `${y}-${m}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(b)
  }

  for (const [key, items] of Array.from(map.entries())) {
    const [y, m] = key.split('-')
    groups.push({ label: `${months[parseInt(m) - 1]} ${y}`, items })
  }

  return groups
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ totalCourts: 0, totalHours: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/bookings/history')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
        setStats(data.stats)
      }
      setLoading(false)
    }
    load()
  }, [])

  const groups = groupByMonth(bookings)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-cc-dark mb-4">Historial</h1>

        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cc-blue-light rounded-xl p-3 text-center">
              <div className="text-cc-blue mb-1 flex justify-center"><IconCourt size={18} /></div>
              <div className="text-lg font-bold font-mono text-cc-blue">{stats.totalCourts}</div>
              <div className="text-xs text-blue-600">Partidos</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-green-600 mb-1 flex justify-center"><IconClock size={18} /></div>
              <div className="text-lg font-bold font-mono text-green-600">{stats.totalHours}h</div>
              <div className="text-xs text-green-600">En pista</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-amber-600 mb-1 flex justify-center"><IconMoney size={18} /></div>
              <div className="text-lg font-bold font-mono text-amber-600">{formatEur(stats.totalSpent)}</div>
              <div className="text-xs text-amber-600">Gastado</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Cargando...</div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-gray-300 flex justify-center mb-3"><IconClock size={48} /></div>
          <p className="text-sm text-gray-500 font-medium">No tienes reservas anteriores</p>
          <p className="text-xs text-gray-400 mt-1">Tus partidos completados apareceran aqui</p>
        </div>
      ) : (
        <div className="pb-4">
          {groups.map(group => (
            <div key={group.label}>
              <div className="px-5 py-2 mt-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.label}</h2>
              </div>
              <div className="space-y-2 px-4">
                {group.items.map(b => (
                  <div key={b.id} className={`bg-white rounded-2xl p-4 border ${b.status === 'cancelled' ? 'border-red-200 opacity-70' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{b.court?.display_name || b.court?.name}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <IconCalendar size={12} /> {formatDate(b.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock size={12} /> {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)} ({b.duration_min || 90} min)
                      </div>
                      <div className="flex items-center gap-1">
                        <IconPin size={12} /> {b.center?.name}, {b.center?.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCreditCard size={12} /> {formatEur(b.total_price)}
                      </div>
                    </div>
                    {b.pin_code && (
                      <div className="bg-gray-50 rounded-xl p-2 text-center mt-3 opacity-50">
                        <p className="text-xs text-gray-400 mb-0.5">PIN (expirado)</p>
                        <p className="text-lg font-bold font-mono text-gray-400 tracking-widest">{b.pin_code}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
