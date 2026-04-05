import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatDateShort } from '@/lib/helpers'

export async function POST(req: NextRequest, { params }: { params: { seriesId: string } }) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify series belongs to user
  const { data: series } = await supabase.from('recurring_series')
    .select('*')
    .eq('id', params.seriesId)
    .eq('user_id', user.id)
    .single()

  if (!series) {
    return NextResponse.json({ error: 'Series not found' }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Cancel all future bookings in the series
  const { data: cancelled } = await supabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('recurring_id', params.seriesId)
    .eq('status', 'confirmed')
    .gte('date', today)
    .select('id, date, court:courts(name, display_name)')

  // Update series status
  await supabase.from('recurring_series')
    .update({ status: 'cancelled' })
    .eq('id', params.seriesId)

  const courtName = cancelled?.[0]?.court?.display_name || cancelled?.[0]?.court?.name || ''

  // Insert notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Serie recurrente cancelada',
    message: `${courtName} | ${cancelled?.length || 0} sesiones futuras canceladas`,
    type: 'booking_cancelled',
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
          en: 'CERTICOURT - Series cancelled',
          es: 'CERTICOURT - Serie cancelada',
        },
        contents: {
          en: `${courtName} | ${cancelled?.length || 0} sessions cancelled`,
          es: `${courtName} | ${cancelled?.length || 0} sesiones canceladas`,
        },
        url: 'https://certicourt-booking.vercel.app/agenda',
      }),
    }).catch(err => console.error('OneSignal error:', err))
  }

  return NextResponse.json({ success: true, cancelledCount: cancelled?.length || 0 })
}
