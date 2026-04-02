import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import type { Category, DailyContent } from '@/types'
import { CATEGORIES } from './seed-data'
import { isSupabaseConfigured } from './supabase'

// 스크랩용 서비스 롤 클라이언트 (RLS 우회, 서버 전용)
const supabase =
  isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      )
    : null

// ---------------------------------------------------------------------------
// RSS 소스 정의
// ---------------------------------------------------------------------------

/**
 * 카테고리별 RSS 피드 URL 목록.
 * null이면 RSS 없이 Gemini가 직접 생성.
 */
const RSS_SOURCES: Record<string, string[] | null> = {
  economy: [
    'https://www.mk.co.kr/rss/30100041/',          // 매일경제 경제
    'https://rss.hankyung.com/economy.xml',          // 한국경제
  ],
  it: [
    'https://rss.etnews.com/Section902.xml',          // 전자신문 IT
    'https://feeds.feedburner.com/zdnet/feed',        // ZDNet
  ],
  health: [
    'https://health.chosun.com/rss/index.xml',        // 헬스조선
    'https://kormedi.com/feed/',                      // 코메디닷컴
  ],
  exercise: [
    'https://sports.chosun.com/rss/',                 // 스포츠조선
  ],
  quote: null,   // Gemini 직접 생성
  essay: null,   // Gemini 직접 생성
  poem: null,    // Gemini 직접 생성
}

// ---------------------------------------------------------------------------
// RSS 파서 (fetch-only, 의존성 없음)
// ---------------------------------------------------------------------------

interface RssArticle {
  title: string
  description: string
  link: string
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i').exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml)
  return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, '').trim() : ''
}

function parseRss(xml: string): RssArticle[] {
  const items: RssArticle[] = []
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemPattern.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const description = extractTag(block, 'description')
    const link = extractTag(block, 'link')
    if (title) items.push({ title, description, link })
  }

  return items
}

async function fetchRssArticles(urls: string[]): Promise<RssArticle[]> {
  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        headers: { 'User-Agent': 'Mattari-Bot/1.0' },
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.text())
        .then(parseRss)
    )
  )

  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .slice(0, 8) // 최대 8개 기사만 사용
}

// ---------------------------------------------------------------------------
// Gemini 요약
// ---------------------------------------------------------------------------

function buildPrompt(category: Category, articles: RssArticle[]): string {
  const categoryDescriptions: Record<string, string> = {
    economy: '경제·금융·투자·부동산',
    it: 'IT·기술·스타트업·AI',
    health: '건강·의학·영양·메디컬',
    exercise: '운동·피트니스·스포츠 과학',
    quote: '명언·철학·인생 지혜',
    essay: '일상·감성 에세이·성찰',
    poem: '한국 현대시·고전시',
  }

  const desc = categoryDescriptions[category.slug] ?? category.name

  if (articles.length === 0) {
    // RSS 없음 → 완전 생성
    return `당신은 깊이 있는 콘텐츠를 쓰는 한국어 작가입니다.

오늘 날짜(${new Date().toLocaleDateString('ko-KR')})에 어울리는 **${desc}** 분야의 읽을거리를 작성해주세요.

요구사항:
- 약 2000자 내외, 독자가 10분 안에 읽을 수 있는 분량
- 마크다운 형식 (## 소제목, > 인용, **굵게**, - 목록 활용)
- 실용적이거나 감성적으로 독자에게 울림을 주는 내용
- 단순 정보 나열이 아닌 하나의 관점이나 통찰을 담을 것

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "제목 (30자 이내)",
  "subtitle": "한줄 요약 또는 부제 (50자 이내)",
  "content": "본문 마크다운"
}`
  }

  const articlesText = articles
    .map((a, i) => `[${i + 1}] ${a.title}\n${a.description}`)
    .join('\n\n')

  return `당신은 깊이 있는 콘텐츠를 쓰는 한국어 작가입니다.

아래는 오늘 수집된 **${desc}** 분야 뉴스 기사 목록입니다:

${articlesText}

위 기사들을 참고하여, 독자가 10분 안에 읽을 수 있는 **하나의 완결된 읽을거리**를 작성해주세요.

요구사항:
- 여러 기사를 단순 나열하지 말고, 하나의 주제로 통합해 작성
- 약 2000자 내외
- 마크다운 형식 (## 소제목, > 인용, **굵게**, - 목록 활용)
- 오늘 날짜 기준 독자에게 실질적인 인사이트를 줄 것
- 출처 기사 URL은 포함하지 말 것

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "제목 (30자 이내)",
  "subtitle": "한줄 요약 또는 부제 (50자 이내)",
  "content": "본문 마크다운"
}`
}

