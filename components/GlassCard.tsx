import { cn } from '@/lib/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-100', className)}>
      {children}
    </div>
  )
}
