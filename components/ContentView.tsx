'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { DailyContent } from '@/types'
import GlassCard from './GlassCard'

interface ContentViewProps {
  content: DailyContent | null
  loading?: boolean
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="prose-mattari">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-8 mb-3 text-base font-semibold text-white/90 tracking-tight">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-6 mb-2 text-sm font-semibold text-white/70 uppercase tracking-widest">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-2 border-indigo-500/60 pl-4 italic text-white/60 text-sm leading-relaxed"
            >
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 text-sm text-white/60 leading-relaxed list-disc marker:text-indigo-500/60">
              {renderInline(line.slice(2))}
            </li>
          )
        }
        if (/^\d+\. /.test(line)) {
          const content = line.replace(/^\d+\. /, '')
          return (
            <li key={i} className="ml-4 text-sm text-white/60 leading-relaxed list-decimal marker:text-indigo-500/60">
              {renderInline(content)}
            </li>
          )
        }
        if (line === '---') {
          return <hr key={i} className="my-6 border-white/8" />
        }
        if (line.trim() === '') {
          return <div key={i} className="h-3" />
        }
        return (
          <p key={i} className="text-sm text-white/60 leading-7">
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
        <strong key={i} className="font-semibold text-white/85">
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
      <GlassCard className="p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-2/3 rounded bg-white/6" />
          <div className="h-3 w-full rounded bg-white/4" />
          <div className="h-3 w-5/6 rounded bg-white/4" />
          <div className="h-3 w-4/5 rounded bg-white/4" />
        </div>
      </GlassCard>
    )
  }

  if (!content) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-white/30">오늘의 콘텐츠를 준비 중입니다.</p>
      </GlassCard>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard className="p-8">
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400/80 font-medium tracking-wide uppercase">
                {content.reading_time}분 읽기
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white leading-snug tracking-tight">
              {content.title}
            </h1>
            <p className="text-sm text-white/45 leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          <div className="border-t border-white/6 pt-6">
            <MarkdownContent text={content.content} />
          </div>

          {content.source_url && (
            <div className="mt-8 pt-6 border-t border-white/6">
              <a
                href={content.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                원문 보기 →
              </a>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  )
}
