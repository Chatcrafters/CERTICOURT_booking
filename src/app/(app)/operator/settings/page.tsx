'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, Lang } from '@/lib/i18n/translations'
import { IconMoney, IconCalendar, IconClock, IconMegaphone, IconCheck, IconCreditCard, IconWarning } from '@/components/icons'

interface BonusTier {
  min_amount: number
  bonus: number
}

export default function OperatorSettingsPage() {
  const [lang, setLang] = useState<Lang>('es')
  const [saved, setSaved] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [payoutSchedule, setPayoutSchedule] = useState('weekly')
  const [maxAdvance, setMaxAdvance] = useState('30')
  const [minAdvance, setMinAdvance] = useState('2')
  const [freeCancelHours, setFreeCancelHours] = useState('2')
  const [maxPerWeek, setMaxPerWeek] = useState('10')
  const [maxDuration, setMaxDuration] = useState('90')
  const [allowRecurring, setAllowRecurring] = useState(true)
  const [walletBonusEnabled, setWalletBonusEnabled] = useState(false)
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([
    { min_amount: 50, bonus: 10 },
    { min_amount: 100, bonus: 30 },
  ])
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')

  const s = t(lang).settings
  const c = t(lang).common

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateTier(index: number, field: keyof BonusTier, value: number) {
    setBonusTiers(prev => prev.map((tier, i) => i === index ? { ...tier, [field]: value } : tier))
  }

  function addTier() {
    if (bonusTiers.length >= 4) return
    const lastAmount = bonusTiers.length > 0 ? bonusTiers[bonusTiers.length - 1].min_amount : 0
    setBonusTiers(prev => [...prev, { min_amount: lastAmount + 50, bonus: 10 }])
  }

  function removeTier(index: number) {
    setBonusTiers(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">{s.title}</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setLang('es')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'es' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>
              ES
            </button>
            <button onClick={() => setLang('de')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'de' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>
              DE
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* PAYMENTS */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <IconMoney size={16} className="text-cc-blue" />
            <h2 className="text-sm font-bold text-cc-dark">{s.payments.title}</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.payments.connectStripe}</span>
              {stripeConnected ? (
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                  <IconCheck size={12} /> {s.payments.connected}
                </span>
              ) : (
                <button onClick={() => setStripeConnected(true)}
                  className="text-xs font-semibold text-white bg-cc-blue px-3 py-1.5 rounded-lg">
                  {s.payments.connectStripe}
                </button>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">{s.payments.payoutSchedule}</label>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map(opt => (
                  <button key={opt} onClick={() => setPayoutSchedule(opt)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-colors
                      ${payoutSchedule === opt ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 bg-white text-gray-600'}`}>
                    {s.payments[opt]}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">{s.payments.serviceFee}</p>
          </div>
        </div>

        {/* BOOKING RULES */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <IconCalendar size={16} className="text-cc-blue" />
            <h2 className="text-sm font-bold text-cc-dark">{s.bookingRules.title}</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.bookingRules.maxAdvance}</span>
              <select value={maxAdvance} onChange={e => setMaxAdvance(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="7">7 d</option>
                <option value="14">14 d</option>
                <option value="30">30 d</option>
                <option value="60">60 d</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.bookingRules.minAdvance}</span>
              <select value={minAdvance} onChange={e => setMinAdvance(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="0">{s.bookingRules.immediate}</option>
                <option value="1">1h</option>
                <option value="2">2h</option>
                <option value="4">4h</option>
                <option value="24">24h</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{s.bookingRules.freeCancellation}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: '0', label: s.bookingRules.noCancel },
                  { value: '1', label: '1h' },
                  { value: '2', label: '2h' },
                  { value: '6', label: '6h' },
                  { value: '24', label: '24h' },
                  { value: '48', label: '48h' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setFreeCancelHours(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors
                      ${freeCancelHours === opt.value
                        ? opt.value === '0' ? 'border-red-400 bg-red-50 text-red-600' : 'border-cc-blue bg-cc-blue-light text-cc-blue'
                        : 'border-gray-200 bg-white text-gray-600'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {freeCancelHours === '0' && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  <IconWarning size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{s.bookingRules.noCancelInfo}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.bookingRules.maxPerWeek}</span>
              <select value={maxPerWeek} onChange={e => setMaxPerWeek(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="0">&infin;</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.bookingRules.maxDuration}</span>
              <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
                <option value="180">180 min</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.bookingRules.allowRecurring}</span>
              <button onClick={() => setAllowRecurring(!allowRecurring)}
                className={`w-12 h-7 rounded-full transition-colors relative ${allowRecurring ? 'bg-cc-blue' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${allowRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* WALLET & BONOS */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <IconCreditCard size={16} className="text-cc-blue" />
            <h2 className="text-sm font-bold text-cc-dark">{s.wallet.title}</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{s.wallet.bonusEnabled}</span>
              <button onClick={() => setWalletBonusEnabled(!walletBonusEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${walletBonusEnabled ? 'bg-cc-blue' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${walletBonusEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {walletBonusEnabled && (
              <div className="space-y-3">
                {bonusTiers.map((tier, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">{s.wallet.minAmount}</label>
                        <div className="relative">
                          <input type="number" value={tier.min_amount}
                            onChange={e => updateTier(i, 'min_amount', Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white pr-8" />
                          <span className="absolute right-3 top-1.5 text-sm text-gray-400">EUR</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">{s.wallet.bonus}</label>
                        <div className="relative">
                          <input type="number" value={tier.bonus}
                            onChange={e => updateTier(i, 'bonus', Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white pr-8" />
                          <span className="absolute right-3 top-1.5 text-sm text-gray-400">EUR</span>
                        </div>
                      </div>
                      <button onClick={() => removeTier(i)}
                        className="self-end mb-0.5 w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors text-lg">
                        &times;
                      </button>
                    </div>
                    <div className="text-xs text-cc-blue bg-cc-blue-light rounded-lg px-2 py-1.5 text-center font-medium">
                      {s.wallet.preview
                        .replace('{amount}', String(tier.min_amount))
                        .replace('{total}', String(tier.min_amount + tier.bonus))}
                    </div>
                  </div>
                ))}
                {bonusTiers.length < 4 && (
                  <button onClick={addTier}
                    className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-cc-blue hover:text-cc-blue transition-colors">
                    + {s.wallet.addTier}
                  </button>
                )}
                <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">{s.wallet.info}</p>
              </div>
            )}
          </div>
        </div>

        {/* BLACKOUTS */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <IconClock size={16} className="text-cc-blue" />
            <h2 className="text-sm font-bold text-cc-dark">{s.blackouts.title}</h2>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-cc-blue hover:text-cc-blue transition-colors">
              + {s.blackouts.addBlackout}
            </button>
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>{s.blackouts.allDay}</span>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">{s.blackouts.reason}</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white" placeholder={s.blackouts.reason} />
              </div>
            </div>
          </div>
        </div>

        {/* COMMUNICATION */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <IconMegaphone size={16} className="text-cc-blue" />
            <h2 className="text-sm font-bold text-cc-dark">{s.communication.title}</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">{s.communication.welcomeMessage}</label>
              <textarea value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none h-20"
                placeholder={s.communication.welcomeMessage} />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs text-gray-500 block mb-1">{s.communication.sendToAll}</label>
              <input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white mb-2"
                placeholder={s.communication.messageTitle} />
              <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none h-20" />
              <button className="mt-2 w-full bg-cc-blue text-white text-sm font-semibold py-2 rounded-xl active:scale-95 transition-transform">
                {c.send}
              </button>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button onClick={handleSave}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            saved ? 'bg-green-500 text-white' : 'bg-cc-blue text-white'
          }`}>
          {saved ? (
            <span className="flex items-center justify-center gap-1"><IconCheck size={16} /> {c.saved}</span>
          ) : c.save}
        </button>
      </div>
    </div>
  )
}
