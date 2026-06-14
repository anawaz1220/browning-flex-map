'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Unit } from '@/lib/types'

const WEB3FORMS_KEY = '1a8433fb-3d05-4ae6-8e12-572bfc4c7fbf'

interface FormData {
  name: string
  email: string
  phone: string
  interest: string
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { interest: 'both' }
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')

    const interestLabel = data.interest === 'sale' ? 'For Sale' : data.interest === 'lease' ? 'For Lease' : 'Sale & Lease'

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Inquiry – Unit ${unit.unit_number} | Browning Flex Business Park`,
          from_name: data.name,
          name: data.name,
          email: data.email,
          phone: data.phone || 'Not provided',
          unit: unit.unit_number,
          building: `Building ${unit.building}`,
          interest: interestLabel,
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
        <div className="text-4xl mb-2">✓</div>
        <p className="font-bold" style={{ color: '#353434' }}>Inquiry Sent!</p>
        <p className="text-sm mt-1" style={{ color: '#6b5f54' }}>
          We&apos;ll be in touch shortly about Unit {unit.unit_number}.
        </p>
        <button onClick={onClose} className="mt-4 text-sm underline cursor-pointer" style={{ color: '#964d44' }}>
          Close
        </button>
      </div>
    )
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
  const inputStyle = { borderColor: '#c4b8ae', backgroundColor: '#fff', color: '#353434' }
  const errorInputStyle = { borderColor: '#ef4444', backgroundColor: '#fff', color: '#353434' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#964d44' }}>
        Inquiry – Unit {unit.unit_number}
      </p>

      {/* Name */}
      <div>
        <input
          {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
          placeholder="Full Name *"
          className={inputClass}
          style={errors.name ? errorInputStyle : inputStyle}
        />
        {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <input
          {...register('email', {
            required: 'Email address is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
          })}
          type="email"
          placeholder="Email Address *"
          className={inputClass}
          style={errors.email ? errorInputStyle : inputStyle}
        />
        {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <input
          {...register('phone', {
            pattern: { value: /^[\d\s\-\(\)\+]{7,15}$/, message: 'Enter a valid phone number' }
          })}
          placeholder="Phone Number (optional)"
          className={inputClass}
          style={errors.phone ? errorInputStyle : inputStyle}
        />
        {errors.phone && <p className="text-xs mt-1 text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Interest */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6b5f54' }}>
          I&apos;m interested in
        </label>
        <select
          {...register('interest')}
          className={inputClass}
          style={inputStyle}
        >
          <option value="both">Both Sale &amp; Lease</option>
          <option value="sale">For Sale</option>
          <option value="lease">For Lease</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <textarea
          {...register('message', { maxLength: { value: 500, message: 'Max 500 characters' } })}
          placeholder="Additional message (optional)"
          rows={2}
          className={`${inputClass} resize-none`}
          style={errors.message ? errorInputStyle : inputStyle}
        />
        {errors.message && <p className="text-xs mt-1 text-red-500">{errors.message.message}</p>}
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide cursor-pointer disabled:opacity-60 transition-opacity hover:opacity-90"
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
