import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'month'

  const now = new Date()
  let dateFrom: string
  switch (period) {
    case 'today': dateFrom = now.toISOString().split('T')[0]; break
    case 'week': dateFrom = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]; break
    case 'year': dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]; break
    default: dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  }

  // Bookings in period
  const { data: bookings } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name), profile:profiles(first_name, last_name, email)')
    .neq('status', 'cancelled')
    .gte('date', dateFrom)
    .order('date', { ascending: false })

  // Sponsors
  const { data: sponsors } = await supabase.from('sponsors')
    .select('*, court:courts(name)')
    .eq('status', 'active')

  const bookingRevenue = (bookings || []).reduce((s, b) => s + (b.total_price || 0), 0)
  const namingRevenue = (sponsors || []).filter(s => s.type === 'naming').reduce((s, sp) => s + (sp.annual_amount || 0), 0)
  const bannerRevenue = (sponsors || []).filter(s => s.type === 'banner').reduce((s, sp) => s + (sp.annual_amount || 0), 0)
  const certicourtFee = (bookings || []).length * 0.50
  const netProfit = bookingRevenue - certicourtFee

  // Monthly chart data (last 12 months)
  const monthlyData: { month: string; amount: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthBookings = (bookings || []).filter(b => b.date?.startsWith(key))
    monthlyData.push({
      month: key,
      amount: monthBookings.reduce((s, b) => s + (b.total_price || 0), 0),
    })
  }

  return NextResponse.json({
    bookings: (bookings || []).slice(0, 50),
    sponsors: sponsors || [],
    kpi: { bookingRevenue, namingRevenue, bannerRevenue, certicourtFee, netProfit },
    monthlyData,
  })
}
