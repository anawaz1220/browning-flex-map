'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4efea' }}>
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#353434' }}>PeakFLX Admin</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Browning Flex Business Park</p>
        </div>

        <div className="rounded-2xl shadow-md p-8" style={{ backgroundColor: '#fff' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6b5f54' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6b5f54' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#964d44', color: '#f4efea' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#b5a99a' }}>
          Admin access only &mdash; not for public use
        </p>
      </div>
    </div>
  )
}
