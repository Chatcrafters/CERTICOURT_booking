import { createSupabaseServer } from '@/lib/supabase-server'
import { sendBookingConfirmation } from '@/lib/whatsapp'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    center_id, court_id, pricing_rule_id,
    date, start_time, end_time, duration_min,
    base_price, discount_pct, discount_amount, total_price,
    payment_mode
  } = body

  // Create booking
  const { data: booking, error } = await supabase.from('bookings').insert({
    center_id, court_id, profile_id: user.id, pricing_rule_id,
    date, start_time, end_time, duration_min,
    status: 'confirmed', payment_status: 'paid',
    payment_mode: payment_mode || 'online',
    base_price, discount_pct, discount_amount, total_price,
  }).select('*, court:courts(name, display_name), center:centers(name, city)').single()

  if (error || !booking) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  // Send WhatsApp if user has phone number
  const { data: profile } = await supabase.from('profiles').select('phone, first_name').eq('id', user.id).single()

  if (profile?.phone && booking.pin_code) {
    await sendBookingConfirmation({
      to: profile.phone,
      pin: booking.pin_code,
      courtName: booking.court?.display_name || booking.court?.name || '',
      date: booking.date,
      startTime: booking.start_time?.slice(0, 5),
      endTime: booking.end_time?.slice(0, 5),
      centerName: booking.center?.name || '',
      totalPrice: booking.total_price,
    })
  }

  return NextResponse.json({ booking })
}
