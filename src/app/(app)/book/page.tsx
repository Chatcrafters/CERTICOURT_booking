'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { generateTimeSlots, formatEur, formatDateShort, formatDate } from '@/lib/helpers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconCalendar, IconCourt, IconPin, IconCheck, IconRepeat, IconWallet } from '@/components/icons'
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
  const [recurring, setRecurring] = useState(false)
  const [recurringWeeks, setRecurringWeeks] = useState(4)
  const [walletBalance, setWalletBalance] = useState(0)
  const [payWithWallet, setPayWithWallet] = useState(false)

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
      fetch('/api/wallet').then(r => r.json()).then(d => setWalletBalance(d.balance || 0)).catch(() => {})
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
    const disc = (tarifa.discount_pct ?? 0) / 100
    return base * (1 - disc)
  }

  async function confirmBooking() {
    if (!selectedCourt || !selectedTime || !selectedTarifa) return
    setLoading(true)
    const [h, m] = selectedTime.split(':').map(Number)
    const endM = m + 90
    const endH = h + Math.floor(endM / 60)
    const endTime = `${String(endH).padStart(2,'0')}:${String(endM % 60).padStart(2,'0')}:00`

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center_id: selectedCourt.center_id,
        court_id: selectedCourt.id,
        pricing_rule_id: selectedTarifa.id,
        date: dateStr,
        start_time: selectedTime + ':00',
        end_time: endTime,
        duration_min: 90,
        is_recurring: recurring,
        recurring_weeks: recurring ? recurringWeeks : undefined,
        payment_method: payWithWallet ? 'wallet' : 'on_site',
      })
    })

    const data = await res.json()
    if (res.ok && data.id) {
      router.push(`/book/confirmation/${data.id}`)
    } else {
      alert('Error: ' + (data.error || 'Unknown error'))
      setLoading(false)
    }
  }

  const Step = ({ n, label }: { n: number, label: string }) => (
    <div className={`flex flex-col items-center ${step >= n ? 'text-cc-blue' : 'text-gray-300'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${step > n ? 'bg-cc-blue text-white' : step === n ? 'bg-cc-blue text-white ring-4 ring-cc-blue/20' : 'bg-gray-200 text-gray-400'}`}>
        {step > n ? <IconCheck size={14} /> : n}
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
            Solo puedes seleccionar tramos de 90 min. Tarifa peak de 17:00-21:00h y fines de semana 09:00-13:00h.
          </p>
        </>}

        {/* STEP 2 */}
        {step === 2 && <>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-center gap-2">
            <IconCalendar size={14} /> {formatDateShort(dateStr)} &middot; {selectedTime} &middot; <IconCourt size={14} /> {selectedCourt?.display_name || selectedCourt?.name}
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
          {walletBalance > 0 && (
            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
              <IconWallet size={14} /> Wallet: <strong>{formatEur(walletBalance)}</strong>
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
              { Icon: IconCalendar, label: 'Fecha', val: formatDate(dateStr) },
              { Icon: IconCourt, label: 'Pista', val: selectedCourt?.display_name || selectedCourt?.name },
              { Icon: IconCalendar, label: 'Horario', val: `${selectedTime} - ${(() => { const [h,m] = selectedTime.split(':').map(Number); const em = m+90; return `${String(h+Math.floor(em/60)).padStart(2,'0')}:${String(em%60).padStart(2,'0')}` })()} (90 min)` },
              { Icon: IconPin, label: 'Centro', val: selectedCourt?.center?.name },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-cc-blue"><r.Icon size={16} /></div>
                <div><div className="text-xs text-gray-500">{r.label}</div><div className="text-sm font-semibold">{r.val}</div></div>
              </div>
            ))}
          </div>

          {/* Recurring toggle */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconRepeat size={16} className="text-cc-blue" />
                <span className="text-sm font-semibold text-cc-dark">Repetir cada semana?</span>
              </div>
              <button onClick={() => setRecurring(!recurring)}
                className={`w-12 h-7 rounded-full transition-colors relative ${recurring ? 'bg-cc-blue' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${recurring ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {recurring && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Durante cuantas semanas?</p>
                <div className="flex gap-2">
                  {[2, 3, 4, 6, 8].map(w => (
                    <button key={w} onClick={() => setRecurringWeeks(w)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors
                        ${recurringWeeks === w ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 bg-white text-gray-600'}`}>
                      {w}
                    </button>
                  ))}
                </div>
                <div className="mt-3 bg-cc-blue-light rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{recurringWeeks} sesiones &times; {formatEur(calcPrice(selectedTarifa))}</p>
                  <p className="text-lg font-bold text-cc-blue font-mono">{formatEur(calcPrice(selectedTarifa) * recurringWeeks)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-sm text-cc-dark mb-3">Pago</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Precio base (90 min{isPeak(selectedTime) ? ' peak' : ''})</span><span>{formatEur(isPeak(selectedTime) ? PRICES.peak : PRICES.normal)}</span></div>
              {selectedTarifa?.discount_pct > 0 && <div className="flex justify-between text-green-600"><span>Descuento −{selectedTarifa.discount_pct}%</span><span>−{formatEur((isPeak(selectedTime) ? PRICES.peak : PRICES.normal) * selectedTarifa.discount_pct / 100)}</span></div>}
              {recurring && <div className="flex justify-between text-gray-500"><span>{recurringWeeks} semanas</span><span>&times; {recurringWeeks}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span>Total</span><span className="text-cc-blue font-mono">{formatEur(calcPrice(selectedTarifa) * (recurring ? recurringWeeks : 1))}</span>
              </div>
            </div>
          </div>

          {/* Wallet Payment */}
          {(() => {
            const total = calcPrice(selectedTarifa) * (recurring ? recurringWeeks : 1)
            const canPayWallet = walletBalance >= total
            return (
              <div className={`rounded-xl p-4 border-2 ${payWithWallet ? 'border-cc-blue bg-cc-blue-light' : canPayWallet ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                {canPayWallet ? (
                  <button onClick={() => setPayWithWallet(!payWithWallet)} className="w-full text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payWithWallet ? 'bg-cc-blue text-white' : 'bg-gray-100 text-cc-blue'}`}>
                        <IconWallet size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-cc-dark">Pagar con Wallet</div>
                        <div className="text-xs text-gray-500">
                          Saldo: {formatEur(walletBalance)} — {walletBalance - total >= 0 ? `quedan ${formatEur(walletBalance - total)}` : ''}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payWithWallet ? 'border-cc-blue bg-cc-blue' : 'border-gray-300'}`}>
                        {payWithWallet && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                      <IconWallet size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-400">Saldo insuficiente: {formatEur(walletBalance)}</div>
                      <Link href="/account/wallet" className="text-xs text-cc-blue font-semibold">Recargar wallet</Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <button onClick={confirmBooking} disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : payWithWallet
              ? `Pagar con Wallet ${formatEur(calcPrice(selectedTarifa) * (recurring ? recurringWeeks : 1))}`
              : `Pagar ${formatEur(calcPrice(selectedTarifa) * (recurring ? recurringWeeks : 1))}`}
          </button>
        </>}
      </div>
    </div>
  )
}
