import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'
import { IconUsers, IconCheck } from '@/components/icons'

export default async function OperatorMembershipsPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans } = await supabase.from('membership_plans')
    .select('*')
    .order('price_monthly')

  const { data: memberships } = await supabase.from('memberships')
    .select('*, plan:membership_plans(name), profile:profiles(first_name, last_name, email)')
    .eq('status', 'active')
    .order('starts_at', { ascending: false })

  const totalMonthly = plans?.reduce((s, p) => {
    const count = memberships?.filter(m => m.plan_id === p.id).length || 0
    return s + (p.price_monthly * count)
  }, 0) || 0

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark">Abonos</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{plans?.length || 0}</div>
            <div className="text-xs text-blue-600">Planes</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-green-600">{memberships?.length || 0}</div>
            <div className="text-xs text-green-600">Miembros</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold font-mono text-amber-600">{formatEur(totalMonthly)}</div>
            <div className="text-xs text-amber-600">MRR</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Planes disponibles</h2>
        {plans?.map(p => {
          const count = memberships?.filter(m => m.plan_id === p.id).length || 0
          return (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">{count} miembros activos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cc-blue font-mono text-lg">{formatEur(p.price_monthly)}</div>
                  <div className="text-xs text-gray-400">/mes</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Horas / mes</div>
                  <div className="text-sm font-semibold font-mono">{p.hours_monthly || 'Ilimitado'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Descuento</div>
                  <div className="text-sm font-semibold font-mono">{p.discount_pct}%</div>
                </div>
              </div>
              {p.perks && p.perks.length > 0 && (
                <div className="space-y-1">
                  {p.perks.map((perk: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-cc-teal"><IconCheck size={14} /></span>
                      {perk}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {memberships && memberships.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">Miembros activos</h2>
            {memberships.map(m => (
              <div key={m.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cc-blue-light flex items-center justify-center text-cc-blue flex-shrink-0">
                  <IconUsers size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {m.profile?.first_name} {m.profile?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{m.plan?.name} &middot; desde {m.starts_at}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-400">{m.hours_used}h usadas</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activo</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
