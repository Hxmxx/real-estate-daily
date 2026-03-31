'use client'

import { useEffect, useState } from 'react'

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

  return (
    <span className="font-mono text-xs text-gray-400 tabular-nums tracking-tight">
      {hours}:{minutes}:{secs}
    </span>
  )
}
