import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'

export default async function HomePage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: bookings } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('profile_id', user.id)
    .in('status', ['confirmed', 'pending'])
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date').order('start_time').limit(3)

  const { data: courts } = await supabase.from('courts')
    .select('*, center:centers(name, city, slug)')
    .eq('status', 'active').limit(4)

  const name = profile?.first_name || user.email?.split('@')[0] || 'Jugador'
  const wallet = formatEur(profile?.wallet_balance || 0)

  return (
    <div>
      {/* HERO */}
      <div className="bg-gradient-to-br from-cc-blue to-blue-900 text-white px-5 pb-6 pt-14">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cc-teal"></div>
            CERTICOURT
          </div>
          <Link href="/account">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {name.slice(0,2).toUpperCase()}
            </div>
          </Link>
        </div>
        <p className="text-blue-200 text-sm">Bienvenido,</p>
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { val: bookings?.length || 0, lbl: 'Reservas activas' },
            { val: wallet, lbl: 'Monedero' },
            { val: 'Premium', lbl: 'Tarifa' },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold font-mono">{s.val}</div>
              <div className="text-xs text-blue-200 mt-0.5">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-3 p-4 -mt-4">
        {[
          { href: '/book', icon: '🎾', label: 'Reservar', sub: 'Busca un court ahora' },
          { href: '/agenda', icon: '🔑', label: 'Mis llaves', sub: 'Códigos activos' },
          { href: '/account', icon: '💳', label: 'Bonos', sub: 'Paquetes y abonos' },
          { href: '/discover', icon: '🗺️', label: 'Centros', sub: 'Descubrir' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-cc-blue">{a.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{a.sub}</div>
          </Link>
        ))}
      </div>

      {/* UPCOMING BOOKINGS */}
      {bookings && bookings.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-base font-bold text-cc-dark mb-3">Próximas reservas</h2>
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{b.court?.display_name || b.court?.name}</span>
                  <span className="text-xs bg-cc-blue-light text-cc-blue font-semibold px-2 py-1 rounded-full">
                    {b.date} {b.start_time?.slice(0,5)}
                  </span>
                </div>
                {b.pin_code && (
                  <div className="bg-cc-blue/10 rounded-xl p-3 text-center mt-2">
                    <p className="text-xs text-gray-500 mb-1">PIN de acceso</p>
                    <p className="text-2xl font-bold font-mono text-cc-blue tracking-widest">{b.pin_code}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVAILABLE COURTS */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-cc-dark">Courts disponibles</h2>
          <Link href="/discover" className="text-xs text-cc-blue font-semibold">Ver todos →</Link>
        </div>
        <div className="space-y-2">
          {courts?.map(c => (
            <Link key={c.id} href={`/book?court=${c.id}`} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 active:scale-95 transition-transform block">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cc-blue to-cc-teal flex items-center justify-center text-2xl flex-shrink-0">🏸</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{c.display_name || c.name}</div>
                <div className="text-xs text-gray-500">{(c as any).center?.city}</div>
                {c.wpc_id && <div className="text-xs text-cc-blue font-mono mt-0.5">{c.wpc_id}</div>}
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
