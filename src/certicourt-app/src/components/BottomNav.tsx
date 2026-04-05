'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const icons: Record<string, React.ReactNode> = {
  home: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  discover: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  book: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  agenda: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  account: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

const items = [
  { href: '/home',     icon: 'home',     label: 'Inicio' },
  { href: '/discover', icon: 'discover', label: 'Descubrir' },
  { href: '/book',     icon: 'book',     label: 'Reservar', center: true },
  { href: '/agenda',   icon: 'agenda',   label: 'Agenda' },
  { href: '/account',  icon: 'account',  label: 'Cuenta' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50 max-w-md mx-auto">
      {items.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
              ${active ? 'text-cc-blue' : 'text-gray-400'}`}>
            {item.center ? (
              <div className="w-11 h-11 rounded-full bg-cc-blue flex items-center justify-center text-white -mt-4 shadow-lg">
                {icons[item.icon]}
              </div>
            ) : (
              <span className={active ? 'text-cc-blue' : 'text-gray-400'}>{icons[item.icon]}</span>
            )}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