interface GeminiResult {
  title: string
  subtitle: string
  content: string
}

async function callGemini(prompt: string): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  })

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text) as GeminiResult
  } catch {
    // JSON 파싱 실패 시 raw 텍스트를 content로 사용
    return {
      title: '오늘의 콘텐츠',
      subtitle: '',
      content: text,
    }
  }
}

// ---------------------------------------------------------------------------
// 카테고리별 스크랩 + 저장
// ---------------------------------------------------------------------------

async function scrapeCategory(category: Category): Promise<DailyContent> {
  const sources = RSS_SOURCES[category.slug]
  const articles = sources ? await fetchRssArticles(sources) : []
  const prompt = buildPrompt(category, articles)
  const geminiResult = await callGemini(prompt)

  const today = new Date().toISOString().split('T')[0]

  const content: DailyContent = {
    id: crypto.randomUUID(),
    category_id: category.id,
    publish_date: today,
    title: geminiResult.title,
    subtitle: geminiResult.subtitle,
    content: geminiResult.content,
    source_url: articles[0]?.link ?? '',
    reading_time: Math.ceil(geminiResult.content.length / 400), // 분당 약 400자
    created_at: new Date().toISOString(),
  }

  // Supabase에 저장
  if (isSupabaseConfigured && supabase) {
    // slug로 실제 UUID 조회 (시드 데이터의 가짜 ID 대신)
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category.slug)
      .single()

    const categoryId = cat?.id ?? category.id

    const { error } = await supabase
      .from('daily_contents')
      .upsert(
        {
          category_id: categoryId,
          publish_date: today,
          title: content.title,
          subtitle: content.subtitle,
          content: content.content,
          source_url: content.source_url,
          reading_time: content.reading_time,
        },
        { onConflict: 'category_id,publish_date' }
      )

    if (error) console.error(`[scrape] ${category.slug} upsert error:`, error.message)
    else console.log(`[scrape] ${category.slug} saved to Supabase`)
  } else {
    console.log(`[scrape] ${category.slug} (Supabase not configured — dry run)`)
    console.log(`  title: ${content.title}`)
  }

  return content
}

// ---------------------------------------------------------------------------
// 공개 API
// ---------------------------------------------------------------------------

export interface ScrapeResult {
  category: string
  status: 'success' | 'error'
  title?: string
  error?: string
}

/**
 * 전체 카테고리를 순서대로 스크랩합니다.
 * 하나가 실패해도 나머지를 계속 진행합니다.
 */
export async function scrapeAllCategories(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []

  for (const category of CATEGORIES) {
    try {
      const content = await scrapeCategory(category)
      results.push({ category: category.slug, status: 'success', title: content.title })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[scrape] ${category.slug} failed:`, message)
      results.push({ category: category.slug, status: 'error', error: message })
    }
  }

  return results
}

/**
 * 특정 카테고리 하나만 스크랩합니다.
 */
export async function scrapeSingleCategory(slug: string): Promise<ScrapeResult> {
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) return { category: slug, status: 'error', error: 'Unknown category' }

  try {
    const content = await scrapeCategory(category)
    return { category: slug, status: 'success', title: content.title }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { category: slug, status: 'error', error: message }
  }
}
