import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur, daysUntil } from '@/lib/helpers'

export default async function SponsoringPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contracts } = await supabase.from('sponsoring_contracts')
    .select('*, spot:sponsoring_spots(name, category, court:courts(name))')
    .order('ends_at')

  const { data: spots } = await supabase.from('sponsoring_spots').select('*')
  const freeSpots = spots?.filter(s => !contracts?.find(c => c.spot_id === s.id)) || []
  const totalRevenue = contracts?.reduce((s, c) => s + c.price_yearly, 0) || 0

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">←</Link>
          <h1 className="text-lg font-bold text-cc-dark">Sponsoring</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{formatEur(totalRevenue)}</div>
            <div className="text-xs text-blue-600">Ingresos / año</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-amber-600">{contracts?.filter(c => daysUntil(c.ends_at) <= 90).length || 0}</div>
            <div className="text-xs text-amber-600">Vencen pronto</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contratos activos</h2>
        {contracts?.map(c => {
          const dl = daysUntil(c.ends_at)
          const urgent = dl <= 90
          return (
            <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm">{c.sponsor_name}</div>
                  <div className="text-xs text-gray-500">{c.spot?.name} · {c.spot?.category}</div>
                </div>
                <span className="font-bold text-cc-blue font-mono text-sm">{formatEur(c.price_yearly)}/a</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full ${dl < 0 ? 'bg-red-400' : urgent ? 'bg-amber-400' : 'bg-green-400'}`}
                  style={{width: `${Math.max(0, Math.min(100, (dl / 365) * 100))}%`}} />
              </div>
              <div className={`text-xs font-medium ${urgent ? 'text-amber-600' : 'text-gray-400'}`}>
                {dl < 0 ? '⛔ Vencido' : urgent ? `⚠️ Vence en ${dl} días (${c.ends_at})` : `Vence: ${c.ends_at} · ${dl} días`}
              </div>
              {urgent && <button className="mt-2 text-xs font-semibold text-white bg-amber-500 px-3 py-1.5 rounded-lg">Contactar para renovar</button>}
            </div>
          )
        })}

        {freeSpots.length > 0 && <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">Espacios disponibles</h2>
          {freeSpots.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-gray-400">{s.name}</div>
                <div className="text-xs text-gray-400">{s.category} · Base: {formatEur(s.base_price || 0)}/a</div>
              </div>
              <button className="text-xs font-semibold text-cc-blue border-2 border-cc-blue px-3 py-1.5 rounded-lg">Asignar</button>
            </div>
          ))}
        </>}
      </div>
    </div>
  )
}
