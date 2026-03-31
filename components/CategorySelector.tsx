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
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => {
        const isSelected = cat.slug === selected
        return (
          <motion.button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            whileTap={{ scale: 0.94 }}
            className={[
              'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
              isSelected
                ? 'text-white'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            {isSelected && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-500/40"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{cat.icon}</span>
            <span className="relative">{cat.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
