import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatDateShort } from '@/lib/helpers'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch booking
  const { data: booking, error: fetchError } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name), center:centers(name)')
    .eq('id', params.id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.profile_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
  }

  // Check 2-hour cancellation deadline
  const bookingStart = new Date(`${booking.date}T${booking.start_time}`)
  const now = new Date()
  const hoursUntil = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntil < 2) {
    return NextResponse.json({ error: 'No se puede cancelar con menos de 2h de antelacion' }, { status: 400 })
  }

  // Cancel booking
  const { error } = await supabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const courtName = booking.court?.display_name || booking.court?.name || ''

  // Insert in-app notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Reserva cancelada',
    message: `${courtName} | ${formatDateShort(booking.date)} | ${booking.start_time?.slice(0, 5)}-${booking.end_time?.slice(0, 5)}`,
    type: 'booking_cancelled',
    booking_id: booking.id,
  })

  // Send OneSignal push
  if (process.env.ONESIGNAL_REST_API_KEY) {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: {
          en: 'CERTICOURT - Booking cancelled',
          es: 'CERTICOURT - Reserva cancelada',
        },
        contents: {
          en: `${courtName} | ${formatDateShort(booking.date)} | ${booking.start_time?.slice(0, 5)}`,
          es: `${courtName} | ${formatDateShort(booking.date)} | ${booking.start_time?.slice(0, 5)}`,
        },
        url: 'https://certicourt-booking.vercel.app/agenda',
      }),
    }).catch(err => console.error('OneSignal cancel error:', err))
  }

  return NextResponse.json({ success: true })
}
