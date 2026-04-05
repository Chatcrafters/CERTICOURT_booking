'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatEur } from '@/lib/helpers'

const CENTER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export default function MembershipsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', name_de: '', name_es: '', price_monthly: '', hours_monthly: '', discount_pct: '', perks: '' })

  async function load() {
    const { data } = await supabase.from('membership_plans').select('*').eq('center_id', CENTER_ID).order('price_monthly')
    setPlans(data || []); setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setForm({ name: '', name_de: '', name_es: '', price_monthly: '', hours_monthly: '', discount_pct: '', perks: '' })
    setEditingId(null); setShowForm(true)
  }

  function startEdit(p: any) {
    setForm({ name: p.name, name_de: p.name_de || '', name_es: p.name_es || '', price_monthly: String(p.price_monthly), hours_monthly: String(p.hours_monthly || ''), discount_pct: String(p.discount_pct || ''), perks: (p.perks || []).join(', ') })
    setEditingId(p.id); setShowForm(true)
  }

  async function save() {
    if (!form.name.trim() || !form.price_monthly) return
    setSaving(true)
    const payload = { center_id: CENTER_ID, name: form.name, name_de: form.name_de || null, name_es: form.name_es || null, price_monthly: parseFloat(form.price_monthly), hours_monthly: parseFloat(form.hours_monthly) || null, discount_pct: parseFloat(form.discount_pct) || 0, perks: form.perks ? form.perks.split(',').map(s => s.trim()).filter(Boolean) : [], is_active: true }
    if (editingId) { await supabase.from('membership_plans').update(payload).eq('id', editingId) }
    else { await supabase.from('membership_plans').insert(payload) }
    setSaving(false); setShowForm(false); load()
  }

  async function deletePlan(id: string) {
    if (!confirm('Eliminar este plan?')) return
    await supabase.from('membership_plans').delete().eq('id', id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold">←</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">Membresias</h1>
          <button onClick={startNew} className="bg-cc-blue text-white text-xs font-bold px-4 py-2 rounded-xl">+ Nueva</button>
        </div>
      </div>

      {showForm && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm text-cc-dark mb-4">{editingId ? 'Editar membresia' : 'Nueva membresia'}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nombre *</label>
              <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Premium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre DE</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={form.name_de} onChange={e => setForm({ ...form, name_de: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre ES</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" value={form.name_es} onChange={e => setForm({ ...form, name_es: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Precio/mes (€) *</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" step="0.50" placeholder="39" value={form.price_monthly} onChange={e => setForm({ ...form, price_monthly: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Horas/mes</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" placeholder="8" value={form.hours_monthly} onChange={e => setForm({ ...form, hours_monthly: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Descuento (%)</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" placeholder="20" value={form.discount_pct} onChange={e => setForm({ ...form, discount_pct: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ventajas (separadas por coma)</label>
              <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="PIN-Zugang, Gastes erlaubt, Prioritat" value={form.perks} onChange={e => setForm({ ...form, perks: e.target.value })} />
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
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No hay planes. Crea el primero.</div>
        ) : plans.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-sm text-cc-dark">{p.name}</div>
                {p.name_de && <div className="text-xs text-gray-400">{p.name_de} / {p.name_es}</div>}
              </div>
              <div className="text-right">
                <div className="font-bold text-cc-blue font-mono">{formatEur(p.price_monthly)}/mes</div>
                {p.discount_pct > 0 && <div className="text-xs text-green-600">-{p.discount_pct}% descuento</div>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.hours_monthly && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.hours_monthly}h/mes</span>}
              {(p.perks || []).map((perk: string, i: number) => (
                <span key={i} className="text-xs bg-cc-blue-light text-cc-blue px-2 py-0.5 rounded-full">{perk}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">Editar</button>
              <button onClick={() => deletePlan(p.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500">Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
