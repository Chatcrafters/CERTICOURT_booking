import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get or create wallet
  let { data: wallet } = await supabase.from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!wallet) {
    const { data: newWallet } = await supabase.from('wallets')
      .insert({ user_id: user.id, balance: 0 })
      .select('*')
      .single()
    wallet = newWallet
  }

  // Get recent transactions
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
