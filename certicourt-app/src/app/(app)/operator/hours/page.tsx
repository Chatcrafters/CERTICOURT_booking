'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
const CENTER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export default function HoursPage() {
  const [hours, setHours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(
    DAYS.map((_, i) => ({ day: i, open: '07:00', close: '23:00', active: true }))
  )

  async function load() {
    const { data } = await supabase.from('opening_hours').select('*').eq('center_id', CENTER_ID).is('court_id', null).order('day_of_week')
    if (data && data.length > 0) {
      setForm(DAYS.map((_, i) => {
        const d = data.find(h => h.day_of_week === i)
        return { day: i, open: d?.open_time?.slice(0,5) || '07:00', close: d?.close_time?.slice(0,5) || '23:00', active: !!d?.is_active }
      }))
    }
    setHours(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    await supabase.from('opening_hours').delete().eq('center_id', CENTER_ID).is('court_id', null)
    const toInsert = form.filter(f => f.active).map(f => ({
      center_id: CENTER_ID, court_id: null, day_of_week: f.day,
      open_time: f.open + ':00', close_time: f.close + ':00', is_active: true
    }))
    if (toInsert.length > 0) await supabase.from('opening_hours').insert(toInsert)
    setSaving(false)
    alert('Horarios guardados correctamente')
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold">←</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">Horarios de apertura</h1>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
        ) : form.map((f, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 transition-all ${f.active ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-cc-dark">{DAYS[i]}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-400">{f.active ? 'Abierto' : 'Cerrado'}</span>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${f.active ? 'bg-cc-blue' : 'bg-gray-200'}`}
                  onClick={() => setForm(prev => prev.map((d, j) => j === i ? { ...d, active: !d.active } : d))}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${f.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
            {f.active && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Apertura</label>
                  <input type="time" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={f.open} onChange={e => setForm(prev => prev.map((d, j) => j === i ? { ...d, open: e.target.value } : d))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Cierre</label>
                  <input type="time" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={f.close} onChange={e => setForm(prev => prev.map((d, j) => j === i ? { ...d, close: e.target.value } : d))} />
                </div>
              </div>
            )}
          </div>
        ))}

        <button onClick={save} disabled={saving} className="w-full py-3.5 rounded-2xl bg-cc-blue text-white font-bold text-sm disabled:opacity-50 mt-4">
          {saving ? 'Guardando...' : 'Guardar horarios'}
        </button>
      </div>
    </div>
  )
}
