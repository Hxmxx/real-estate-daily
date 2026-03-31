'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? '잠시 후 다시 시도해주세요.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        매일 자정, 새로운 지식이 도착합니다
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-700 font-medium"
          >
            구독 완료 ✓
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              className={[
                'flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900',
                'placeholder:text-gray-400 outline-none transition-colors bg-white',
                'focus:border-gray-400',
              ].join(' ')}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={[
                'rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]',
                status === 'loading' ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {status === 'loading' ? '...' : '구독'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  )
}
