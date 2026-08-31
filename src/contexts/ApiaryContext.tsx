import React, { createContext, useContext, useState } from 'react'

interface ApiaryContextType {
  selectedApiaryId: string | null
  setSelectedApiaryId: (id: string | null) => void
}

const ApiaryContext = createContext<ApiaryContextType>({
  selectedApiaryId: null,
  setSelectedApiaryId: () => {},
})

export function ApiaryProvider({ children }: { children: React.ReactNode }) {
  const [selectedApiaryId, setSelectedApiaryId] = useState<string | null>(null)

  return (
    <ApiaryContext.Provider value={{ selectedApiaryId, setSelectedApiaryId }}>
      {children}
    </ApiaryContext.Provider>
  )
}

export function useApiary() {
  return useContext(ApiaryContext)
}
