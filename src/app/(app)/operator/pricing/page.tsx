import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'
import { IconMoney } from '@/components/icons'

export default async function OperatorPricingPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rules } = await supabase.from('pricing_rules')
    .select('*, court:courts(name, display_name)')
    .order('is_peak').order('price_per_slot')

  const peakRules = rules?.filter(r => r.is_peak) || []
  const offPeakRules = rules?.filter(r => !r.is_peak) || []

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark">Tarifas</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{rules?.length || 0}</div>
            <div className="text-xs text-blue-600">Reglas activas</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-amber-600">{peakRules.length}</div>
            <div className="text-xs text-amber-600">Tarifas peak</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {offPeakRules.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tarifas estandar</h2>
            {offPeakRules.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cc-blue-light flex items-center justify-center text-cc-blue">
                      <IconMoney size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className="text-xs text-gray-500">
                        {r.duration_min} min &middot; {r.court?.display_name || r.court?.name || 'Todos los courts'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cc-blue font-mono">{formatEur(r.price_per_slot)}</div>
                    <div className="text-xs text-gray-400">por slot</div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {r.requires_membership && <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Miembros</span>}
                  {r.requires_trainer && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Con monitor</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {peakRules.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">Tarifas peak</h2>
            {peakRules.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                      <IconMoney size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className="text-xs text-gray-500">
                        {r.duration_min} min &middot; {r.court?.display_name || r.court?.name || 'Todos los courts'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600 font-mono">{formatEur(r.price_per_slot)}</div>
                    <div className="text-xs text-gray-400">por slot</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.peak_time_start && r.peak_time_end && (
                    <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                      {r.peak_time_start.slice(0, 5)} - {r.peak_time_end.slice(0, 5)}
                    </span>
                  )}
                  {r.peak_days?.map((d: number) => (
                    <span key={d} className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                      {dayNames[d]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
