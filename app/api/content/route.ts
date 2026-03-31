import type { NextRequest } from 'next/server'
import { getTodayContent } from '@/lib/data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'economy'

  const content = await getTodayContent(category)
  return Response.json({ content })
}
