import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in30min = new Date(now.getTime() + 30 * 60 * 1000)
  const in35min = new Date(now.getTime() + 35 * 60 * 1000)

  // Format times as HH:MM for comparison
  const timeFrom = in30min.toTimeString().slice(0, 5)
  const timeTo = in35min.toTimeString().slice(0, 5)
  const today = now.toISOString().slice(0, 10)

  // Find bookings starting in ~30 minutes that haven't been reminded yet
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, court:courts(name, display_name)')
    .eq('date', today)
    .eq('reminder_sent', false)
    .gte('start_time', timeFrom)
    .lt('start_time', timeTo)
    .eq('status', 'confirmed')

  if (!bookings || bookings.length === 0) {
    return Response.json({ reminded: 0 })
  }

  for (const booking of bookings) {
    const courtName = booking.court?.display_name || booking.court?.name || 'Court'

    // Insert in-app notification
    await supabase.from('notifications').insert({
      user_id: booking.profile_id,
      title: 'Tu court en 30 minutos',
      message: `${courtName} | PIN: ${booking.pin_code} | ${booking.start_time?.slice(0,5)}-${booking.end_time?.slice(0,5)}`,
      type: 'reminder',
      booking_id: booking.id,
    })

    // Send OneSignal push
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: 'CERTICOURT - Court in 30 min', es: 'CERTICOURT - Court en 30 min' },
        contents: {
          en: `${courtName} | PIN: ${booking.pin_code} | ${booking.start_time?.slice(0,5)}`,
          es: `${courtName} | PIN: ${booking.pin_code} | ${booking.start_time?.slice(0,5)}`,
        },
        url: 'https://certicourt-booking.vercel.app/agenda',
      }),
    })

    // Mark reminder as sent
    await supabase.from('bookings').update({ reminder_sent: true }).eq('id', booking.id)
  }

  return Response.json({ reminded: bookings.length })
}
