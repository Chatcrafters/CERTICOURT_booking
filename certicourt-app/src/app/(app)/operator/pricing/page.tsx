'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const CENTER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export default function PricingPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', name_de: '', name_es: '',
    price_per_slot: '', duration_min: '90',
    is_peak: false, peak_days: [] as number[],
    peak_time_start: '', peak_time_end: '',
    requires_membership: false, requires_trainer: false, is_active: true
  })

  async function load() {
    const { data } = await supabase.from('pricing_rules').select('*').eq('center_id', CENTER_ID).order('price_per_slot')
    setRules(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: '', name_de: '', name_es: '', price_per_slot: '', duration_min: '90', is_peak: false, peak_days: [], peak_time_start: '', peak_time_end: '', requires_membership: false, requires_trainer: false, is_active: true })
  }

  function startNew() { resetForm(); setEditingId(null); setShowForm(true) }

  function startEdit(r: any) {
    setForm({ name: r.name, name_de: r.name_de || '', name_es: r.name_es || '', price_per_slot: String(r.price_per_slot), duration_min: String(r.duration_min), is_peak: r.is_peak, peak_days: r.peak_days || [], peak_time_start: r.peak_time_start || '', peak_time_end: r.peak_time_end || '', requires_membership: r.requires_membership, requires_trainer: r.requires_trainer, is_active: r.is_active })
    setEditingId(r.id); setShowForm(true)
  }

  function toggleDay(d: number) {
    setForm(f => ({ ...f, peak_days: f.peak_days.includes(d) ? f.peak_days.filter(x => x !== d) : [...f.peak_days, d] }))
  }

  async function save() {
    if (!form.name.trim() || !form.price_per_slot) return
    setSaving(true)
    const payload = {
      center_id: CENTER_ID, name: form.name, name_de: form.name_de || null, name_es: form.name_es || null,
      price_per_slot: parseFloat(form.price_per_slot), duration_min: parseInt(form.duration_min) || 90,
      is_peak: form.is_peak, peak_days: form.is_peak && form.peak_days.length ? form.peak_days : null,
      peak_time_start: form.is_peak && form.peak_time_start ? form.peak_time_start + ':00' : null,
      peak_time_end: form.is_peak && form.peak_time_end ? form.peak_time_end + ':00' : null,
      requires_membership: form.requires_membership, requires_trainer: form.requires_trainer, is_active: form.is_active
    }
    if (editingId) { await supabase.from('pricing_rules').update(payload).eq('id', editingId) }
    else { await supabase.from('pricing_rules').insert(payload) }
    setSaving(false); setShowForm(false); load()
  }

  async function deleteRule(id: string) {
    if (!confirm('Eliminar esta tarifa?')) return
    await supabase.from('pricing_rules').delete().eq('id', id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold">←</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">Precios y tarifas</h1>
          <button onClick={startNew} className="bg-cc-blue text-white text-xs font-bold px-4 py-2 rounded-xl">+ Nueva</button>
        </div>
      </div>

      {showForm && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm text-cc-dark mb-4">{editingId ? 'Editar tarifa' : 'Nueva tarifa'}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nombre *</label>
              <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Tarifa estandar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre DE</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Normaltarif" value={form.name_de} onChange={e => setForm({ ...form, name_de: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre ES</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Tarifa estandar" value={form.name_es} onChange={e => setForm({ ...form, name_es: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Precio por slot (€) *</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" step="0.50" placeholder="15.00" value={form.price_per_slot} onChange={e => setForm({ ...form, price_per_slot: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Duracion (min)</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue bg-white" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: e.target.value })}>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-1">
              <input type="checkbox" id="is_peak" checked={form.is_peak} onChange={e => setForm({ ...form, is_peak: e.target.checked })} className="w-4 h-4 accent-cc-blue" />
              <label htmlFor="is_peak" className="text-sm font-medium text-cc-dark">Tarifa peak (precio especial segun horario)</label>
            </div>

            {form.is_peak && (
              <div className="bg-amber-50 rounded-xl p-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Dias de peak</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map((d, i) => (
                      <button key={i} type="button" onClick={() => toggleDay(i)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${form.peak_days.includes(i) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Hora inicio</label>
                    <input type="time" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={form.peak_time_start} onChange={e => setForm({ ...form, peak_time_start: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Hora fin</label>
                    <input type="time" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={form.peak_time_end} onChange={e => setForm({ ...form, peak_time_end: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="req_mem" checked={form.requires_membership} onChange={e => setForm({ ...form, requires_membership: e.target.checked })} className="w-4 h-4 accent-cc-blue" />
                <label htmlFor="req_mem" className="text-sm text-cc-dark">Requiere membresia</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="req_train" checked={form.requires_trainer} onChange={e => setForm({ ...form, requires_trainer: e.target.checked })} className="w-4 h-4 accent-cc-blue" />
                <label htmlFor="req_train" className="text-sm text-cc-dark">Requiere entrenador (tarifa alumno)</label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-cc-blue text-white text-sm font-bold disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No hay tarifas. Crea la primera.</div>
        ) : rules.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-bold text-sm text-cc-dark">{r.name_es || r.name}</div>
                {r.name_de && <div className="text-xs text-gray-400">{r.name_de}</div>}
              </div>
              <div className="font-bold text-cc-blue font-mono">{formatEur(r.price_per_slot)}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.duration_min} min</span>
              {r.is_peak && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Peak</span>}
              {r.requires_membership && <span className="text-xs bg-blue-100 text-cc-blue px-2 py-0.5 rounded-full">Membresia</span>}
              {r.requires_trainer && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Entrenador</span>}
              {r.is_peak && r.peak_time_start && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{r.peak_time_start?.slice(0,5)} - {r.peak_time_end?.slice(0,5)}</span>}
              {r.is_peak && r.peak_days?.length > 0 && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{r.peak_days.map((d: number) => DAYS[d]).join(', ')}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(r)} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">Editar</button>
              <button onClick={() => deleteRule(r.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500">Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
