import { createSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatEur, formatDate } from '@/lib/helpers'
import { IconCheck, IconKey } from '@/components/icons'
import CancelButton from './CancelButton'

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer()
  const { data: booking } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('id', params.id).single()

  if (!booking) return <div className="p-8 text-center text-gray-500">Reserva no encontrada</div>

  const isCancelled = booking.status === 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {isCancelled ? (
        <>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-3xl font-bold">X</span>
          </div>
          <h1 className="text-xl font-bold text-cc-dark mb-1">Reserva cancelada</h1>
          <p className="text-sm text-gray-500 mb-6">Esta reserva ha sido cancelada</p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <IconCheck size={40} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-cc-dark mb-1">Reserva confirmada!</h1>
          <p className="text-sm text-gray-500 mb-6">Tu court esta reservado y el PIN de acceso esta activo</p>
        </>
      )}

      {booking.pin_code && !isCancelled && (
        <div className="w-full bg-cc-blue rounded-2xl p-6 text-white text-center mb-4">
          <p className="text-xs uppercase tracking-widest opacity-75 mb-2">Tu PIN de acceso</p>
          <p className="text-5xl font-bold font-mono tracking-widest">{booking.pin_code}</p>
          <p className="text-xs opacity-70 mt-2">Valido {booking.start_time?.slice(0,5)} - {booking.end_time?.slice(0,5)}</p>
          <p className="text-sm font-semibold mt-3">{booking.court?.display_name || booking.court?.name}</p>
        </div>
      )}

      <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 mb-4 text-sm space-y-2">
        <div className="flex justify-between"><span className="text-gray-500">Fecha</span><span className="font-semibold">{formatDate(booking.date)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Horario</span><span className="font-semibold">{booking.start_time?.slice(0,5)} - {booking.end_time?.slice(0,5)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Centro</span><span className="font-semibold">{booking.center?.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Pagado</span><span className="font-semibold text-cc-blue">{formatEur(booking.total_price)}</span></div>
      </div>

      {!isCancelled && (
        <div className="w-full bg-cc-blue/10 rounded-xl p-3 text-xs text-cc-blue mb-4 flex items-center gap-2">
          <IconKey size={14} /> Introduce el PIN en el teclado de la puerta para acceder. Se desactiva automaticamente al finalizar tu sesion.
        </div>
      )}

      {!isCancelled && (
        <CancelButton bookingId={booking.id} date={booking.date} startTime={booking.start_time} />
      )}

      <Link href="/home" className="btn-primary w-full text-center mt-2">Volver al inicio</Link>
      <Link href="/book" className="btn-secondary w-full text-center mt-2">Nueva reserva</Link>
    </div>
  )
}
