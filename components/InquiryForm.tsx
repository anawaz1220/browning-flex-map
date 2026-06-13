'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Unit } from '@/lib/types'

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

interface InquiryFormProps {
  unit: Unit
  onClose: () => void
}

export default function InquiryForm({ unit, onClose }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `Inquiry – Unit ${unit.unit_number} | Browning Flex Business Park`,
          from_name: data.name,
          name: data.name,
          email: data.email,
          phone: data.phone,
          unit: unit.unit_number,
          building: `Building ${unit.building}`,
          message: data.message || `Interested in Unit ${unit.unit_number}`,
        }),
      })

      const result = await res.json()
      if (result.success) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">✓</div>
        <p className="font-bold" style={{ color: '#353434' }}>Thank you!</p>
        <p className="text-sm mt-1" style={{ color: '#6b5f54' }}>
          We'll be in touch shortly about Unit {unit.unit_number}.
        </p>
        <button
          onClick={onClose}
          className="mt-4 text-sm underline cursor-pointer"
          style={{ color: '#964d44' }}
        >
          Close
        </button>
      </div>
    )
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#c4b8ae', backgroundColor: '#fff', color: '#353434' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#964d44' }}>
        Inquiry – Unit {unit.unit_number}
      </p>

      <div>
        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="Your Name *"
          className={inputClass}
          style={inputStyle}
        />
        {errors.name && <p className="text-xs mt-0.5 text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
          })}
          type="email"
          placeholder="Email Address *"
          className={inputClass}
          style={inputStyle}
        />
        {errors.email && <p className="text-xs mt-0.5 text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <input
          {...register('phone')}
          placeholder="Phone Number (optional)"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <textarea
          {...register('message')}
          placeholder="Message (optional)"
          rows={3}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#964d44', color: '#f4efea' }}
        >
          {submitting ? 'Sending…' : 'Send Inquiry'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
          style={{ backgroundColor: '#ede6de', color: '#353434' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
