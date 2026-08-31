import React from 'react'
import { cn } from '@/lib/utils'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'healthy' | 'warning' | 'critical' | 'inactive' | 'verified' | 'suspicious' | 'lab' | 'normal' | 'default'

const badgeVariants: Record<BadgeVariant, string> = {
  healthy:  'bg-sage-100 text-sage-700 border border-sage-200',
  warning:  'bg-amber-100 text-amber-700 border border-amber-200',
  critical: 'bg-red-100 text-red-700 border border-red-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  verified: 'bg-sage-100 text-sage-700 border border-sage-200',
  suspicious: 'bg-amber-100 text-amber-700 border border-amber-200',
  lab:      'bg-red-100 text-red-700 border border-red-200',
  normal:   'bg-sky-100 text-sky-700 border border-sky-200',
  default:  'bg-gray-100 text-gray-700 border border-gray-200',
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: BadgeVariant, className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', badgeVariants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <div
      className={cn('bg-white rounded-2xl shadow-card border border-amber-50 p-6', onClick && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h3 className={cn('font-display font-semibold text-gray-800 text-lg', className)}>{children}</h3>
}

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:   'bg-honey-500 hover:bg-honey-600 text-white shadow-honey',
  secondary: 'bg-white hover:bg-honey-50 text-honey-700 border border-honey-200',
  ghost:     'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export function Button({
  children, variant = 'primary', size = 'md', className, onClick, disabled, type = 'button',
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-honey-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-transparent transition-all',
        className,
      )}
      {...props}
    />
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      className={cn(
        'px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-transparent transition-all appearance-none cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label, value, unit, icon, color = 'honey', trend, loading,
}: {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  color?: 'honey' | 'sage' | 'sky' | 'red' | 'gray'
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string }
  loading?: boolean
}) {
  const colors = {
    honey: 'bg-honey-50 text-honey-600',
    sage:  'bg-sage-50 text-sage-600',
    sky:   'bg-sky-50 text-sky-600',
    red:   'bg-red-50 text-red-600',
    gray:  'bg-gray-50 text-gray-500',
  }

  return (
    <Card className="flex flex-col gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colors[color])}>{icon}</div>}
      </div>
      {loading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <div className="flex items-end gap-1">
          <span className="text-3xl font-display font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
        </div>
      )}
      {trend && (
        <span className={cn('text-xs font-medium', trend.direction === 'up' ? 'text-sage-600' : trend.direction === 'down' ? 'text-red-500' : 'text-gray-400')}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
        </span>
      )}
    </Card>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && <div className="text-4xl text-gray-300">{icon}</div>}
      <div>
        <p className="font-display font-semibold text-gray-500 text-lg">{title}</p>
        {description && <p className="text-gray-400 text-sm mt-1 max-w-xs">{description}</p>}
      </div>
    </div>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={cn('animate-spin rounded-full border-2 border-honey-200 border-t-honey-500', sizes[size])} />
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, description, actions, badge }: {
  title: string
  description?: string
  actions?: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display font-bold text-2xl text-gray-900">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Status indicator ─────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: 'healthy' | 'warning' | 'critical' | 'inactive' | 'online' | 'offline' }) {
  const colors = {
    healthy:  'bg-sage-500',
    online:   'bg-sage-500',
    warning:  'bg-amber-400',
    critical: 'bg-red-500',
    inactive: 'bg-gray-300',
    offline:  'bg-gray-300',
  }
  return (
    <span className={cn('inline-block w-2 h-2 rounded-full', colors[status], status !== 'inactive' && status !== 'offline' && 'animate-pulse')} />
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-gray-100', className)} />
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </div>
    </div>
  )
}
