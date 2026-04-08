'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatEur, formatDateShort } from '@/lib/helpers'
import { t, Lang } from '@/lib/i18n/translations'
import { IconUsers, IconSearch, IconUser, IconWallet, IconMegaphone } from '@/components/icons'

interface UserData {
  id: string; name: string; email: string; phone: string; wallet_balance: number
  created_at: string; bookings_count: number; total_spent: number; last_activity: string | null; active: boolean
}

export default function UsuariosPage() {
  const [lang, setLang] = useState<Lang>('es')
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState({ total: 0, activeMonth: 0, newWeek: 0 })
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const u = t(lang).usuarios

  useEffect(() => {
    fetch('/api/operator/usuarios').then(r => r.json()).then(data => {
      setUsers(data.users || [])
      setStats(data.stats || { total: 0, activeMonth: 0, newWeek: 0 })
      setLoading(false)
    })
  }, [])

  const filtered = users.filter(usr =>
    usr.name.toLowerCase().includes(search.toLowerCase()) ||
    usr.email?.toLowerCase().includes(search.toLowerCase()) ||
    usr.phone?.includes(search)
  )

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">{u.title}</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'es' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>ES</button>
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'de' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>DE</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{stats.total}</div>
            <div className="text-xs text-blue-600">{u.total}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-green-600">{stats.activeMonth}</div>
            <div className="text-xs text-green-600">{u.activeMonth}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-amber-600">{stats.newWeek}</div>
            <div className="text-xs text-amber-600">{u.newWeek}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
          <IconSearch size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" placeholder={u.search} />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">{t(lang).common.loading}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 flex justify-center mb-2"><IconUsers size={40} /></div>
            <p className="text-sm text-gray-400">{u.noUsers}</p>
          </div>
        ) : filtered.map(usr => (
          <div key={usr.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button onClick={() => setExpanded(expanded === usr.id ? null : usr.id)} className="w-full text-left p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cc-blue-light text-cc-blue flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {usr.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-cc-dark truncate">{usr.name}</div>
                  <div className="text-xs text-gray-500 truncate">{usr.email}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${usr.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {usr.active ? u.active : u.inactive}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div><span className="text-gray-400">{u.bookings}</span><div className="font-semibold font-mono">{usr.bookings_count}</div></div>
                <div><span className="text-gray-400">{u.spent}</span><div className="font-semibold font-mono">{formatEur(usr.total_spent)}</div></div>
                <div><span className="text-gray-400">Wallet</span><div className="font-semibold font-mono">{formatEur(usr.wallet_balance)}</div></div>
              </div>
            </button>
            {expanded === usr.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-50 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">{u.since}</span><div className="font-medium">{usr.created_at ? formatDateShort(usr.created_at) : '-'}</div></div>
                  <div><span className="text-gray-400">{u.lastActivity}</span><div className="font-medium">{usr.last_activity ? formatDateShort(usr.last_activity) : '-'}</div></div>
                </div>
                {usr.phone && <div className="text-xs text-gray-500">Tel: {usr.phone}</div>}
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cc-blue text-white text-xs font-semibold active:scale-95 transition-transform">
                  <IconMegaphone size={14} /> {u.sendMessage}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
