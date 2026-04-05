'use client'
import { useState } from 'react'
import BookingCard from '@/components/BookingCard'

export default function AgendaList({ bookings: initial }: { bookings: any[] }) {
  const [bookings, setBookings] = useState(initial)
  const today = new Date().toISOString().split('T')[0]

  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled')
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled')

  function handleCancelled(id: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  return (
    <>
      {upcoming.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Proximas reservas</h2>
          <div className="space-y-3 mb-6">
            {upcoming.map(b => <BookingCard key={b.id} b={b} onCancelled={handleCancelled} />)}
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
    </>
  )
}
