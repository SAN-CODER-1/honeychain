import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useDemoMode } from '@/contexts/DemoModeContext'

export function Layout() {
  const { isDemo } = useDemoMode()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 bg-honey-pattern">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 border-r border-honey-100 bg-white">
        <Sidebar className="w-full" />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        {/* Demo mode banner */}
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-700 font-medium">
            <span className="animate-pulse">🟡</span>
            <span>DEMO MODE – Displaying locally generated data. Click "Demo Data" to switch to Live Supabase data.</span>
          </div>
        )}

        {/* Page outlet */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
