import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'
import { IconCalendar, IconKey, IconTicket, IconCreditCard, IconBuilding, IconGear, IconLogout, IconStar } from '@/components/icons'

export default async function AccountPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email || 'Jugador'
  const initials = name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2)

  const menuItems = [
    { href: '/agenda', Icon: IconCalendar, label: 'Mis reservas' },
    { href: '/agenda', Icon: IconKey, label: 'Mis llaves / PIN activos' },
    { href: '/account/bonos', Icon: IconTicket, label: 'Bonos y abonos' },
    { href: '/account/payments', Icon: IconCreditCard, label: 'Pagos y facturas' },
    { href: '/discover', Icon: IconBuilding, label: 'Mis centros favoritos' },
    { href: '/operator', Icon: IconGear, label: 'Panel de Operador', highlight: true },
  ]

  return (
    <div>
      <div className="bg-gradient-to-br from-cc-blue to-blue-900 text-white px-5 pt-14 pb-8 text-center">
        <div className="w-18 h-18 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-3xl font-bold w-20 h-20">
          {initials}
        </div>
        <h1 className="text-xl font-bold">{name}</h1>
        <p className="text-blue-200 text-sm mt-1">@{user.email?.split('@')[0]}</p>
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mt-3 text-sm font-medium">
          <IconStar size={16} /> Premium &middot; Miembro desde 2025
        </div>
      </div>

      {/* WALLET */}
      <div className="mx-4 -mt-5 bg-cc-blue rounded-2xl p-5 text-white shadow-lg">
        <p className="text-xs uppercase tracking-wide opacity-75">Monedero</p>
        <p className="text-3xl font-bold font-mono mt-1">{formatEur(profile?.wallet_balance || 0)}</p>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 rounded-xl border-2 border-white/30 bg-white/10 text-sm font-semibold active:scale-95 transition-transform">+ Recargar</button>
          <button className="flex-1 py-2 rounded-xl border-2 border-white/30 bg-white/10 text-sm font-semibold active:scale-95 transition-transform">Historial</button>
        </div>
      </div>

      <div className="mt-5 divide-y divide-gray-100">
        {menuItems.map(item => (
          <Link key={item.href + item.label} href={item.href}
            className="flex items-center gap-4 px-5 py-4 bg-white active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-cc-blue"><item.Icon size={20} /></div>
            <span className={`flex-1 text-sm font-medium ${item.highlight ? 'text-cc-blue font-semibold' : 'text-cc-dark'}`}>{item.label}</span>
            <span className="text-gray-300 text-xl">&rsaquo;</span>
          </Link>
        ))}

        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="flex items-center gap-4 px-5 py-4 w-full text-left active:bg-gray-50">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500"><IconLogout size={20} /></div>
            <span className="text-red-500 text-sm font-medium">Cerrar sesion</span>
          </button>
        </form>
      </div>
    </div>
  )
}
