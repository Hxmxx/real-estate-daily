'use client'

import { useState } from 'react'
import type { Category } from '@/types'

interface OnboardingViewProps {
  categories: Category[]
  onComplete: (slug: string) => void
}

export default function OnboardingView({ categories, onComplete }: OnboardingViewProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
          마타리
        </h1>
        <p className="text-sm text-gray-400 mb-12 leading-relaxed">
          매일 한 편, 오늘만 읽을 수 있는 지식
        </p>

        <p className="text-sm font-medium text-gray-700 mb-4">
          어떤 주제를 읽고 싶나요?
        </p>

        <div className="grid grid-cols-2 gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelected(cat.slug)}
              className={[
                'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left',
                selected === cat.slug
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400',
              ].join(' ')}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className={[
            'w-full py-3 rounded-xl text-sm font-medium transition-colors',
            selected
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          시작하기
        </button>
      </div>
    </div>
  )
}
