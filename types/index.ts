export interface Category {
  id: string
  slug: string
  name: string
  icon: string
}

export interface DailyContent {
  id: string
  category_id: string
  publish_date: string
  title: string
  subtitle: string
  content: string
  source_url: string
  reading_time: number
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  preferred_category: string | null
  active: boolean
  created_at: string
}
