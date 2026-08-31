import React, { createContext, useContext, useState, useEffect } from 'react'

interface DemoModeContextType {
  isDemo: boolean
  toggleDemo: () => void
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemo: true,
  toggleDemo: () => {},
})

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    const stored = localStorage.getItem('honeychain_demo_mode')
    return stored !== null ? stored === 'true' : true // default to demo
  })

  useEffect(() => {
    localStorage.setItem('honeychain_demo_mode', String(isDemo))
  }, [isDemo])

  const toggleDemo = () => setIsDemo(prev => !prev)

  return (
    <DemoModeContext.Provider value={{ isDemo, toggleDemo }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  return useContext(DemoModeContext)
}
