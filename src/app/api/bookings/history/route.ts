import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)

  const { data: bookings, error } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('profile_id', user.id)
    .in('status', ['completed', 'cancelled', 'confirmed', 'no_show'])
    .or(`date.lt.${today},and(date.eq.${today},end_time.lt.${currentTime})`)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const pastBookings = bookings || []
  const completed = pastBookings.filter(b => b.status !== 'cancelled')
  const totalHours = completed.reduce((s, b) => s + (b.duration_min || 90) / 60, 0)
  const totalSpent = completed.reduce((s, b) => s + (b.total_price || 0), 0)

  return NextResponse.json({
    bookings: pastBookings,
    stats: {
      totalCourts: completed.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalSpent,
    },
  })
}
