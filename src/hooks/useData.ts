import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { demoData } from '@/lib/demoData'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { useApiary } from '@/contexts/ApiaryContext'
import type { Apiary, Hive, SensorReading, HiveOpening, AIInsight, HoneyBatch, BatchQualityScreening, BlockchainRecord, BatchEvent } from '@/lib/supabase'

// ─── Apiaries ─────────────────────────────────────────────────────────────────
export function useApiaries() {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<Apiary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDemo) {
      setData(demoData.apiaries)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.from('apiaries').select('*').order('created_at').then(({ data: rows, error: err }) => {
      if (err) setError(err.message)
      else setData(rows ?? [])
      setLoading(false)
    })
  }, [isDemo])

  return { data, loading, error }
}

// ─── Hives ────────────────────────────────────────────────────────────────────
export function useHives() {
  const { isDemo } = useDemoMode()
  const { selectedApiaryId } = useApiary()
  const [data, setData] = useState<Hive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDemo) {
      let hives = demoData.hives
      if (selectedApiaryId) hives = hives.filter(h => h.apiary_id === selectedApiaryId)
      // Attach apiary info
      setData(hives.map(h => ({
        ...h,
        apiary: demoData.apiaries.find(a => a.id === h.apiary_id),
      })))
      setLoading(false)
      return
    }
    setLoading(true)
    let q = supabase.from('hives').select('*, apiary:apiaries(*)')
    if (selectedApiaryId) q = q.eq('apiary_id', selectedApiaryId)
    q.order('hive_code').then(({ data: rows, error: err }) => {
      if (err) setError(err.message)
      else setData((rows ?? []) as Hive[])
      setLoading(false)
    })
  }, [isDemo, selectedApiaryId])

  return { data, loading, error }
}

// ─── Single Hive ──────────────────────────────────────────────────────────────
export function useHive(hiveId: string | undefined) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<Hive | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hiveId) { setLoading(false); return }
    if (isDemo) {
      const h = demoData.hives.find(h => h.id === hiveId || h.hive_code === hiveId)
      setData(h ? { ...h, apiary: demoData.apiaries.find(a => a.id === h.apiary_id) } : null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.from('hives').select('*, apiary:apiaries(*)').eq('id', hiveId).single()
      .then(({ data: row, error: err }) => {
        if (err) setError(err.message)
        else setData(row as Hive)
        setLoading(false)
      })
  }, [hiveId, isDemo])

  return { data, loading, error }
}

// ─── Latest Sensor Reading ────────────────────────────────────────────────────
export function useLatestReading(hiveId: string | undefined) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<SensorReading | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hiveId) { setLoading(false); return }
    if (isDemo) {
      const readings = demoData.sensorReadings.filter(r => r.hive_id === hiveId)
      const latest = readings.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0]
      setData(latest ?? null)
      setLoading(false)
      return
    }
    supabase.from('sensor_readings').select('*').eq('hive_id', hiveId)
      .order('recorded_at', { ascending: false }).limit(1).single()
      .then(({ data: row }) => { setData(row); setLoading(false) })
  }, [hiveId, isDemo])

  return { data, loading }
}

// ─── Sensor Readings (time-range) ─────────────────────────────────────────────
export function useSensorReadings(hiveId: string | undefined, days: number) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hiveId) { setLoading(false); return }
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    if (isDemo) {
      const readings = demoData.sensorReadings
        .filter(r => r.hive_id === hiveId && new Date(r.recorded_at) >= cutoff)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      setData(readings)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.from('sensor_readings').select('*')
      .eq('hive_id', hiveId)
      .gte('recorded_at', cutoff.toISOString())
      .order('recorded_at')
      .then(({ data: rows }) => { setData(rows ?? []); setLoading(false) })
  }, [hiveId, days, isDemo])

  return { data, loading }
}

