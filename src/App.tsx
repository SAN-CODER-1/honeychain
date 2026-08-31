import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ApiaryProvider } from '@/contexts/ApiaryContext'
import { DemoModeProvider } from '@/contexts/DemoModeContext'
import DashboardPage from '@/pages/DashboardPage'
import HivesPage from '@/pages/HivesPage'
import HiveDetailPage from '@/pages/HiveDetailPage'
import BatchesPage from '@/pages/BatchesPage'
import BatchDetailPage from '@/pages/BatchDetailPage'
import SensorAnalyticsPage from '@/pages/SensorAnalyticsPage'
import CuringAnalyticsPage from '@/pages/CuringAnalyticsPage'
import OpeningHistoryPage from '@/pages/OpeningHistoryPage'
import VerifyBatchPage from '@/pages/VerifyBatchPage'

function App() {
  return (
    <BrowserRouter>
      <DemoModeProvider>
        <ApiaryProvider>
          <Routes>
            <Route path="verify/:batchCode" element={<VerifyBatchPage />} />
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="hives" element={<HivesPage />} />
              <Route path="hives/:hiveId" element={<HiveDetailPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="batches/:batchId" element={<BatchDetailPage />} />
              <Route path="analytics/sensors" element={<SensorAnalyticsPage />} />
              <Route path="analytics/curing" element={<CuringAnalyticsPage />} />
              <Route path="openings" element={<OpeningHistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ApiaryProvider>
      </DemoModeProvider>
    </BrowserRouter>
  )
}

export default App
