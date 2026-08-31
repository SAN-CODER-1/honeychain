import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, Database, Zap, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { useApiary } from '@/contexts/ApiaryContext'
import { useApiaries } from '@/hooks/useData'
import { demoData } from '@/lib/demoData'
import { MobileSidebar } from './Sidebar'

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ type: string; label: string; sub: string; to: string }[]>([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return }
    const q = query.toLowerCase()
    const found: typeof results = []

    demoData.hives.forEach(h => {
      if (h.hive_code.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)) {
        found.push({ type: 'Hive', label: h.hive_code, sub: h.name, to: `/hives/${h.id}` })
      }
    })
    demoData.honeyBatches.forEach(b => {
      if (b.batch_code.toLowerCase().includes(q)) {
        const hive = demoData.hives.find(h => h.id === b.hive_id)
        found.push({ type: 'Batch', label: b.batch_code, sub: hive?.hive_code ?? '', to: `/batches/${b.id}` })
      }
    })
    demoData.apiaries.forEach(a => {
      if (a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) {
        found.push({ type: 'Apiary', label: a.name, sub: a.location, to: '/' })
      }
    })

    setResults(found.slice(0, 8))
    setOpen(true)
  }, [query])

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search hives, batches, apiaries…"
          className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 w-72 focus:outline-none focus:ring-2 focus:ring-honey-400 focus:bg-white transition-all"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { navigate(r.to); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-honey-50 text-left transition-colors"
            >
              <span className="text-xs bg-honey-100 text-honey-700 px-2 py-0.5 rounded-full font-medium shrink-0">{r.type}</span>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{r.label}</div>
                <div className="text-xs text-gray-400 truncate">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ApiarySelector() {
  const { data: apiaries } = useApiaries()
  const { selectedApiaryId, setSelectedApiaryId } = useApiary()
  const selected = apiaries.find(a => a.id === selectedApiaryId)

  return (
    <div className="relative flex items-center gap-1">
      <select
        value={selectedApiaryId ?? ''}
        onChange={e => setSelectedApiaryId(e.target.value || null)}
        className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-honey-400 cursor-pointer max-w-[180px]"
      >
        <option value="">All Apiaries</option>
        {apiaries.map(a => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function DemoToggle() {
  const { isDemo, toggleDemo } = useDemoMode()
  return (
    <button
      onClick={toggleDemo}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border',
        isDemo
          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          : 'bg-sage-50 text-sage-700 border-sage-200 hover:bg-sage-100',
      )}
    >
      {isDemo ? <Database size={14} /> : <Zap size={14} />}
      <span className="hidden sm:inline">{isDemo ? 'Demo Data' : 'Live Data'}</span>
    </button>
  )
}

function NotificationBell() {
  return (
    <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
      <Bell size={18} />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
    </button>
  )
}

export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 z-40">
      <MobileSidebar />
      <div className="flex-1 flex items-center gap-3">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <ApiarySelector />
        <DemoToggle />
        <NotificationBell />
        <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 bg-honey-100 rounded-full flex items-center justify-center">
            <User size={14} className="text-honey-600" />
          </div>
        </button>
      </div>
    </header>
  )
}
