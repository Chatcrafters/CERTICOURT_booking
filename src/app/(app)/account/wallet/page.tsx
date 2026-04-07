'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatEur, formatDateShort } from '@/lib/helpers'
import { IconWallet, IconGift, IconRefund, IconCourt, IconClock, IconCheck } from '@/components/icons'
import { t, Lang } from '@/lib/i18n/translations'

const TOPUP_AMOUNTS = [10, 20, 50, 100]
const BONUS_TIERS = [
  { min_amount: 50, bonus: 10 },
  { min_amount: 100, bonus: 30 },
]

interface Transaction {
  id: string
  type: string
  amount: number
  bonus: number
  description: string
  balance_after: number
  created_at: string
}

function TxIcon({ type }: { type: string }) {
  switch (type) {
    case 'topup': return <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><IconWallet size={16} /></div>
    case 'booking': return <div className="w-9 h-9 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><IconCourt size={16} /></div>
    case 'bonus': return <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><IconGift size={16} /></div>
    case 'refund': return <div className="w-9 h-9 rounded-full bg-blue-100 text-cc-blue flex items-center justify-center"><IconRefund size={16} /></div>
    default: return <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"><IconWallet size={16} /></div>
  }
}

function getBonus(amount: number) {
  let bonus = 0
  for (const tier of BONUS_TIERS) {
    if (amount >= tier.min_amount) bonus = tier.bonus
  }
  return bonus
}

export default function WalletPage() {
  const [lang, setLang] = useState<Lang>('es')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [autoReload, setAutoReload] = useState(false)
  const [autoReloadAmount, setAutoReloadAmount] = useState(20)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [topupLoading, setTopupLoading] = useState(false)
  const [toast, setToast] = useState('')

  const w = t(lang).wallet

  useEffect(() => {
    fetch('/api/wallet').then(r => r.json()).then(data => {
      setBalance(data.balance || 0)
      setAutoReload(data.auto_reload || false)
      setAutoReloadAmount(data.auto_reload_amount || 20)
      setTransactions(data.transactions || [])
      setLoading(false)
    })
  }, [])

  async function handleTopup() {
    if (!selectedAmount) return
    setTopupLoading(true)
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: selectedAmount }),
    })
    const data = await res.json()
    if (res.ok) {
      setBalance(data.balance)
      setToast(w.topupSuccess)
      setSelectedAmount(null)
      // Refresh transactions
      const txRes = await fetch('/api/wallet')
      const txData = await txRes.json()
      setTransactions(txData.transactions || [])
      setTimeout(() => setToast(''), 3000)
    }
    setTopupLoading(false)
  }

  function formatTxDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${formatDateShort(dateStr)} · ${d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/account" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark flex-1">{w.title}</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'es' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>ES</button>
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'de' ? 'bg-white text-cc-blue shadow-sm' : 'text-gray-500'}`}>DE</button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-cc-blue to-blue-900 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <IconWallet size={18} />
            <span className="text-xs uppercase tracking-wide opacity-75">{w.balance}</span>
          </div>
          <p className="text-3xl font-bold font-mono">{formatEur(balance)}</p>
          {transactions.length > 0 && (
            <p className="text-xs text-blue-200 mt-2">{w.lastTopup}: {formatDateShort(transactions.find(tx => tx.type === 'topup')?.created_at || new Date().toISOString())}</p>
          )}
        </div>

        {/* Topup Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-cc-dark">{w.topup}</h2>
          <div className="grid grid-cols-4 gap-2">
            {TOPUP_AMOUNTS.map(amt => {
              const bonus = getBonus(amt)
              const active = selectedAmount === amt
              return (
                <button key={amt} onClick={() => setSelectedAmount(amt)}
                  className={`py-3 rounded-xl border-2 text-center transition-colors ${active ? 'border-cc-blue bg-cc-blue-light' : 'border-gray-200 bg-white'}`}>
                  <div className={`text-sm font-bold font-mono ${active ? 'text-cc-blue' : 'text-cc-dark'}`}>{amt} EUR</div>
                  {bonus > 0 && <div className="text-xs font-semibold text-green-600 mt-0.5">+{bonus} EUR</div>}
                </button>
              )
            })}
          </div>
          {selectedAmount && (
            <>
              {getBonus(selectedAmount) > 0 && (
                <div className="bg-green-50 rounded-xl p-3 text-center text-sm">
                  <span className="text-gray-600">{w.youPay} <strong>{selectedAmount} EUR</strong></span>
                  <span className="text-gray-400 mx-2">&rarr;</span>
                  <span className="text-green-700 font-bold">{w.youReceive} {selectedAmount + getBonus(selectedAmount)} EUR</span>
                </div>
              )}
              <button onClick={handleTopup} disabled={topupLoading}
                className="w-full bg-cc-blue text-white text-sm font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50">
                {topupLoading ? '...' : w.demoTopup}
              </button>
            </>
          )}
        </div>

        {/* Auto-reload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-cc-dark">{w.autoReload}</span>
            <button onClick={() => setAutoReload(!autoReload)}
              className={`w-12 h-7 rounded-full transition-colors relative ${autoReload ? 'bg-cc-blue' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${autoReload ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-xs text-gray-400">{w.autoReloadInfo}</p>
          {autoReload && (
            <div className="flex gap-2">
              {[10, 20, 50].map(amt => (
                <button key={amt} onClick={() => setAutoReloadAmount(amt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-colors
                    ${autoReloadAmount === amt ? 'border-cc-blue bg-cc-blue-light text-cc-blue' : 'border-gray-200 bg-white text-gray-600'}`}>
                  {amt} EUR
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-bold text-cc-dark">{w.transactions}</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-gray-300 flex justify-center mb-2"><IconClock size={32} /></div>
              <p className="text-sm text-gray-400">{w.noTransactions}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => (
                <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                  <TxIcon type={tx.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cc-dark truncate">{tx.description}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatTxDate(tx.created_at)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold font-mono ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatEur(tx.amount)}
                    </div>
                    <div className="text-xs text-gray-400">{formatEur(tx.balance_after)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && (
          <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto bg-green-600 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 z-50">
            <IconCheck size={16} /> {toast}
          </div>
        )}
      </div>
    </div>
  )
}
