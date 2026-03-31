'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Category, DailyContent } from '@/types'
import CountdownTimer from './CountdownTimer'
import ContentView from './ContentView'
import SubscribeForm from './SubscribeForm'
import OnboardingView from './OnboardingView'

const STORAGE_CATEGORY = 'mattari-category'
const STORAGE_ONBOARDED = 'mattari-onboarded'

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
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
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

  useEffect(() => {
    const isOnboarded = localStorage.getItem(STORAGE_ONBOARDED) === 'true'
    const savedCategory = localStorage.getItem(STORAGE_CATEGORY)
    setOnboarded(isOnboarded)
    if (isOnboarded && savedCategory && savedCategory !== initialCategory && categories.some((c) => c.slug === savedCategory)) {
      setSelectedCategory(savedCategory)
      fetchContent(savedCategory)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function completeOnboarding(slug: string) {
    localStorage.setItem(STORAGE_ONBOARDED, 'true')
    localStorage.setItem(STORAGE_CATEGORY, slug)
    setSelectedCategory(slug)
    setOnboarded(true)
    fetchContent(slug)
  }

  // Hydrating
  if (onboarded === null) return null

  // First visit → onboarding
  if (!onboarded) {
    return <OnboardingView categories={categories} onComplete={completeOnboarding} />
  }

  const currentCategory = categories.find((c) => c.slug === selectedCategory)

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px] px-5">

        {/* Header */}
        <header className="flex items-center justify-between py-5 border-b border-gray-100">
          <h1 className="text-base font-semibold tracking-tight text-gray-900">
            마타리
          </h1>
          <div className="flex items-center gap-4">
            <CountdownTimer />
            <Link
              href="/settings"
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              설정
            </Link>
          </div>
        </header>

        {/* Category label */}
        {currentCategory && (
          <div className="pt-8 pb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              {currentCategory.icon} {currentCategory.name}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="pb-16">
          <ContentView content={content} loading={loading} />
        </div>

        {/* Subscribe */}
        <div className="border-t border-gray-100 py-8">
          <SubscribeForm />
        </div>

      </div>
    </div>
  )
}
