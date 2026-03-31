import type { NextRequest } from 'next/server'
import { saveSubscriber } from '@/lib/data'

export async function POST(request: NextRequest) {
  let body: { email?: string; preferred_category?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { email, preferred_category } = body

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ success: false, error: '유효한 이메일을 입력해주세요.' }, { status: 400 })
  }

  const result = await saveSubscriber(email.trim().toLowerCase(), preferred_category)

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 })
  }

  return Response.json({ success: true })
}
