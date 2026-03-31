import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '마타리 — 오늘만 읽을 수 있는 지식',
  description: '매일 자정 갱신되는 휘발성 지식 구독 서비스. 경제, IT, 건강, 운동, 명언, 에세이, 시.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
