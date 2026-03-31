import type { NextRequest } from 'next/server'
import { scrapeAllCategories, scrapeSingleCategory } from '@/lib/scraper'

/**
 * 인증 확인.
 * SCRAPE_SECRET 환경변수가 설정된 경우에만 검사합니다.
 * Vercel Cron은 자동으로 CRON_SECRET 헤더를 추가하므로 둘 다 허용합니다.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SCRAPE_SECRET
  if (!secret) return true // 개발 환경: 시크릿 없으면 열린 접근

  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-vercel-cron-secret') // Vercel Cron 자동 헤더 (vercel cron에서 제공)

  return authHeader === `Bearer ${secret}` || cronSecret === secret
}

/**
 * GET — Vercel Cron에서 매일 자정 호출
 * POST — 수동 트리거 (특정 카테고리 지정 가능)
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await scrapeAllCategories()
  const failed = results.filter((r) => r.status === 'error')

  return Response.json({
    success: true,
    date: new Date().toISOString().split('T')[0],
    results,
    ...(failed.length > 0 && { warnings: `${failed.length} categories failed` }),
  })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { category?: string } = {}
  try {
    body = await request.json()
  } catch {
    // body 없어도 OK → 전체 스크랩
  }

  if (body.category) {
    const result = await scrapeSingleCategory(body.category)
    return Response.json({ success: result.status === 'success', result })
  }

  const results = await scrapeAllCategories()
  const failed = results.filter((r) => r.status === 'error')

  return Response.json({
    success: true,
    date: new Date().toISOString().split('T')[0],
    results,
    ...(failed.length > 0 && { warnings: `${failed.length} categories failed` }),
  })
}
