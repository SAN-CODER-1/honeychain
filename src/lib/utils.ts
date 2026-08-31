import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length <= chars * 2 + 2) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function generateBatchQR(batchCode: string): string {
  return `${window.location.origin}/verify/${batchCode}`
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'normal':
    case 'verified':
    case 'complete':
    case 'success':
      return 'text-sage-600'
    case 'warning':
    case 'suspicious':
    case 'in_progress':
      return 'text-amber-600'
    case 'critical':
    case 'requires_lab_verification':
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-500'
  }
}

export function getStatusBg(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'normal':
    case 'verified':
    case 'complete':
    case 'success':
      return 'bg-sage-50 border-sage-200'
    case 'warning':
    case 'suspicious':
    case 'in_progress':
      return 'bg-amber-50 border-amber-200'
    case 'critical':
    case 'requires_lab_verification':
    case 'failed':
      return 'bg-red-50 border-red-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatTemp(celsius: number): string {
  return `${celsius.toFixed(1)}°C`
}

export function formatHumidity(pct: number): string {
  return `${pct.toFixed(0)}%`
}
