'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'forgot'

const EyeIcon = ({ show }: { show: boolean }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {show ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
)

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      redirectTo: 'https://browning-flex-map.vercel.app/auth/callback?next=/admin/reset-password',
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#353434' }}>PeakFLX Admin</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Browning Flex Business Park</p>
        </div>

        <div className="rounded-2xl shadow-md p-8" style={{ backgroundColor: '#fff' }}>
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className={inputClass} style={inputStyle} placeholder="admin@example.com" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Password</label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setMsg('') }}
                    className="text-xs cursor-pointer underline" style={{ color: '#964d44' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-10`}
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: '#9ca3af' }}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60 mt-2"
                style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
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
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className={inputClass} style={inputStyle} placeholder="admin@example.com" />
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              {msg && <p className="text-xs text-center font-semibold text-green-600">{msg}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <button type="button" onClick={() => { setMode('login'); setError(''); setMsg('') }}
                className="w-full text-center text-xs cursor-pointer underline mt-1"
                style={{ color: '#9ca3af' }}>
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
