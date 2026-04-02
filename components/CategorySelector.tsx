'use client'

import { motion } from 'framer-motion'
import type { Category } from '@/types'

interface CategorySelectorProps {
  categories: Category[]
  selected: string
  onChange: (slug: string) => void
}

export default function CategorySelector({
  categories,
  selected,
  onChange,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {categories.map((cat) => {
        const isSelected = cat.slug === selected
        return (
          <motion.button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            whileTap={{ scale: 0.97 }}
            className={[
              'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left',
              isSelected
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-700 hover:border-gray-400',
            ].join(' ')}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
