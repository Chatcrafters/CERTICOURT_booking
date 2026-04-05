'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { generateTimeSlots, formatEur } from '@/lib/helpers'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const PEAK_HOURS = ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30']
const PRICES = { normal: 15, peak: 20, premium_discount: 0.20 }

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [courts, setCourts] = useState<any[]>([])
  const [tarifas, setTarifas] = useState<any[]>([])
  const [existingBookings, setExistingBookings] = useState<any[]>([])

  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTarifa, setSelectedTarifa] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const dates = Array.from({length: 7}, (_, i) => addDays(new Date(), i))
  const slots = generateTimeSlots('07:00', '23:00', 90)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [{ data: c }, { data: t }, { data: p }] = await Promise.all([
        supabase.from('courts').select('*, center:centers(name,city)').eq('status','active'),
        supabase.from('pricing_rules').select('*').eq('is_active', true),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ])
      setCourts(c || []); setTarifas(t || []); setProfile(p)
      if (c?.length) setSelectedCourt(c[0])
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedCourt) return
    supabase.from('bookings')
      .select('start_time').eq('court_id', selectedCourt.id)
      .eq('date', dateStr).neq('status','cancelled')
      .then(({ data }) => setExistingBookings(data || []))
  }, [selectedCourt, dateStr])

  const takenTimes = new Set(existingBookings.map(b => b.start_time?.slice(0,5)))

  function isPeak(time: string) { return PEAK_HOURS.includes(time) }

  function calcPrice(tarifa: any) {
    if (!tarifa) return 0
    const base = isPeak(selectedTime) ? PRICES.peak : PRICES.normal
    const disc = tarifa.discount_pct ? tarifa.discount_pct / 100 : PRICES.premium_discount
    return base * (1 - disc)
  }

  async function confirmBooking() {
    if (!selectedCourt || !selectedTime || !selectedTarifa) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const base = isPeak(selectedTime) ? PRICES.peak : PRICES.normal
    const disc = selectedTarifa.discount_pct || 20
    const total = base * (1 - disc / 100)
    const startH = parseInt(selectedTime.split(':')[0])
    const startM = parseInt(selectedTime.split(':')[1])
    const endM = startM + 90
    const endH = startH + Math.floor(endM / 60)
    const endTime = `${String(endH).padStart(2,'0')}:${String(endM % 60).padStart(2,'0')}:00`

    const { data, error } = await supabase.from('bookings').insert({
      center_id: selectedCourt.center_id,
      court_id: selectedCourt.id,
      profile_id: user.id,
      pricing_rule_id: selectedTarifa.id,
      date: dateStr,
      start_time: selectedTime + ':00',
      end_time: endTime,
      duration_min: 90,
      status: 'confirmed',
      payment_status: 'paid',
      payment_mode: 'online',
      base_price: base,
      discount_pct: disc,
      discount_amount: base * disc / 100,
      total_price: total,
    }).select().single()

    if (!error && data) router.push(`/book/confirmation/${data.id}`)
    else { alert('Error al crear reserva: ' + error?.message); setLoading(false) }
  }

  const Step = ({ n, label }: { n: number, label: string }) => (
    <div className={`flex flex-col items-center ${step >= n ? 'text-cc-blue' : 'text-gray-300'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${step > n ? 'bg-cc-blue text-white' : step === n ? 'bg-cc-blue text-white ring-4 ring-cc-blue/20' : 'bg-gray-200 text-gray-400'}`}>
        {step > n ? '✓' : n}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && <button onClick={() => setStep(s => s-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">←</button>}
          <h1 className="text-base font-bold text-cc-dark flex-1">
            {step === 1 ? 'Seleccionar horario' : step === 2 ? 'Tarifas y bonos' : 'Resumen'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Step n={1} label="Hora" /><div className={`flex-1 h-0.5 ${step > 1 ? 'bg-cc-blue' : 'bg-gray-200'}`} />
          <Step n={2} label="Tarifa" /><div className={`flex-1 h-0.5 ${step > 2 ? 'bg-cc-blue' : 'bg-gray-200'}`} />
          <Step n={3} label="Resumen" />
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* STEP 1 */}
        {step === 1 && <>
          {/* Court selector */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Pista</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {courts.map(c => (
                <button key={c.id} onClick={() => setSelectedCourt(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors
                    ${selectedCourt?.id === c.id ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 bg-white text-gray-600'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date selector */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Fecha</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {dates.map((d, i) => {
                const active = format(d,'yyyy-MM-dd') === dateStr
                return (
                  <button key={i} onClick={() => setSelectedDate(d)}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-colors
                      ${active ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 bg-white text-gray-600'}`}>
                    <span className="text-xs uppercase">{format(d,'EEE',{locale:es})}</span>
                    <span className="text-lg font-bold">{format(d,'d')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected slot banner */}
          {selectedTime && (
            <div className="bg-cc-blue-light border-2 border-cc-blue rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-cc-blue font-bold font-mono text-lg">
                  {selectedTime} – {(() => { const [h,m] = selectedTime.split(':').map(Number); const em = m+90; return `${String(h+Math.floor(em/60)).padStart(2,'0')}:${String(em%60).padStart(2,'0')}` })()}
                </div>
                <div className="text-xs text-gray-500">1 tramo seleccionado</div>
              </div>
              <button onClick={() => setStep(2)} className="bg-cc-blue text-white font-bold px-4 py-2 rounded-xl text-sm">
                Reservar →
              </button>
            </div>
          )}

          {/* Time grid */}
          <div className="grid grid-cols-3 gap-2">
            {slots.map(slot => {
              const taken = takenTimes.has(slot)
              const peak = isPeak(slot)
              const selected = selectedTime === slot
              return (
                <button key={slot} disabled={taken}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl py-3 text-center border-2 transition-all
                    ${taken ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                    : selected ? 'border-cc-blue bg-cc-blue-light'
                    : peak ? 'border-amber-200 bg-white hover:border-amber-400'
                    : 'border-gray-200 bg-white hover:border-cc-blue'}`}>
                  <div className={`font-bold font-mono text-sm ${taken ? 'text-gray-300' : selected ? 'text-cc-blue' : peak ? 'text-amber-600' : 'text-cc-dark'}`}>
                    {slot}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{taken ? 'No disp.' : 'Disponible'}</div>
                  {!taken && (
                    <div className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-md inline-block
                      ${peak ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {formatEur(peak ? PRICES.peak : PRICES.normal)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl">
            💡 Solo puedes seleccionar tramos de 90 min. ⚡ Tarifa peak de 17:00–21:00h y fines de semana 09:00–13:00h.
          </p>
        </>}

        {/* STEP 2 */}
        {step === 2 && <>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            📅 {dateStr} · ⏱ {selectedTime} · 🏸 {selectedCourt?.display_name || selectedCourt?.name}
          </div>
          {tarifas.filter(t => !t.is_peak).map(tarifa => (
            <button key={tarifa.id} onClick={() => setSelectedTarifa(tarifa)}
              className={`w-full text-left p-4 rounded-2xl border-2 flex items-center gap-3 transition-all
                ${selectedTarifa?.id === tarifa.id ? 'border-cc-blue bg-cc-blue-light' : 'border-gray-200 bg-white'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${selectedTarifa?.id === tarifa.id ? 'border-cc-blue bg-cc-blue' : 'border-gray-300'}`}>
                {selectedTarifa?.id === tarifa.id && <div className="w-2 h-2 rounded-full bg-white"/>}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{tarifa.name_es || tarifa.name}</div>
                <div className="text-xs text-gray-500">{tarifa.discount_pct ? `−${tarifa.discount_pct}% descuento` : 'Sin descuento'}{tarifa.requires_trainer ? ' · Requiere entrenador' : ''}</div>
              </div>
              <div className="font-bold text-cc-blue font-mono">{formatEur(calcPrice(tarifa))}</div>
            </button>
          ))}
          {profile?.wallet_balance >= 0 && (
            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
              ✓ Monedero disponible: <strong>{formatEur(profile.wallet_balance)}</strong>
            </div>
          )}
          <button onClick={() => selectedTarifa && setStep(3)} className={`btn-primary ${!selectedTarifa ? 'opacity-50' : ''}`}>
            Siguiente →
          </button>
        </>}

        {/* STEP 3 */}
        {step === 3 && <>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm text-cc-dark">Información de la reserva</h3>
            {[
              { icon: '📅', label: 'Fecha', val: dateStr },
              { icon: '🏸', label: 'Pista', val: selectedCourt?.display_name || selectedCourt?.name },
              { icon: '🕐', label: 'Horario', val: `${selectedTime} – ${(() => { const [h,m] = selectedTime.split(':').map(Number); const em = m+90; return `${String(h+Math.floor(em/60)).padStart(2,'0')}:${String(em%60).padStart(2,'0')}` })()} (90 min)` },
              { icon: '📍', label: 'Centro', val: selectedCourt?.center?.name },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm">{r.icon}</div>
                <div><div className="text-xs text-gray-500">{r.label}</div><div className="text-sm font-semibold">{r.val}</div></div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-sm text-cc-dark mb-3">Pago</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Precio base (90 min{isPeak(selectedTime) ? ' ⚡' : ''})</span><span>{formatEur(isPeak(selectedTime) ? PRICES.peak : PRICES.normal)}</span></div>
              {selectedTarifa?.discount_pct > 0 && <div className="flex justify-between text-green-600"><span>Descuento −{selectedTarifa.discount_pct}%</span><span>−{formatEur((isPeak(selectedTime) ? PRICES.peak : PRICES.normal) * selectedTarifa.discount_pct / 100)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span>Total</span><span className="text-cc-blue font-mono">{formatEur(calcPrice(selectedTarifa))}</span>
              </div>
            </div>
          </div>

          <button onClick={confirmBooking} disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : `Pagar ${formatEur(calcPrice(selectedTarifa))} →`}
          </button>
        </>}
      </div>
    </div>
  )
}
