'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { DailyContent } from '@/types'

interface ContentViewProps {
  content: DailyContent | null
  loading?: boolean
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-8 mb-3 text-base font-semibold text-gray-900 tracking-tight">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-2 border-gray-200 pl-4 italic text-gray-500 text-sm leading-relaxed"
            >
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 text-sm text-gray-600 leading-7 list-disc marker:text-gray-300">
              {renderInline(line.slice(2))}
            </li>
          )
        }
        if (/^\d+\. /.test(line)) {
          const content = line.replace(/^\d+\. /, '')
          return (
            <li key={i} className="ml-4 text-sm text-gray-600 leading-7 list-decimal marker:text-gray-400">
              {renderInline(content)}
            </li>
          )
        }
        if (line === '---') {
          return <hr key={i} className="my-6 border-gray-100" />
        }
        if (line.trim() === '') {
          return <div key={i} className="h-3" />
        }
        return (
          <p key={i} className="text-sm text-gray-600 leading-7">
            {renderInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function ContentView({ content, loading }: ContentViewProps) {
  if (loading) {
    return (
      <div className="pt-6 space-y-4 animate-pulse">
        <div className="h-6 w-3/4 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-50" />
        <div className="h-4 w-5/6 rounded bg-gray-50" />
        <div className="h-4 w-4/5 rounded bg-gray-50" />
        <div className="h-4 w-full rounded bg-gray-50" />
        <div className="h-4 w-2/3 rounded bg-gray-50" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="pt-8 text-sm text-gray-400">
        오늘의 콘텐츠를 준비 중입니다.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pt-4 pb-6">
          <span className="text-xs text-gray-400 font-medium">
            {content.reading_time}분 읽기
          </span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 leading-snug tracking-tight mb-3">
          {content.title}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          {content.subtitle}
        </p>

        <div className="border-t border-gray-100 pt-6">
          <MarkdownContent text={content.content} />
        </div>

        {content.source_url && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <a
              href={content.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              원문 보기 →
            </a>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
