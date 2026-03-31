import { cn } from '@/lib/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl',
        className
      )}
    >
      {children}
    </div>
  )
}
