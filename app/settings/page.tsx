import { getCategories } from '@/lib/data'
import SettingsShell from '@/components/SettingsShell'

export default async function SettingsPage() {
  const categories = await getCategories()
  return <SettingsShell categories={categories} />
}
