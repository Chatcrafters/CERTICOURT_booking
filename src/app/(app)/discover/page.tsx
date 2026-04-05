import { createSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function DiscoverPage() {
  const supabase = createSupabaseServer()
  const { data: centers } = await supabase.from('centers').select('*').eq('is_active', true).order('city')

  return (
    <div>
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-cc-dark mb-4">Descubrir centros</h1>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <span className="text-gray-400">🔍</span>
          <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Buscar centros..." />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {['Todos', 'Pickleball', 'Pádel', 'Tenis', 'Cerca de mí'].map((f, i) => (
            <button key={f} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${i === 0 ? 'bg-cc-blue text-white border-cc-blue' : 'bg-white text-gray-500 border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {centers?.map(center => (
          <Link key={center.id} href={`/book?center=${center.slug}`} className="flex items-center gap-3 p-4 bg-white active:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cc-blue to-cc-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {center.name.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-cc-dark truncate">{center.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">📍 {center.city}, {center.country}</div>
              <div className="flex items-center gap-2 mt-1">
                {center.wpc_certified && <span className="text-xs bg-cc-blue/10 text-cc-blue font-semibold px-2 py-0.5 rounded-full font-mono">WPC ✓</span>}
                <span className="text-xs text-gray-400">Pickleball</span>
              </div>
            </div>
            <span className="text-gray-300 text-xl">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