// ─── Hive Openings ────────────────────────────────────────────────────────────
export function useHiveOpenings(hiveId?: string) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<HiveOpening[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      let openings = demoData.hiveOpenings
      if (hiveId) openings = openings.filter(o => o.hive_id === hiveId)
      setData(openings.sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()))
      setLoading(false)
      return
    }
    let q = supabase.from('hive_openings').select('*, hive:hives(hive_code, name)')
    if (hiveId) q = q.eq('hive_id', hiveId)
    q.order('opened_at', { ascending: false }).then(({ data: rows }) => {
      setData((rows ?? []) as HiveOpening[])
      setLoading(false)
    })
  }, [hiveId, isDemo])

  return { data, loading }
}

// ─── AI Insights ──────────────────────────────────────────────────────────────
export function useAIInsights(hiveId?: string) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      let insights = demoData.aiInsights
      if (hiveId) insights = insights.filter(i => i.hive_id === hiveId)
      setData(insights.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      setLoading(false)
      return
    }
    let q = supabase.from('ai_insights').select('*, hive:hives(hive_code, name)')
    if (hiveId) q = q.eq('hive_id', hiveId)
    q.order('created_at', { ascending: false }).then(({ data: rows }) => {
      setData((rows ?? []) as AIInsight[])
      setLoading(false)
    })
  }, [hiveId, isDemo])

  return { data, loading }
}

// ─── Honey Batches ────────────────────────────────────────────────────────────
export function useHoneyBatches(hiveId?: string) {
  const { isDemo } = useDemoMode()
  const { selectedApiaryId } = useApiary()
  const [data, setData] = useState<HoneyBatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      let batches = demoData.honeyBatches
      if (hiveId) {
        batches = batches.filter(b => b.hive_id === hiveId)
      } else if (selectedApiaryId) {
        const apiaryHiveIds = demoData.hives.filter(h => h.apiary_id === selectedApiaryId).map(h => h.id)
        batches = batches.filter(b => apiaryHiveIds.includes(b.hive_id))
      }
      setData(batches.map(b => ({
        ...b,
        hive: {
          ...demoData.hives.find(h => h.id === b.hive_id)!,
          apiary: demoData.apiaries.find(a => a.id === demoData.hives.find(h => h.id === b.hive_id)?.apiary_id),
        },
      })).sort((a, b) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime()))
      setLoading(false)
      return
    }
    let q = supabase.from('honey_batches').select('*, hive:hives(*, apiary:apiaries(*))')
    if (hiveId) q = q.eq('hive_id', hiveId)
    q.order('harvest_date', { ascending: false }).then(({ data: rows }) => {
      setData((rows ?? []) as HoneyBatch[])
      setLoading(false)
    })
  }, [hiveId, selectedApiaryId, isDemo])

  return { data, loading }
}

// ─── Single Batch ─────────────────────────────────────────────────────────────
export function useHoneyBatch(batchId: string | undefined) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<HoneyBatch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!batchId) { setLoading(false); return }
    if (isDemo) {
      const b = demoData.honeyBatches.find(b => b.id === batchId || b.batch_code === batchId)
      if (b) {
        const hive = demoData.hives.find(h => h.id === b.hive_id)
        setData({ ...b, hive: hive ? { ...hive, apiary: demoData.apiaries.find(a => a.id === hive.apiary_id) } : undefined })
      }
      setLoading(false)
      return
    }
    const query = supabase.from('honey_batches').select('*, hive:hives(*, apiary:apiaries(*))')
    const lookup = batchId.startsWith('HNY-')
      ? query.eq('batch_code', batchId)
      : query.eq('id', batchId)
    lookup.single()
      .then(({ data: row }) => { setData(row as HoneyBatch); setLoading(false) })
  }, [batchId, isDemo])

  return { data, loading }
}

