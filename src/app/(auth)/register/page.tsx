'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', lang: 'es' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email: form.email,
        first_name: form.firstName, last_name: form.lastName,
        preferred_lang: form.lang, role: 'player'
      })
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cc-blue to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-white text-2xl font-bold">● CERTICOURT</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-cc-dark mb-6">Crear cuenta</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                <input className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Sergio" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Apellido</label>
                <input className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Ruiz" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Correo electrónico</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contraseña</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mín. 8 caracteres" required minLength={8} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Idioma preferido</label>
              <select className="input" value={form.lang} onChange={e => setForm({...form, lang: e.target.value})}>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-lg">{error}</p>}
            <button className="btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-cc-blue font-semibold">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
