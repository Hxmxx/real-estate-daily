import type { Category, DailyContent } from '@/types'
import { CATEGORIES, SEED_CONTENTS } from './seed-data'
import { supabase, isSupabaseConfigured } from './supabase'

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('categories').select('*')
    if (!error && data) return data as Category[]
  }
  return CATEGORIES
}

export async function getTodayContent(categorySlug: string): Promise<DailyContent | null> {
  if (isSupabaseConfigured && supabase) {
    const today = new Date().toISOString().split('T')[0]
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (categoryData) {
      const { data, error } = await supabase
        .from('daily_contents')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('publish_date', today)
        .single()

      if (!error && data) return data as DailyContent
    }
  }

  return SEED_CONTENTS[categorySlug] ?? SEED_CONTENTS['economy']
}

export async function saveSubscriber(
  email: string,
  preferredCategory?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    let categoryId: string | null = null
    if (preferredCategory) {
      const { data } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', preferredCategory)
        .single()
      categoryId = data?.id ?? null
    }

    const { error } = await supabase.from('subscribers').upsert(
      { email, preferred_category: categoryId, active: true },
      { onConflict: 'email' }
    )

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // MVP: log only when Supabase is not configured
  console.log('[subscribe]', email, preferredCategory)
  return { success: true }
}
