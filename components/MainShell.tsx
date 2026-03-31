'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Category, DailyContent } from '@/types'
import CountdownTimer from './CountdownTimer'
import CategorySelector from './CategorySelector'
import ContentView from './ContentView'
import SubscribeForm from './SubscribeForm'
import GlassCard from './GlassCard'
import ParticleBackground from './ParticleBackground'

const STORAGE_KEY = 'mattari-category'

interface MainShellProps {
  categories: Category[]
  initialContent: DailyContent | null
  initialCategory: string
}

export default function MainShell({
  categories,
  initialContent,
  initialCategory,
}: MainShellProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [content, setContent] = useState<DailyContent | null>(initialContent)
  const [loading, setLoading] = useState(false)

  const fetchContent = useCallback(async (slug: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/content?category=${slug}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data.content ?? null)
      }
    } catch {
      // keep existing content on error
    } finally {
      setLoading(false)
    }
  }, [])

  function handleCategoryChange(slug: string) {
    if (slug === selectedCategory) return
    setSelectedCategory(slug)
    localStorage.setItem(STORAGE_KEY, slug)
    fetchContent(slug)
  }

  // Restore saved category on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== initialCategory && categories.some((c) => c.slug === saved)) {
      setSelectedCategory(saved)
      fetchContent(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ParticleBackground />

      <div className="relative z-10 min-h-screen px-4 py-16">
        <div className="mx-auto max-w-[680px] space-y-8">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">
                마타리
              </h1>
              <p className="text-xs text-white/30 mt-0.5">
                매일 자정 갱신되는 지식
              </p>
            </div>
            <GlassCard className="px-4 py-3">
              <CountdownTimer />
            </GlassCard>
          </motion.header>

          {/* Category Selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <CategorySelector
              categories={categories}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContentView content={content} loading={loading} />
          </motion.div>

          {/* Subscribe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="px-6 py-5">
              <SubscribeForm />
            </GlassCard>
          </motion.div>

        </div>
      </div>
    </>
  )
}
