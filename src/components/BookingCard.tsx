'use client'
import { useState } from 'react'
import { formatEur } from '@/lib/helpers'
import { IconCalendar, IconPin, IconCreditCard, IconWarning } from './icons'

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-blue-100 text-cc-blue',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

function isCancellable(date: string, startTime: string) {
  const bookingStart = new Date(`${date}T${startTime}`)
  const now = new Date()
  return (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60) >= 2
}

export default function BookingCard({ b, onCancelled }: { b: any; onCancelled?: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState('')

  const canCancel = b.status === 'confirmed' && b.date >= new Date().toISOString().split('T')[0] && isCancellable(b.date, b.start_time)
  const pastDeadline = b.status === 'confirmed' && b.date >= new Date().toISOString().split('T')[0] && !isCancellable(b.date, b.start_time)

  async function handleCancel() {
    setCancelling(true)
    const res = await fetch(`/api/bookings/${b.id}/cancel`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setToast('Reserva cancelada')
      setConfirming(false)
      onCancelled?.(b.id)
      setTimeout(() => setToast(''), 3000)
    } else {
      setToast(data.error || 'Error al cancelar')
      setCancelling(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-4 border ${b.status === 'cancelled' ? 'border-red-200 opacity-75' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm">{b.court?.display_name || b.court?.name}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
          {statusLabels[b.status] || b.status}
        </span>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1"><IconCalendar size={12} /> {b.date} &middot; {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</div>
        <div className="flex items-center gap-1"><IconPin size={12} /> {b.center?.name}, {b.center?.city}</div>
        <div className="flex items-center gap-1"><IconCreditCard size={12} /> {formatEur(b.total_price)}</div>
      </div>

      {b.pin_code && b.status === 'confirmed' && (
        <div className="bg-cc-blue/10 rounded-xl p-3 text-center mt-3">
          <p className="text-xs text-gray-500 mb-1">PIN de acceso</p>
          <p className="text-2xl font-bold font-mono text-cc-blue tracking-widest">{b.pin_code}</p>
          <p className="text-xs text-gray-400 mt-1">Valido {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</p>
        </div>
      )}

      {/* Cancel section */}
      {canCancel && !confirming && (
        <button onClick={() => setConfirming(true)}
          className="mt-3 w-full text-xs font-semibold text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50 transition-colors">
          Cancelar reserva
        </button>
      )}

      {pastDeadline && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
          <IconWarning size={12} /> No se puede cancelar con menos de 2h de antelacion
        </div>
      )}

      {confirming && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700 font-semibold mb-2">Cancelar reserva? Esta accion no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 text-xs font-semibold text-white bg-red-500 rounded-lg py-2 disabled:opacity-50">
              {cancelling ? 'Cancelando...' : 'Si, cancelar'}
            </button>
            <button onClick={() => setConfirming(false)}
              className="flex-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg py-2">
              No, mantener
            </button>
          </div>
        </div>
      )}

      {b.status === 'cancelled' && (
        <div className="mt-3 text-xs text-red-500 font-medium text-center">Reserva cancelada</div>
      )}

      {toast && (
        <div className="mt-2 text-xs font-semibold text-center py-1.5 rounded-lg bg-green-100 text-green-700">
          {toast}
        </div>
      )}
    </div>
  )
}
