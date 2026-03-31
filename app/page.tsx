import { getCategories, getTodayContent } from '@/lib/data'
import MainShell from '@/components/MainShell'

const DEFAULT_CATEGORY = 'economy'

export default async function Home() {
  const [categories, initialContent] = await Promise.all([
    getCategories(),
    getTodayContent(DEFAULT_CATEGORY),
  ])

  return (
    <MainShell
      categories={categories}
      initialContent={initialContent}
      initialCategory={DEFAULT_CATEGORY}
    />
  )
}
