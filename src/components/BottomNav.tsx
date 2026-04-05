'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconSearch, IconRacket, IconCalendar, IconClock } from './icons'

const items = [
  { href: '/home',     Icon: IconHome,     label: 'Inicio' },
  { href: '/discover', Icon: IconSearch,   label: 'Descubrir' },
  { href: '/book',     Icon: IconRacket,   label: 'Reservar', center: true },
  { href: '/agenda',   Icon: IconCalendar, label: 'Agenda' },
  { href: '/history',  Icon: IconClock,    label: 'Historial' },
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
              <div className={`w-11 h-11 rounded-full flex items-center justify-center -mt-4 shadow-lg
                ${active ? 'bg-cc-blue text-white' : 'bg-cc-blue text-white'}`}>
                <item.Icon size={22} />
              </div>
            ) : (
              <item.Icon size={22} />
            )}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
