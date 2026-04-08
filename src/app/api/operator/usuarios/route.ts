import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles } = await supabase.from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (!profiles) return NextResponse.json({ users: [], stats: { total: 0, activeMonth: 0, newWeek: 0 } })

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

  // Get booking stats per user
  const { data: bookingStats } = await supabase.from('bookings')
    .select('profile_id, total_price, date')
    .neq('status', 'cancelled')

  const userStats = new Map<string, { count: number; spent: number; lastDate: string }>()
  for (const b of bookingStats || []) {
    const s = userStats.get(b.profile_id) || { count: 0, spent: 0, lastDate: '' }
    s.count++
    s.spent += b.total_price || 0
    if (b.date > s.lastDate) s.lastDate = b.date
    userStats.set(b.profile_id, s)
  }

  const users = profiles.map(p => {
    const stats = userStats.get(p.id) || { count: 0, spent: 0, lastDate: '' }
    const isActive = stats.lastDate >= monthAgo.split('T')[0]
    return {
      id: p.id,
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || '',
      email: p.email,
      phone: p.phone || '',
      role: p.role,
      wallet_balance: p.wallet_balance || 0,
      created_at: p.created_at,
      bookings_count: stats.count,
      total_spent: stats.spent,
      last_activity: stats.lastDate || null,
      active: isActive,
    }
  })

  const activeMonth = users.filter(u => u.active).length
  const newWeek = profiles.filter(p => p.created_at && p.created_at >= weekAgo).length

  return NextResponse.json({
    users,
    stats: { total: users.length, activeMonth, newWeek },
  })
}
