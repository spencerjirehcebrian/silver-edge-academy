import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
}

const colors = [
  'bg-accent-100 text-accent-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-sky-100 text-sky-600',
  'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
]

function getInitials(name: string): string {
  const trimmed = name?.trim()
  if (!trimmed) return '??'

  const parts = trimmed.split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getColorIndex(name: string): number {
  if (!name) return 0

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % colors.length
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const colorClass = colors[getColorIndex(name)]

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        sizes[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
