import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur, daysUntil } from '@/lib/helpers'

export default async function OperatorPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const { data: bookings } = await supabase.from('bookings')
    .select('total_price, status').eq('date', today)
  const { data: courts } = await supabase.from('courts').select('id, name, display_name, status').limit(10)
  const { data: contracts } = await supabase.from('sponsoring_contracts')
    .select('*, spot:sponsoring_spots(name, category)').order('ends_at')

  const todayBookings = bookings?.filter(b => b.status !== 'cancelled') || []
  const revenue = todayBookings.reduce((s, b) => s + (b.total_price || 0), 0)
  const expiring = contracts?.filter(c => daysUntil(c.ends_at) <= 90) || []

  return (
    <div className="pt-14">
      {/* HEADER */}
      <div className="bg-cc-dark text-white px-5 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cc-teal"></div>Panel Operador</div>
          <span className="text-xs text-gray-400">{today}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: todayBookings.length, lbl: 'Reservas hoy' },
            { val: formatEur(revenue), lbl: 'Ingresos hoy' },
            { val: courts?.filter(c=>c.status==='active').length || 0, lbl: 'Courts activos' },
            { val: expiring.length, lbl: '⚠️ Contratos expiran' },
          ].map((k,i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono">{k.val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { href: '#', icon: '📋', label: 'Courts', sub: `${courts?.length || 0} pistas` },
          { href: '#', icon: '👥', label: 'Miembros', sub: 'Gestionar' },
          { href: '#', icon: '💰', label: 'Ingresos', sub: 'Ver informe' },
          { href: '/operator/sponsoring', icon: '📢', label: 'Sponsoring', sub: `${contracts?.length || 0} contratos` },
        ].map(a => (
          <Link key={a.label} href={a.href} className="bg-white rounded-2xl p-4 border border-gray-100 active:scale-95 transition-transform">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-cc-dark">{a.label}</div>
            <div className="text-xs text-gray-500">{a.sub}</div>
          </Link>
        ))}
      </div>

      {/* COURTS */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-bold text-cc-dark mb-3">Courts</h2>
        <div className="space-y-2">
          {courts?.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-3 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cc-blue to-cc-teal flex items-center justify-center text-white text-lg">🏸</div>
              <div className="flex-1"><div className="text-sm font-semibold">{c.display_name || c.name}</div></div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {c.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SPONSORING ALERT */}
      {expiring.length > 0 && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-2">⚠️ Contratos próximos a vencer</h3>
          {expiring.slice(0,3).map(c => (
            <div key={c.id} className="flex justify-between items-center py-1.5 text-xs">
              <span className="text-amber-700">{c.sponsor_name}</span>
              <span className="font-bold text-amber-800">{daysUntil(c.ends_at)} días</span>
            </div>
          ))}
          <Link href="/operator/sponsoring" className="block text-center text-xs font-semibold text-amber-700 mt-2">Ver todos →</Link>
        </div>
      )}
    </div>
  )
}
