import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { formatEur } from '@/lib/helpers'

export default async function AgendaPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(20)

  const upcoming = bookings?.filter(b => b.date >= new Date().toISOString().split('T')[0] && b.status !== 'cancelled') || []
  const past = bookings?.filter(b => b.date < new Date().toISOString().split('T')[0] || b.status === 'cancelled') || []

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-blue-100 text-cc-blue',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-gray-100 text-gray-600',
  }

  function BookingCard({ b }: { b: any }) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">{b.court?.display_name || b.court?.name}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
            {b.status}
          </span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>📅 {b.date} · {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</div>
          <div>📍 {b.center?.name}, {b.center?.city}</div>
          <div>💳 {formatEur(b.total_price)}</div>
        </div>
        {b.pin_code && b.status === 'confirmed' && (
          <div className="bg-cc-blue/10 rounded-xl p-3 text-center mt-3">
            <p className="text-xs text-gray-500 mb-1">PIN de acceso</p>
            <p className="text-2xl font-bold font-mono text-cc-blue tracking-widest">{b.pin_code}</p>
            <p className="text-xs text-gray-400 mt-1">Válido {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pt-14 px-4">
      <h1 className="text-xl font-bold text-cc-dark mb-4">Mi agenda</h1>

      {upcoming.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Próximas reservas</h2>
          <div className="space-y-3 mb-6">
            {upcoming.map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial</h2>
          <div className="space-y-3">
            {past.map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        </>
      )}

      {!bookings?.length && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🎾</div>
          <p className="font-semibold">No hay reservas todavía</p>
          <p className="text-sm mt-1">¡Reserva tu primer court!</p>
        </div>
      )}
    </div>
  )
}
