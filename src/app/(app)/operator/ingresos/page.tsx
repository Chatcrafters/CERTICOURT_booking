'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatEur, formatDateShort } from '@/lib/helpers'
import { t, Lang } from '@/lib/i18n/translations'
import { IconMoney, IconCourt, IconMegaphone, IconWarning } from '@/components/icons'

export default function IngresosPage() {
  const [lang, setLang] = useState<Lang>('es')
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const ig = t(lang).ingresos

  useEffect(() => {
    setLoading(true)
    fetch(`/api/operator/ingresos?period=${period}`).then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [period])

  function exportCsv() {
    if (!data?.bookings) return
    const rows = [['Fecha', 'Court', 'Usuario', 'Duracion', 'Importe', 'Pago'].join(',')]
    for (const b of data.bookings) {
      rows.push([
        b.date, (b.court as any)?.display_name || (b.court as any)?.name || '',
        (b.profile as any)?.email || '', b.duration_min + 'min',
        b.total_price?.toFixed(2), b.payment_mode
      ].join(','))
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `ingresos-${period}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const maxChart = data?.monthlyData ? Math.max(...data.monthlyData.map((m: any) => m.amount), 1) : 1

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">{ig.title}</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'es' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>ES</button>
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'de' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>DE</button>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['today', 'week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p ? 'bg-cc-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
              {ig[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-8">{t(lang).common.loading}</p>
      ) : data && (
        <div className="p-4 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: ig.bookingRevenue, val: formatEur(data.kpi.bookingRevenue), color: 'bg-cc-blue-light text-cc-blue' },
              { label: ig.namingRevenue, val: formatEur(data.kpi.namingRevenue), color: 'bg-green-50 text-green-600' },
              { label: ig.bannerRevenue, val: formatEur(data.kpi.bannerRevenue), color: 'bg-amber-50 text-amber-600' },
              { label: ig.certicourtFee, val: `-${formatEur(data.kpi.certicourtFee)}`, color: 'bg-red-50 text-red-500' },
            ].map(k => (
              <div key={k.label} className={`${k.color} rounded-xl p-3 text-center`}>
                <div className="text-lg font-bold font-mono">{k.val}</div>
                <div className="text-xs mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-xs text-green-600">{ig.netProfit}</div>
            <div className="text-2xl font-bold font-mono text-green-700">{formatEur(data.kpi.netProfit)}</div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-cc-dark mb-3">{ig.monthlyChart}</h3>
            <div className="flex items-end gap-1 h-32">
              {data.monthlyData?.map((m: any) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-cc-blue rounded-t" style={{ height: `${Math.max(4, (m.amount / maxChart) * 100)}%` }} />
                  <span className="text-[9px] text-gray-400">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-cc-dark">{ig.bookingRevenue}</h3>
              <button onClick={exportCsv} className="text-xs font-semibold text-cc-blue">{ig.exportCsv}</button>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {data.bookings?.slice(0, 20).map((b: any) => (
                <div key={b.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-cc-dark truncate">{(b.court as any)?.display_name || (b.court as any)?.name}</div>
                    <div className="text-gray-400">{formatDateShort(b.date)} &middot; {b.start_time?.slice(0, 5)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold font-mono text-green-600">{formatEur(b.total_price)}</div>
                    <div className="text-gray-400">{b.payment_mode}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Income */}
          {data.sponsors?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <h3 className="text-sm font-bold text-cc-dark">{ig.sponsorIncome}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {data.sponsors.map((sp: any) => (
                  <div key={sp.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-cc-dark">{sp.name}</div>
                      <div className="text-gray-400">{sp.type} {(sp.court as any)?.name ? `· ${(sp.court as any).name}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono">{formatEur(sp.annual_amount)} / {ig.annual}</div>
                      <div className="text-gray-400">{formatEur(sp.annual_amount / 12)} / {ig.monthly}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
