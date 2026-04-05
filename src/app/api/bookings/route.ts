import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { sendBookingConfirmation } from '@/lib/whatsapp'
import { sendBookingEmail } from '@/lib/email'

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const date = searchParams.get('date')

  let query = supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })
    .order('start_time')

  if (status) query = query.eq('status', status)
  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { court_id, center_id, date, start_time, end_time, duration_min, pricing_rule_id } = body

  if (!court_id || !center_id || !date || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check court availability
  const { data: existing } = await supabase.from('bookings')
    .select('id')
    .eq('court_id', court_id)
    .eq('date', date)
    .in('status', ['confirmed', 'pending'])
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Court not available at this time' }, { status: 409 })
  }

  // Fetch pricing
  let basePrice = 0
  let discountPct = 0
  if (pricing_rule_id) {
    const { data: rule } = await supabase.from('pricing_rules')
      .select('price_per_slot, requires_membership')
      .eq('id', pricing_rule_id)
      .single()
    if (rule) basePrice = rule.price_per_slot
  }

  // Check membership discount
  const { data: membership } = await supabase.from('memberships')
    .select('*, plan:membership_plans(discount_pct)')
    .eq('profile_id', user.id)
    .eq('center_id', center_id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (membership?.plan?.discount_pct) {
    discountPct = membership.plan.discount_pct
  }

  const discountAmount = basePrice * (discountPct / 100)
  const totalPrice = basePrice - discountAmount
  const pinCode = generatePin()

  // Calculate PIN validity: 15 min before start to 15 min after end
  const pinValidFrom = `${date}T${start_time}`
  const pinValidUntil = `${date}T${end_time}`

  const { data: booking, error } = await supabase.from('bookings')
    .insert({
      court_id,
      center_id,
      profile_id: user.id,
      date,
      start_time,
      end_time,
      duration_min: duration_min || 90,
      status: 'confirmed',
      payment_status: 'pending',
      payment_mode: 'on_site',
      base_price: basePrice,
      discount_pct: discountPct,
      discount_amount: discountAmount,
      total_price: totalPrice,
      pin_code: pinCode,
      pin_valid_from: pinValidFrom,
      pin_valid_until: pinValidUntil,
    })
    .select('*, court:courts(name, display_name), center:centers(name, city)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send WhatsApp confirmation (non-blocking)
  const { data: profile } = await supabase.from('profiles')
    .select('phone, first_name')
    .eq('id', user.id)
    .single()

  console.log('=== BOOKING CREATED ===', booking.id)
  console.log('=== PROFILE PHONE ===', profile?.phone)
  console.log('=== TWILIO SID ===', process.env.TWILIO_ACCOUNT_SID?.slice(0, 6))
  console.log('=== TWILIO FROM ===', process.env.TWILIO_WHATSAPP_FROM)

  if (profile?.phone && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const result = await sendBookingConfirmation({
        phone: profile.phone,
        pin: pinCode,
        courtName: booking.court?.display_name || booking.court?.name || '',
        date: booking.date,
        startTime: booking.start_time.slice(0, 5),
        endTime: booking.end_time.slice(0, 5),
        centerName: booking.center?.name || '',
        totalPrice: `${totalPrice.toFixed(2)} EUR`,
      })
      console.log('=== WHATSAPP SENT ===', result)
    } catch (err) {
      console.error('=== WHATSAPP ERROR ===', err)
    }
  }

  // Send email confirmation
  if (user.email && process.env.RESEND_API_KEY) {
    try {
      await sendBookingEmail({
        to: user.email,
        pin: pinCode,
        courtName: booking.court?.display_name || booking.court?.name || '',
        date: booking.date,
        startTime: booking.start_time.slice(0, 5),
        endTime: booking.end_time.slice(0, 5),
        centerName: booking.center?.name || '',
        totalPrice,
      })
      console.log('=== EMAIL SENT ===', user.email)
    } catch (err) {
      console.error('=== EMAIL ERROR ===', err)
    }
  }

  return NextResponse.json(booking, { status: 201 })
}
