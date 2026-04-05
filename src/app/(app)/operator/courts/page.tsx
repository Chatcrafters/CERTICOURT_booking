import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconCourt, IconWarning } from '@/components/icons'

export default async function OperatorCourtsPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courts } = await supabase.from('courts')
    .select('*, center:centers(name, city)')
    .order('sort_order')

  const active = courts?.filter(c => c.status === 'active') || []
  const inactive = courts?.filter(c => c.status !== 'active') || []

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark">Courts</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{courts?.length || 0}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-green-600">{active.length}</div>
            <div className="text-xs text-green-600">Activos</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-amber-600">{inactive.length}</div>
            <div className="text-xs text-amber-600">Inactivos</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Courts activos</h2>
        {active.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cc-blue to-cc-teal flex items-center justify-center text-white flex-shrink-0">
                <IconCourt size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{c.display_name || c.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.sport} &middot; {c.floor_type || 'Standard'}</div>
                {c.wpc_id && <div className="text-xs text-cc-blue font-mono mt-0.5">{c.wpc_id}</div>}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Activo</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
              <div className="text-center">
                <div className="text-xs text-gray-400">Ancho</div>
                <div className="text-sm font-semibold font-mono">{c.width_m ? `${c.width_m}m` : '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Largo</div>
                <div className="text-sm font-semibold font-mono">{c.length_m ? `${c.length_m}m` : '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Orden</div>
                <div className="text-sm font-semibold font-mono">{c.sort_order}</div>
              </div>
            </div>
          </div>
        ))}

        {inactive.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">Inactivos / Mantenimiento</h2>
            {inactive.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <IconCourt size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{c.display_name || c.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.sport} &middot; {c.floor_type || 'Standard'}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'maintenance' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                    {c.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                  </span>
                </div>
                {c.status === 'maintenance' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                    <IconWarning size={14} /> En mantenimiento
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
