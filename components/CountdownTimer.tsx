'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getSecondsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  }
}

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    setSeconds(getSecondsUntilMidnight())
    const id = setInterval(() => {
      setSeconds(getSecondsUntilMidnight())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (seconds === null) return null

  const { hours, minutes, seconds: secs } = formatTime(seconds)
  const totalSecondsInDay = 86400
  const progress = 1 - seconds / totalSecondsInDay

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="96" height="96" className="-rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-xs text-white/40 leading-none">남은</span>
          <span className="font-mono text-xs text-white/60 leading-none">{hours}h</span>
        </div>
      </div>

      <div className="flex items-center gap-1 font-mono text-sm text-white/50">
        <span className="tabular-nums">{hours}</span>
        <span className="text-white/20">:</span>
        <span className="tabular-nums">{minutes}</span>
        <span className="text-white/20">:</span>
        <motion.span
          key={secs}
          className="tabular-nums text-indigo-400"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {secs}
        </motion.span>
      </div>

      <p className="text-xs text-white/30 tracking-wide">자정에 소멸</p>
    </div>
  )
}
