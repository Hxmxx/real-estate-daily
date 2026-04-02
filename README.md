# mattari (まったり)

느긋하게, 오늘의 읽을거리를 만나는 공간.

매일 자정 RSS 피드를 수집하고 Gemini AI가 하나의 완결된 글로 가공해 제공하는 일간 큐레이션 앱입니다.

---

## 주요 기능

- **일간 콘텐츠 자동 생성** — 경제·IT·건강·운동·명언·에세이·시 7개 카테고리
- **RSS 수집 + AI 가공** — 각 카테고리별 뉴스 피드를 Gemini 2.5 Flash가 하나의 읽을거리로 재구성
- **이메일 구독** — 원하는 카테고리의 콘텐츠를 매일 이메일로 수신
- **Supabase 인증** — 이메일/소셜 로그인

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion |
| 데이터베이스 / 인증 | Supabase |
| AI | Google Gemini 2.5 Flash |
| 배포 | Vercel (Cron: 매일 KST 자정) |

## 로컬 개발

```bash
# 의존성 설치
bun install

# 개발 서버 실행
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

### 환경변수

`.env.local`에 아래 값을 설정합니다:

```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SCRAPE_SECRET=          # 스크랩 API 인증 시크릿 (선택)
```

### 수동 스크랩

```bash
# 전체 카테고리
curl -X POST http://localhost:3000/api/scrape \
  -H "Authorization: Bearer <SCRAPE_SECRET>"

# 특정 카테고리만
curl -X POST http://localhost:3000/api/scrape \
  -H "Authorization: Bearer <SCRAPE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"category":"economy"}'
```

## 자동화

Vercel Cron이 매일 UTC 15:00 (KST 자정)에 `/api/scrape`를 호출합니다 (`vercel.json` 참고).

## Supabase 테이블 구조

```
categories      id, slug, name, icon
daily_contents  id, category_id, publish_date, title, subtitle, content, source_url, reading_time
subscribers     id, email, preferred_category, active
```
