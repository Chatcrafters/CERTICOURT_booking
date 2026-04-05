'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cc-blue to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-white text-2xl font-bold mb-1">● CERTICOURT</div>
          <p className="text-blue-200 text-sm">Book certified pickleball courts worldwide</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-cc-dark mb-6">Iniciar sesión</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Correo electrónico</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-lg">{error}</p>}
            <button className="btn-primary" disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar sesión →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-cc-blue font-semibold">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
