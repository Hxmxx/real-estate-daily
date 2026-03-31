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
      <p className="text-xs text-white/35 text-center">
        매일 자정, 새로운 지식이 도착합니다
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-indigo-400"
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
                'flex-1 rounded-xl border bg-white/4 px-4 py-2.5 text-sm text-white/80',
                'placeholder:text-white/25 outline-none transition-colors',
                'border-white/8 focus:border-indigo-500/50 focus:bg-white/6',
              ].join(' ')}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={[
                'rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                'bg-indigo-500/80 text-white hover:bg-indigo-500 active:scale-95',
                status === 'loading' ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {status === 'loading' ? '...' : '구독'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <p className="text-xs text-red-400/80 text-center">{errorMsg}</p>
      )}
    </div>
  )
}
