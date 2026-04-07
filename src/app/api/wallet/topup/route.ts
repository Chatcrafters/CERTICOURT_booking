import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

const BONUS_TIERS = [
  { min_amount: 50, bonus: 10 },
  { min_amount: 100, bonus: 30 },
]

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // Calculate bonus from tiers (highest matching)
  let bonus = 0
  for (const tier of BONUS_TIERS) {
    if (amount >= tier.min_amount) bonus = tier.bonus
  }

  // Get current wallet
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

  const currentBalance = wallet?.balance || 0
  const newBalance = currentBalance + amount + bonus

  // Update wallet balance
  await supabase.from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  // Insert topup transaction
  await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount,
    bonus: 0,
    description: `Recarga ${amount} EUR`,
    balance_after: currentBalance + amount,
  })

  // Insert bonus transaction if applicable
  if (bonus > 0) {
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'bonus',
      amount: bonus,
      bonus,
      description: `Bonus por recarga de ${amount} EUR`,
      balance_after: newBalance,
    })
  }

  return NextResponse.json({ balance: newBalance, bonus })
}
