import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Auto-create wallet if it doesn't exist
  await supabase.from('wallets')
    .upsert({ user_id: user.id, balance: 0 }, { onConflict: 'user_id', ignoreDuplicates: true })

  const { data: wallet } = await supabase.from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: transactions } = await supabase.from('wallet_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    balance: wallet?.balance || 0,
    auto_reload: wallet?.auto_reload || false,
    auto_reload_amount: wallet?.auto_reload_amount || 20,
    transactions: transactions || [],
  })
}
