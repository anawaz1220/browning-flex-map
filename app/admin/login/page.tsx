'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'forgot'

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMsg('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://browning-flex-map.vercel.app/admin/dashboard',
    })

    if (error) {
      setError(error.message)
    } else {
      setMsg('Reset link sent! Check your email inbox.')
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1.5"

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4efea' }}>
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#353434' }}>PeakFLX Admin</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Browning Flex Business Park</p>
        </div>

        <div className="rounded-2xl shadow-md p-8" style={{ backgroundColor: '#fff' }}>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className={inputClass} style={inputStyle} placeholder="admin@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setMsg('') }}
                    className="text-xs cursor-pointer underline"
                    style={{ color: '#964d44' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required className={inputClass} style={inputStyle} placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60 mt-2"
                style={{ backgroundColor: '#964d44', color: '#f4efea' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm font-bold" style={{ color: '#353434' }}>Reset Password</p>
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className={inputClass} style={inputStyle} placeholder="admin@example.com"
                />
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              {msg && <p className="text-xs text-center font-semibold text-green-600">{msg}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: '#964d44', color: '#f4efea' }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMsg('') }}
                className="w-full text-center text-xs cursor-pointer underline mt-1"
                style={{ color: '#9ca3af' }}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#b5a99a' }}>
          Admin access only &mdash; not for public use
        </p>
      </div>
    </div>
  )
}
