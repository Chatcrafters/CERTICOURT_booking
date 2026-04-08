import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sponsors } = await supabase.from('sponsors')
    .select('*, court:courts(name, display_name)')
    .order('contract_end', { ascending: true })

  const { data: courts } = await supabase.from('courts')
    .select('id, name, display_name')
    .eq('status', 'active')

  const now = new Date().toISOString().split('T')[0]
  const active = (sponsors || []).filter(s => s.status === 'active' && s.contract_end >= now)
  const totalAnnual = active.reduce((s, sp) => s + (sp.annual_amount || 0), 0)
  const expiring30 = active.filter(s => {
    const days = (new Date(s.contract_end).getTime() - Date.now()) / 86400000
    return days <= 30 && days > 0
  })

  return NextResponse.json({
    sponsors: sponsors || [],
    courts: courts || [],
    stats: { active: active.length, totalAnnual, expiring30: expiring30.length },
  })
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, type, court_id, annual_amount, contract_start, contract_end, notes } = body

  if (!name || !type || !annual_amount || !contract_start || !contract_end) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: sponsor, error } = await supabase.from('sponsors')
    .insert({
      operator_id: user.id,
      name,
      type,
      court_id: type === 'naming' ? court_id : null,
      annual_amount,
      contract_start,
      contract_end,
      notes,
      status: 'active',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(sponsor, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const allowed: Record<string, any> = {}
  for (const key of ['name', 'type', 'court_id', 'annual_amount', 'contract_start', 'contract_end', 'notes', 'logo_url']) {
    if (updates[key] !== undefined) allowed[key] = updates[key]
  }

  await supabase.from('sponsors').update(allowed).eq('id', id).eq('operator_id', user.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('sponsors').delete().eq('id', id).eq('operator_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
