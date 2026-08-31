import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, Map, Package, CheckCircle, ShieldCheck,
  BarChart2, Droplets, DoorOpen, Brain, Link2, QrCode,
  FileText, Settings, ChevronDown, ChevronRight, Hexagon, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to?: string
  icon: React.ReactNode
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard size={18} /> },
  {
    label: 'Hives', icon: <Hexagon size={18} />,
    children: [
      { label: 'All Hives', to: '/hives', icon: <GitBranch size={16} /> },
      { label: 'Hive Map', to: '/hive-map', icon: <Map size={16} /> },
    ],
  },
  {
    label: 'Batches', icon: <Package size={18} />,
    children: [
      { label: 'All Batches', to: '/batches', icon: <Package size={16} /> },
      { label: 'Harvest Ready', to: '/batches?filter=harvest', icon: <CheckCircle size={16} /> },
      { label: 'Verified', to: '/batches?filter=verified', icon: <ShieldCheck size={16} /> },
    ],
  },
  {
    label: 'Monitoring', icon: <BarChart2 size={18} />,
    children: [
      { label: 'Sensor Analytics', to: '/analytics/sensors', icon: <BarChart2 size={16} /> },
      { label: 'Curing Analytics', to: '/analytics/curing', icon: <Droplets size={16} /> },
      { label: 'Opening History', to: '/openings', icon: <DoorOpen size={16} /> },
      { label: 'AI Insights', to: '/ai-insights', icon: <Brain size={16} /> },
    ],
  },
  {
    label: 'Traceability', icon: <Link2 size={18} />,
    children: [
      { label: 'Blockchain Records', to: '/blockchain', icon: <Link2 size={16} /> },
      { label: 'QR Verification', to: '/qr', icon: <QrCode size={16} /> },
    ],
  },
  { label: 'Reports', to: '/reports', icon: <FileText size={18} /> },
  { label: 'Settings', to: '/settings', icon: <Settings size={18} /> },
]

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const location = useLocation()
  const hasChildren = item.children && item.children.length > 0
  const isChildActive = hasChildren && item.children!.some(c => c.to && location.pathname === c.to)
  const [open, setOpen] = useState(isChildActive)

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-honey-50 hover:text-honey-700 font-medium transition-all duration-150 text-sm',
            isChildActive && 'text-honey-700',
          )}
        >
          <span className="text-gray-400">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <span className="text-gray-300">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-honey-100 pl-3">
            {item.children!.map(child => (
              <NavItemComponent key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to!}
      end={item.to === '/'}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-honey-50 hover:text-honey-700 font-medium transition-all duration-150 text-sm',
        isActive && 'bg-honey-100 text-honey-700 font-semibold',
        depth > 0 && 'py-2 text-xs',
      )}
    >
      <span className={depth > 0 ? 'text-gray-400' : 'text-gray-400'}>{item.icon}</span>
      {item.label}
    </NavLink>
  )
}

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  return (
    <aside className={cn('flex flex-col h-full', className)}>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-honey-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-honey-gradient rounded-xl flex items-center justify-center shadow-honey">
            <span className="text-xl">🍯</span>
          </div>
          <div>
            <div className="font-display font-bold text-gray-900 text-lg leading-none">HoneyChain</div>
            <div className="text-xs text-honey-600 font-medium">AI Hive Platform</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {navItems.map(item => (
          <NavItemComponent key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-honey-100">
        <div className="text-xs text-gray-400 text-center">
          HoneyChain v1.0.0 · IoT + AI + Blockchain
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile Sidebar Toggle ────────────────────────────────────────────────────
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl">
            <Sidebar onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
