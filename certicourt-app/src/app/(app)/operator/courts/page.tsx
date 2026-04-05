'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const FLOOR_OPTIONS = [
  'CERTICOURT P5 TG4 (Azul)',
  'CERTICOURT P5 TG4 (Verde)',
  'Beton beschichtet',
  'Outdoor PVC',
  'Autre',
]

const SPORTS = ['pickleball', 'padel', 'tennis', 'badminton', 'squash']

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', display_name: '', wpc_id: '', sport: 'pickleball',
    floor_type: FLOOR_OPTIONS[0], width_m: '7.62', length_m: '20.12', sort_order: '1'
  })

  const CENTER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

  async function load() {
    const { data } = await supabase.from('courts').select('*').eq('center_id', CENTER_ID).order('sort_order')
    setCourts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setForm({ name: '', display_name: '', wpc_id: '', sport: 'pickleball', floor_type: FLOOR_OPTIONS[0], width_m: '7.62', length_m: '20.12', sort_order: String((courts.length || 0) + 1) })
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(c: any) {
    setForm({ name: c.name, display_name: c.display_name || '', wpc_id: c.wpc_id || '', sport: c.sport, floor_type: c.floor_type || FLOOR_OPTIONS[0], width_m: String(c.width_m || ''), length_m: String(c.length_m || ''), sort_order: String(c.sort_order || '') })
    setEditingId(c.id)
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { center_id: CENTER_ID, name: form.name, display_name: form.display_name || form.name, wpc_id: form.wpc_id || null, sport: form.sport, floor_type: form.floor_type, width_m: parseFloat(form.width_m) || null, length_m: parseFloat(form.length_m) || null, sort_order: parseInt(form.sort_order) || 0, status: 'active' }
    if (editingId) {
      await supabase.from('courts').update(payload).eq('id', editingId)
    } else {
      await supabase.from('courts').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'active' ? 'inactive' : 'active'
    await supabase.from('courts').update({ status: next }).eq('id', id)
    load()
  }

  async function deleteCourt(id: string) {
    if (!confirm('Eliminar este court?')) return
    await supabase.from('courts').delete().eq('id', id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-cc-dark font-bold">←</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">Courts</h1>
          <button onClick={startNew} className="bg-cc-blue text-white text-xs font-bold px-4 py-2 rounded-xl">+ Nuevo</button>
        </div>
      </div>

      {showForm && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm text-cc-dark mb-4">{editingId ? 'Editar court' : 'Nuevo court'}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nombre del court *</label>
              <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Court 1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nombre con patrocinador</label>
              <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="Court 1 — Deportes Garcia" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">WPC ID</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" placeholder="WPC-ID #0047" value={form.wpc_id} onChange={e => setForm({ ...form, wpc_id: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Deporte</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue bg-white" value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })}>
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tipo de suelo</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue bg-white" value={form.floor_type} onChange={e => setForm({ ...form, floor_type: e.target.value })}>
                {FLOOR_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Ancho (m)</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" step="0.01" value={form.width_m} onChange={e => setForm({ ...form, width_m: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Largo (m)</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" step="0.01" value={form.length_m} onChange={e => setForm({ ...form, length_m: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Orden</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cc-blue" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
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
        ) : courts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No hay courts. Crea el primero.</div>
        ) : courts.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-sm text-cc-dark">{c.display_name || c.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.sport} · {c.floor_type}</div>
                {c.wpc_id && <div className="text-xs text-cc-blue font-mono mt-0.5">{c.wpc_id}</div>}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {c.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-3">{c.width_m}m × {c.length_m}m</div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">Editar</button>
              <button onClick={() => toggleStatus(c.id, c.status)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${c.status === 'active' ? 'border-red-200 text-red-500' : 'border-green-200 text-green-600'}`}>
                {c.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => deleteCourt(c.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500">Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
