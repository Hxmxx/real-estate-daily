'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Category } from '@/types'
import CategorySelector from './CategorySelector'
import { createClient } from '@/lib/supabase/client'

const STORAGE_CATEGORY = 'mattari-category'
const STORAGE_ONBOARDED = 'mattari-onboarded'

interface SettingsShellProps {
  categories: Category[]
}

export default function SettingsShell({ categories }: SettingsShellProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_CATEGORY)
    if (saved && categories.some((c) => c.slug === saved)) {
      setSelected(saved)
    } else if (categories.length > 0) {
      setSelected(categories[0].slug)
    }
  }, [categories])

  function handleSave() {
    if (selected) {
      localStorage.setItem(STORAGE_CATEGORY, selected)
      router.push('/')
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem(STORAGE_CATEGORY)
    localStorage.removeItem(STORAGE_ONBOARDED)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px] px-5">

        <header className="flex items-center gap-3 py-5 border-b border-gray-100">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
            aria-label="뒤로"
          >
            ←
          </Link>
          <h1 className="text-base font-semibold tracking-tight text-gray-900">
            설정
          </h1>
        </header>

        <div className="pt-8 space-y-8 pb-12">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-4">
              읽을 주제
            </p>

            {selected && (
              <CategorySelector
                categories={categories}
                selected={selected}
                onChange={setSelected}
              />
            )}

            <button
              onClick={handleSave}
              disabled={!selected}
              className="mt-4 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-colors"
            >
              저장
            </button>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
