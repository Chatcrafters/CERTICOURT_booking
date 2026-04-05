'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconWarning } from '@/components/icons'

function isCancellable(date: string, startTime: string) {
  const bookingStart = new Date(`${date}T${startTime}`)
  const now = new Date()
  return (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60) >= 2
}

export default function CancelButton({ bookingId, date, startTime }: { bookingId: string; date: string; startTime: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const canCancel = isCancellable(date, startTime)

  async function handleCancel() {
    setCancelling(true)
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al cancelar')
      setCancelling(false)
    }
  }

  if (!canCancel) {
    return (
      <div className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 mb-2">
        <IconWarning size={12} /> No se puede cancelar con menos de 2h de antelacion
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
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
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="w-full text-xs font-semibold text-red-500 border border-red-200 rounded-xl py-2.5 mb-2 hover:bg-red-50 transition-colors">
      Cancelar reserva
    </button>
  )
}
