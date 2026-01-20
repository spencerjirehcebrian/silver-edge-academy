import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isToday(d)) {
    return formatDistanceToNow(d, { addSuffix: true })
  }

  if (isYesterday(d)) {
    return 'Yesterday'
  }

  return formatDate(d)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num: number): string {
  return `${Math.round(num)}%`
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function formatDateRange(startDate: string | Date, endDate?: string | Date): string {
  const start = formatDate(startDate)
  if (!endDate) return start
  const end = formatDate(endDate)
  return `${start} - ${end}`
}
