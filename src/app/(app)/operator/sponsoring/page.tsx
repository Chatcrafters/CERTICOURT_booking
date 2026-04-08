'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatEur, formatDateShort } from '@/lib/helpers'
import { t, Lang } from '@/lib/i18n/translations'
import { supabase } from '@/lib/supabase'
import { IconMegaphone, IconCourt, IconWarning, IconCheck } from '@/components/icons'

interface Sponsor {
  id: string; name: string; type: string; court_id: string | null
  annual_amount: number; contract_start: string; contract_end: string
  status: string; notes: string | null; logo_url: string | null
  court: any
}

export default function SponsoringPage() {
  const [lang, setLang] = useState<Lang>('es')
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [stats, setStats] = useState({ active: 0, totalAnnual: 0, expiring30: 0 })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'naming', court_id: '', annual_amount: '', contract_start: '', contract_end: '', notes: '' })

  const sp = t(lang).sponsorPage
  const c = t(lang).common

  useEffect(() => { loadData() }, [])

  function loadData() {
    fetch('/api/operator/sponsoring').then(r => r.json()).then(data => {
      setSponsors(data.sponsors || [])
      setCourts(data.courts || [])
      setStats(data.stats || { active: 0, totalAnnual: 0, expiring30: 0 })
      setLoading(false)
    })
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!form.name || !form.annual_amount || !form.contract_start || !form.contract_end) return
    setSaving(true)

    const res = await fetch('/api/operator/sponsoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, annual_amount: Number(form.annual_amount) }),
    })

    if (res.ok) {
      const sponsor = await res.json()

      // Upload logo if selected
      if (logoFile && sponsor.id) {
        const path = `${sponsor.id}/${logoFile.name}`
        await supabase.storage.from('sponsor-logos').upload(path, logoFile, { upsert: true })
        const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(path)
        if (urlData?.publicUrl) {
          await fetch('/api/operator/sponsoring', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sponsor.id, logo_url: urlData.publicUrl }),
          })
        }
      }

      setForm({ name: '', type: 'naming', court_id: '', annual_amount: '', contract_start: '', contract_end: '', notes: '' })
      setLogoFile(null)
      setLogoPreview(null)
      setShowForm(false)
      loadData()
    }
    setSaving(false)
  }

  function daysLeft(dateStr: string) {
    return Math.max(0, Math.round((new Date(dateStr).getTime() - Date.now()) / 86400000))
  }

  const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-600', pending: 'bg-amber-100 text-amber-700' }
  const statusLabels = (s: string) => s === 'active' ? sp.active : s === 'expired' ? sp.expired : sp.pending

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">{sp.title}</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'es' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>ES</button>
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-md text-xs font-semibold ${lang === 'de' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>DE</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cc-blue-light rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-cc-blue">{stats.active}</div>
            <div className="text-xs text-blue-600">{sp.activeContracts}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold font-mono text-green-600">{formatEur(stats.totalAnnual)}</div>
            <div className="text-xs text-green-600">{sp.annualRevenue}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-amber-600">{stats.expiring30}</div>
            <div className="text-xs text-amber-600">{sp.expiring30}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">{c.loading}</p>
        ) : (
          <>
            {/* Sponsor list */}
            {sponsors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-300 flex justify-center mb-2"><IconMegaphone size={40} /></div>
                <p className="text-sm text-gray-400">{sp.noSponsors}</p>
              </div>
            ) : sponsors.map(s => {
              const days = daysLeft(s.contract_end)
              const isExpired = s.status === 'expired' || days === 0
              return (
                <div key={s.id} className={`bg-white rounded-2xl p-4 border ${isExpired ? 'border-red-200 opacity-75' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-3">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cc-blue to-cc-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-cc-dark truncate">{s.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.type === 'naming' ? 'bg-cc-blue-light text-cc-blue' : 'bg-amber-100 text-amber-700'}`}>
                          {s.type === 'naming' ? sp.naming : sp.banner}
                        </span>
                      </div>
                      {s.court && <div className="text-xs text-gray-500 mb-1"><IconCourt size={10} className="inline mr-1" />{(s.court as any)?.display_name || (s.court as any)?.name}</div>}
                      <div className="text-xs text-gray-500">{formatDateShort(s.contract_start)} &rarr; {formatDateShort(s.contract_end)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold font-mono text-sm text-cc-blue">{formatEur(s.annual_amount)}</div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[s.status] || 'bg-gray-100'}`}>
                        {statusLabels(s.status)}
                      </span>
                      {!isExpired && <div className="text-xs text-gray-400 mt-1">{days} {sp.daysLeft}</div>}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add sponsor */}
            {!showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-cc-blue hover:text-cc-blue transition-colors">
                + {sp.addSponsor}
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <h3 className="text-sm font-bold text-cc-dark">{sp.addSponsor}</h3>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder={sp.name} />
                <div className="flex gap-2">
                  {(['naming', 'banner'] as const).map(tp => (
                    <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 ${form.type === tp ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 text-gray-600'}`}>
                      {tp === 'naming' ? sp.naming : sp.banner}
                    </button>
                  ))}
                </div>
                {form.type === 'naming' && (
                  <select value={form.court_id} onChange={e => setForm(f => ({ ...f, court_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                    <option value="">{sp.courtSelect}</option>
                    {courts.map(ct => <option key={ct.id} value={ct.id}>{ct.display_name || ct.name}</option>)}
                  </select>
                )}
                <input type="number" value={form.annual_amount} onChange={e => setForm(f => ({ ...f, annual_amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder={`${sp.annualAmount} (EUR)`} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">{sp.contractStart}</label>
                    <input type="date" value={form.contract_start} onChange={e => setForm(f => ({ ...f, contract_start: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">{sp.contractEnd}</label>
                    <input type="date" value={form.contract_end} onChange={e => setForm(f => ({ ...f, contract_end: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16" placeholder={sp.notes} />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Logo</label>
                  <div className="flex items-center gap-3">
                    {logoPreview && <img src={logoPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />}
                    <input type="file" accept="image/*" onChange={handleLogoSelect}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cc-blue-light file:text-cc-blue" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex-1 bg-cc-blue text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 active:scale-95 transition-transform">
                    {saving ? '...' : c.save}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg">
                    {c.cancel}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
