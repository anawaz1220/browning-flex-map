'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 pr-10"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1.5"

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {show ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4efea' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#353434' }}>Set New Password</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Choose a strong password for your account</p>
        </div>

        <div className="rounded-2xl shadow-md p-8" style={{ backgroundColor: '#fff' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: '#9ca3af' }}>
                  <EyeIcon show={showPw} />
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Repeat new password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: '#9ca3af' }}>
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
              {loading ? 'Saving…' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
