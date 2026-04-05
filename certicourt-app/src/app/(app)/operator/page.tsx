import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur, daysUntil } from '@/lib/helpers'

export default async function OperatorPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: bookings }, { data: courts }, { data: contracts }, { data: members }] = await Promise.all([
    supabase.from('bookings').select('total_price, status').eq('date', today),
    supabase.from('courts').select('id, name, display_name, status'),
    supabase.from('sponsoring_contracts').select('*, spot:sponsoring_spots(name, category)').order('ends_at'),
    supabase.from('memberships').select('id').eq('status', 'active'),
  ])

  const todayBookings = bookings?.filter(b => b.status !== 'cancelled') || []
  const revenue = todayBookings.reduce((s, b) => s + (b.total_price || 0), 0)
  const expiring = contracts?.filter(c => daysUntil(c.ends_at) <= 90) || []

  const navItems = [
    { href: '/operator/courts',      icon: '▣', label: 'Courts',          sub: `${courts?.length || 0} pistas` },
    { href: '/operator/pricing',     icon: '€', label: 'Precios',          sub: 'Tarifas y peak' },
    { href: '/operator/memberships', icon: '★', label: 'Membresías',       sub: 'Abonos y bonos' },
    { href: '/operator/hours',       icon: '◷', label: 'Horarios',         sub: 'Apertura y cierre' },
    { href: '/operator/sponsoring',  icon: '◈', label: 'Sponsoring',       sub: `${contracts?.length || 0} contratos` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-cc-dark text-white px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-sm font-bold tracking-tight">CERTICOURT — Panel Operador</div>
          <Link href="/account" className="text-xs text-gray-400">Salir</Link>
        </div>
        <div className="text-xs text-gray-400 mb-3">CERTICOURT El Puerto · {today}</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: todayBookings.length, lbl: 'Reservas hoy' },
            { val: formatEur(revenue),   lbl: 'Ingresos hoy' },
            { val: `${courts?.filter(c => c.status === 'active').length || 0} / ${courts?.length || 0}`, lbl: 'Courts activos' },
            { val: members?.length || 0, lbl: 'Miembros activos' },
          ].map((k, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono">{k.val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Configuracion</p>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 border border-gray-100 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-cc-blue-light flex items-center justify-center text-cc-blue font-bold text-lg">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-cc-dark">{item.label}</div>
              <div className="text-xs text-gray-400">{item.sub}</div>
            </div>
            <span className="text-gray-300">›</span>
          </Link>
        ))}

        {expiring.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4">
            <p className="text-sm font-bold text-amber-800 mb-2">Contratos proximos a vencer</p>
            {expiring.slice(0, 3).map(c => (
              <div key={c.id} className="flex justify-between text-xs py-1">
                <span className="text-amber-700">{c.sponsor_name}</span>
                <span className="font-bold text-amber-800">{daysUntil(c.ends_at)} dias</span>
              </div>
            ))}
            <Link href="/operator/sponsoring" className="block text-center text-xs font-semibold text-amber-700 mt-2">
              Ver todos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