// ─── Batch Quality Screening ──────────────────────────────────────────────────
export function useBatchScreening(batchId: string | undefined) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<BatchQualityScreening | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!batchId) { setLoading(false); return }
    if (isDemo) {
      const s = demoData.batchScreenings.find(s => s.batch_id === batchId)
      setData(s ?? null)
      setLoading(false)
      return
    }
    supabase.from('batch_quality_screenings').select('*').eq('batch_id', batchId).order('created_at', { ascending: false }).limit(1).single()
      .then(({ data: row }) => { setData(row); setLoading(false) })
  }, [batchId, isDemo])

  return { data, loading }
}

// ─── Blockchain Records ───────────────────────────────────────────────────────
export function useBlockchainRecords(batchId?: string) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<BlockchainRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      let records = demoData.blockchainRecords
      if (batchId) records = records.filter(r => r.batch_id === batchId)
      setData(records.map(r => ({
        ...r,
        batch: demoData.honeyBatches.find(b => b.id === r.batch_id),
      })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      setLoading(false)
      return
    }
    let q = supabase.from('blockchain_records').select('*, batch:honey_batches(batch_code, hive_id)')
    if (batchId) q = q.eq('batch_id', batchId)
    q.order('created_at', { ascending: false }).then(({ data: rows }) => {
      setData((rows ?? []) as BlockchainRecord[])
      setLoading(false)
    })
  }, [batchId, isDemo])

  return { data, loading }
}

// ─── Batch Events ─────────────────────────────────────────────────────────────
export function useBatchEvents(batchId: string | undefined) {
  const { isDemo } = useDemoMode()
  const [data, setData] = useState<BatchEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!batchId) { setLoading(false); return }
    if (isDemo) {
      setData(demoData.batchEvents.filter(e => e.batch_id === batchId).sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime()))
      setLoading(false)
      return
    }
    supabase.from('batch_events').select('*').eq('batch_id', batchId).order('event_time')
      .then(({ data: rows }) => { setData(rows ?? []); setLoading(false) })
  }, [batchId, isDemo])

  return { data, loading }
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export function useDashboardKPIs() {
  const { isDemo } = useDemoMode()
  const { selectedApiaryId } = useApiary()
  const [data, setData] = useState({
    totalApiaries: 0,
    totalHives: 0,
    healthyHives: 0,
    warningHives: 0,
    criticalHives: 0,
    activeBatches: 0,
    harvestReady: 0,
    verifiedBatches: 0,
  })
  const [loading, setLoading] = useState(true)

  const calculate = useCallback(() => {
    if (isDemo) {
      let hives = demoData.hives
      let batches = demoData.honeyBatches
      const apiaries = demoData.apiaries

      if (selectedApiaryId) {
        hives = hives.filter(h => h.apiary_id === selectedApiaryId)
        const hiveIds = hives.map(h => h.id)
        batches = batches.filter(b => hiveIds.includes(b.hive_id))
      }

      setData({
        totalApiaries: selectedApiaryId ? 1 : apiaries.length,
        totalHives: hives.length,
        healthyHives: hives.filter(h => h.status === 'healthy').length,
        warningHives: hives.filter(h => h.status === 'warning').length,
        criticalHives: hives.filter(h => h.status === 'critical').length,
        activeBatches: batches.filter(b => b.curing_status === 'in_progress').length,
        harvestReady: batches.filter(b => b.curing_status === 'complete' && b.quality_status === 'pending').length,
        verifiedBatches: batches.filter(b => b.blockchain_status === 'VERIFIED').length,
      })
      setLoading(false)
    }
  }, [isDemo, selectedApiaryId])

  useEffect(() => { calculate() }, [calculate])

  return { data, loading }
}

// ─── Realtime hook ────────────────────────────────────────────────────────────
export function useRealtimeSensor(hiveId: string | undefined, onUpdate: (reading: SensorReading) => void) {
  const { isDemo } = useDemoMode()

  useEffect(() => {
    if (isDemo || !hiveId) return

    const channel = supabase
      .channel(`sensor_readings_${hiveId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `hive_id=eq.${hiveId}`,
      }, (payload) => {
        onUpdate(payload.new as SensorReading)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [hiveId, isDemo, onUpdate])
}
