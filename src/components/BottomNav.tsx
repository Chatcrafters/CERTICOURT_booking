'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/home',     icon: '🏠', label: 'Inicio' },
  { href: '/discover', icon: '🔍', label: 'Descubrir' },
  { href: '/book',     icon: '🎾', label: 'Reservar', center: true },
  { href: '/agenda',   icon: '📅', label: 'Agenda' },
  { href: '/account',  icon: '👤', label: 'Cuenta' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-area-pb z-50">
      {items.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
              ${active ? 'text-cc-blue' : 'text-gray-400'}`}>
            {item.center ? (
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl -mt-4 shadow-lg
                ${active ? 'bg-cc-blue text-white' : 'bg-cc-blue text-white'}`}>
                {item.icon}
              </div>
            ) : (
              <span className="text-xl leading-none">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
