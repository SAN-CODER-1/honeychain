import type {
  Apiary,
  Hive,
  SensorReading,
  HiveOpening,
  AIInsight,
  HoneyBatch,
  BatchQualityScreening,
  BlockchainRecord,
  BatchEvent,
} from './supabase'

// ─── Apiaries ────────────────────────────────────────────────────────────────
export const demoApiaries: Apiary[] = [
  {
    id: 'apiary-1',
    name: 'North Field Apiary',
    location: 'Lot 12, Northern Hills Road, Beechworth VIC',
    description: 'Primary apiary positioned on elevated clover and eucalyptus terrain',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'apiary-2',
    name: 'South Field Apiary',
    location: 'Lot 7, Southern Valley Road, Bright VIC',
    description: 'Secondary apiary near river flats with diverse wildflower forage',
    created_at: '2025-10-15T00:00:00Z',
  },
  {
    id: 'apiary-3',
    name: 'River Side Apiary',
    location: 'Riverside Estate, Ovens River, Myrtleford VIC',
    description: 'Riverside apiary specialising in manuka and leatherwood production',
    created_at: '2025-11-01T00:00:00Z',
  },
]

// ─── Hives ───────────────────────────────────────────────────────────────────
export const demoHives: Hive[] = [
  { id: 'hive-1',  hive_code: 'HIVE-001', apiary_id: 'apiary-1', name: 'Alpha Colony',   location: 'Row A, Position 1', status: 'healthy',  installed_at: '2025-09-01T00:00:00Z', created_at: '2025-09-01T00:00:00Z' },
  { id: 'hive-2',  hive_code: 'HIVE-002', apiary_id: 'apiary-1', name: 'Beta Colony',    location: 'Row A, Position 2', status: 'healthy',  installed_at: '2025-09-01T00:00:00Z', created_at: '2025-09-01T00:00:00Z' },
  { id: 'hive-3',  hive_code: 'HIVE-003', apiary_id: 'apiary-1', name: 'Gamma Colony',   location: 'Row B, Position 1', status: 'warning',  installed_at: '2025-09-15T00:00:00Z', created_at: '2025-09-15T00:00:00Z' },
  { id: 'hive-4',  hive_code: 'HIVE-004', apiary_id: 'apiary-1', name: 'Delta Colony',   location: 'Row B, Position 2', status: 'healthy',  installed_at: '2025-09-15T00:00:00Z', created_at: '2025-09-15T00:00:00Z' },
  { id: 'hive-5',  hive_code: 'HIVE-005', apiary_id: 'apiary-2', name: 'Epsilon Colony', location: 'Row A, Position 1', status: 'healthy',  installed_at: '2025-10-15T00:00:00Z', created_at: '2025-10-15T00:00:00Z' },
  { id: 'hive-6',  hive_code: 'HIVE-006', apiary_id: 'apiary-2', name: 'Zeta Colony',    location: 'Row A, Position 2', status: 'critical', installed_at: '2025-10-15T00:00:00Z', created_at: '2025-10-15T00:00:00Z' },
  { id: 'hive-7',  hive_code: 'HIVE-007', apiary_id: 'apiary-2', name: 'Eta Colony',     location: 'Row B, Position 1', status: 'healthy',  installed_at: '2025-10-20T00:00:00Z', created_at: '2025-10-20T00:00:00Z' },
  { id: 'hive-8',  hive_code: 'HIVE-008', apiary_id: 'apiary-2', name: 'Theta Colony',   location: 'Row B, Position 2', status: 'warning',  installed_at: '2025-10-20T00:00:00Z', created_at: '2025-10-20T00:00:00Z' },
  { id: 'hive-9',  hive_code: 'HIVE-009', apiary_id: 'apiary-3', name: 'Iota Colony',    location: 'Row A, Position 1', status: 'healthy',  installed_at: '2025-11-01T00:00:00Z', created_at: '2025-11-01T00:00:00Z' },
  { id: 'hive-10', hive_code: 'HIVE-010', apiary_id: 'apiary-3', name: 'Kappa Colony',   location: 'Row A, Position 2', status: 'healthy',  installed_at: '2025-11-01T00:00:00Z', created_at: '2025-11-01T00:00:00Z' },
  { id: 'hive-11', hive_code: 'HIVE-011', apiary_id: 'apiary-3', name: 'Lambda Colony',  location: 'Row B, Position 1', status: 'inactive', installed_at: '2025-11-10T00:00:00Z', created_at: '2025-11-10T00:00:00Z' },
  { id: 'hive-12', hive_code: 'HIVE-012', apiary_id: 'apiary-3', name: 'Mu Colony',      location: 'Row B, Position 2', status: 'healthy',  installed_at: '2025-11-10T00:00:00Z', created_at: '2025-11-10T00:00:00Z' },
]

// ─── Generate Sensor Readings ────────────────────────────────────────────────
function generateReadings(hiveId: string, days: number, baseTemp: number, baseHumidity: number, baseWeight: number): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date('2026-08-31T18:00:00Z')
  for (let d = days; d >= 0; d--) {
    for (let h = 0; h < 24; h += 2) {
      const time = new Date(now)
      time.setDate(time.getDate() - d)
      time.setHours(h, 0, 0, 0)
      const hourFactor = Math.sin((h - 6) * Math.PI / 12) // peak at noon
      readings.push({
        id: `sr-${hiveId}-${d}-${h}`,
        hive_id: hiveId,
        temperature: +(baseTemp + hourFactor * 2.5 + (Math.random() - 0.5) * 1.2).toFixed(1),
        humidity: +(baseHumidity - hourFactor * 3 + (Math.random() - 0.5) * 2).toFixed(0),
        weight: +(baseWeight + (days - d) * 0.08 + (Math.random() - 0.5) * 0.3).toFixed(2),
        bee_activity: +(40 + Math.max(0, hourFactor * 50) + (Math.random() - 0.5) * 10).toFixed(0),
        recorded_at: time.toISOString(),
      })
    }
  }
  return readings
}

export const demoSensorReadings: SensorReading[] = [
  ...generateReadings('hive-1',  30, 34.2, 68, 42.4),
  ...generateReadings('hive-2',  30, 33.8, 70, 38.2),
  ...generateReadings('hive-3',  30, 36.5, 74, 31.0),
  ...generateReadings('hive-4',  30, 34.0, 67, 45.1),
  ...generateReadings('hive-5',  30, 33.5, 69, 40.0),
  ...generateReadings('hive-6',  30, 38.2, 81, 22.0),
  ...generateReadings('hive-7',  30, 34.1, 68, 43.5),
  ...generateReadings('hive-8',  30, 35.8, 72, 35.0),
  ...generateReadings('hive-9',  30, 34.5, 66, 47.2),
  ...generateReadings('hive-10', 30, 33.9, 69, 41.8),
  ...generateReadings('hive-11',  5, 22.0, 55, 18.0),
  ...generateReadings('hive-12', 30, 34.3, 67, 44.6),
]

// ─── Hive Openings ───────────────────────────────────────────────────────────
export const demoHiveOpenings: HiveOpening[] = [
  { id: 'ho-1',  hive_id: 'hive-1', opened_at: '2026-08-31T07:30:00Z', closed_at: '2026-08-31T08:00:00Z', duration_minutes: 30, reason: 'Routine Inspection', created_at: '2026-08-31T07:30:00Z' },
  { id: 'ho-2',  hive_id: 'hive-1', opened_at: '2026-08-28T09:00:00Z', closed_at: '2026-08-28T09:45:00Z', duration_minutes: 45, reason: 'Queen Check',         created_at: '2026-08-28T09:00:00Z' },
  { id: 'ho-3',  hive_id: 'hive-1', opened_at: '2026-08-25T07:00:00Z', closed_at: '2026-08-25T07:20:00Z', duration_minutes: 20, reason: 'Routine Inspection', created_at: '2026-08-25T07:00:00Z' },
  { id: 'ho-4',  hive_id: 'hive-1', opened_at: '2026-08-20T08:30:00Z', closed_at: '2026-08-20T09:30:00Z', duration_minutes: 60, reason: 'Harvest',             created_at: '2026-08-20T08:30:00Z' },
  { id: 'ho-5',  hive_id: 'hive-1', opened_at: '2026-08-15T07:45:00Z', closed_at: '2026-08-15T08:15:00Z', duration_minutes: 30, reason: 'Routine Inspection', created_at: '2026-08-15T07:45:00Z' },
  { id: 'ho-6',  hive_id: 'hive-2', opened_at: '2026-08-30T10:00:00Z', closed_at: '2026-08-30T10:30:00Z', duration_minutes: 30, reason: 'Routine Inspection', created_at: '2026-08-30T10:00:00Z' },
  { id: 'ho-7',  hive_id: 'hive-3', opened_at: '2026-08-31T06:00:00Z', closed_at: '2026-08-31T06:10:00Z', duration_minutes: 10, reason: 'Maintenance',        created_at: '2026-08-31T06:00:00Z' },
  { id: 'ho-8',  hive_id: 'hive-3', opened_at: '2026-08-29T08:00:00Z', closed_at: '2026-08-29T08:20:00Z', duration_minutes: 20, reason: 'Queen Check',         created_at: '2026-08-29T08:00:00Z' },
  { id: 'ho-9',  hive_id: 'hive-4', opened_at: '2026-08-27T09:30:00Z', closed_at: '2026-08-27T10:00:00Z', duration_minutes: 30, reason: 'Routine Inspection', created_at: '2026-08-27T09:30:00Z' },
  { id: 'ho-10', hive_id: 'hive-5', opened_at: '2026-08-26T08:00:00Z', closed_at: '2026-08-26T08:45:00Z', duration_minutes: 45, reason: 'Harvest',             created_at: '2026-08-26T08:00:00Z' },
  { id: 'ho-11', hive_id: 'hive-6', opened_at: '2026-08-31T09:00:00Z', closed_at: '2026-08-31T09:15:00Z', duration_minutes: 15, reason: 'Maintenance',        created_at: '2026-08-31T09:00:00Z' },
  { id: 'ho-12', hive_id: 'hive-6', opened_at: '2026-08-31T11:00:00Z', closed_at: '2026-08-31T11:20:00Z', duration_minutes: 20, reason: 'Queen Check',         created_at: '2026-08-31T11:00:00Z' },
  { id: 'ho-13', hive_id: 'hive-6', opened_at: '2026-08-30T07:30:00Z', closed_at: '2026-08-30T07:45:00Z', duration_minutes: 15, reason: 'Other',               created_at: '2026-08-30T07:30:00Z' },
  { id: 'ho-14', hive_id: 'hive-7', opened_at: '2026-08-29T10:00:00Z', closed_at: '2026-08-29T10:40:00Z', duration_minutes: 40, reason: 'Routine Inspection', created_at: '2026-08-29T10:00:00Z' },
  { id: 'ho-15', hive_id: 'hive-9', opened_at: '2026-08-28T08:30:00Z', closed_at: '2026-08-28T09:00:00Z', duration_minutes: 30, reason: 'Harvest',             created_at: '2026-08-28T08:30:00Z' },
]

// ─── AI Insights ─────────────────────────────────────────────────────────────
export const demoAIInsights: AIInsight[] = [
  { id: 'ai-1',  hive_id: 'hive-1', type: 'queen_detection',    result: 'Detected',            confidence: 0.98, message: 'Queen activity patterns detected via vibration and worker traffic analysis.', severity: 'success',  created_at: '2026-08-31T12:00:00Z' },
  { id: 'ai-2',  hive_id: 'hive-1', type: 'curing',             result: 'Normal',              confidence: 0.89, message: 'Weight increase is following the expected curing pattern.', severity: 'success',  created_at: '2026-08-31T12:00:00Z' },
  { id: 'ai-3',  hive_id: 'hive-1', type: 'opening_frequency',  result: 'Above Baseline',      confidence: 0.86, message: 'Opening frequency is 35% higher than this hive\'s baseline. Consider spacing inspections.', severity: 'warning',  created_at: '2026-08-31T12:00:00Z' },
  { id: 'ai-4',  hive_id: 'hive-1', type: 'activity',           result: 'High Activity',       confidence: 0.92, message: 'Foraging activity is elevated – likely due to nearby flowering season.', severity: 'success',  created_at: '2026-08-31T12:00:00Z' },
  { id: 'ai-5',  hive_id: 'hive-1', type: 'productivity',       result: 'Above Average',       confidence: 0.87, message: 'Colony productivity is tracking 18% above seasonal average.', severity: 'success',  created_at: '2026-08-31T12:00:00Z' },
  { id: 'ai-6',  hive_id: 'hive-3', type: 'queen_detection',    result: 'Not Detected',        confidence: 0.91, message: 'No queen vibration patterns detected in the last 48 hours. Immediate inspection recommended.', severity: 'critical', created_at: '2026-08-31T10:00:00Z' },
  { id: 'ai-7',  hive_id: 'hive-3', type: 'activity',           result: 'Abnormal Drop',       confidence: 0.84, message: 'Bee activity has dropped 42% compared to 72h rolling average.', severity: 'critical', created_at: '2026-08-31T10:00:00Z' },
  { id: 'ai-8',  hive_id: 'hive-6', type: 'curing',             result: 'Possible Anomaly',    confidence: 0.77, message: 'Possible curing anomaly detected. Moisture levels higher than expected for this curing stage.', severity: 'warning',  created_at: '2026-08-31T08:00:00Z' },
  { id: 'ai-9',  hive_id: 'hive-6', type: 'queen_detection',    result: 'Requires Verification', confidence: 0.72, message: 'Inconclusive queen detection. Recommend manual inspection.', severity: 'warning',  created_at: '2026-08-31T08:00:00Z' },
  { id: 'ai-10', hive_id: 'hive-2', type: 'productivity',       result: 'Normal',              confidence: 0.90, message: 'Colony productivity is within expected range for this time of season.', severity: 'success',  created_at: '2026-08-30T12:00:00Z' },
  { id: 'ai-11', hive_id: 'hive-4', type: 'curing',             result: 'Normal',              confidence: 0.93, message: 'Curing progressing well. Harvest window estimated in 5–7 days.', severity: 'success',  created_at: '2026-08-30T10:00:00Z' },
  { id: 'ai-12', hive_id: 'hive-8', type: 'activity',           result: 'Slightly Low',        confidence: 0.81, message: 'Bee activity 15% below baseline. Monitor over next 48 hours.', severity: 'warning',  created_at: '2026-08-29T12:00:00Z' },
]

// ─── Honey Batches ───────────────────────────────────────────────────────────
export const demoHoneyBatches: HoneyBatch[] = [
  { id: 'batch-1',  batch_code: 'HNY-2026-001', hive_id: 'hive-1',  harvest_date: '2026-08-20T00:00:00Z', harvest_weight: 18.4, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-20T00:00:00Z' },
  { id: 'batch-2',  batch_code: 'HNY-2026-002', hive_id: 'hive-2',  harvest_date: '2026-08-18T00:00:00Z', harvest_weight: 14.2, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-18T00:00:00Z' },
  { id: 'batch-3',  batch_code: 'HNY-2026-003', hive_id: 'hive-3',  harvest_date: '2026-07-15T00:00:00Z', harvest_weight: 10.1, curing_status: 'complete',     quality_status: 'SUSPICIOUS',   blockchain_status: 'PENDING',       qr_status: 'not_generated', created_at: '2026-07-15T00:00:00Z' },
  { id: 'batch-4',  batch_code: 'HNY-2026-004', hive_id: 'hive-4',  harvest_date: '2026-08-25T00:00:00Z', harvest_weight: 22.7, curing_status: 'in_progress',  quality_status: 'pending',      blockchain_status: 'NOT_SUBMITTED', qr_status: 'not_generated', created_at: '2026-08-25T00:00:00Z' },
  { id: 'batch-5',  batch_code: 'HNY-2026-005', hive_id: 'hive-5',  harvest_date: '2026-08-10T00:00:00Z', harvest_weight: 16.8, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-10T00:00:00Z' },
  { id: 'batch-6',  batch_code: 'HNY-2026-006', hive_id: 'hive-6',  harvest_date: '2026-08-22T00:00:00Z', harvest_weight: 8.3,  curing_status: 'complete',     quality_status: 'REQUIRES_LAB_VERIFICATION', blockchain_status: 'PENDING', qr_status: 'not_generated', created_at: '2026-08-22T00:00:00Z' },
  { id: 'batch-7',  batch_code: 'HNY-2026-007', hive_id: 'hive-7',  harvest_date: '2026-08-05T00:00:00Z', harvest_weight: 20.5, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-05T00:00:00Z' },
  { id: 'batch-8',  batch_code: 'HNY-2026-008', hive_id: 'hive-1',  harvest_date: '2026-06-30T00:00:00Z', harvest_weight: 17.6, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-06-30T00:00:00Z' },
  { id: 'batch-9',  batch_code: 'HNY-2026-009', hive_id: 'hive-8',  harvest_date: '2026-08-28T00:00:00Z', harvest_weight: 12.4, curing_status: 'in_progress',  quality_status: 'pending',      blockchain_status: 'NOT_SUBMITTED', qr_status: 'not_generated', created_at: '2026-08-28T00:00:00Z' },
  { id: 'batch-10', batch_code: 'HNY-2026-010', hive_id: 'hive-9',  harvest_date: '2026-08-28T00:00:00Z', harvest_weight: 24.1, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-28T00:00:00Z' },
  { id: 'batch-11', batch_code: 'HNY-2026-011', hive_id: 'hive-2',  harvest_date: '2026-07-20T00:00:00Z', harvest_weight: 15.3, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-07-20T00:00:00Z' },
  { id: 'batch-12', batch_code: 'HNY-2026-012', hive_id: 'hive-10', harvest_date: '2026-08-15T00:00:00Z', harvest_weight: 19.8, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-15T00:00:00Z' },
  { id: 'batch-13', batch_code: 'HNY-2026-013', hive_id: 'hive-12', harvest_date: '2026-08-12T00:00:00Z', harvest_weight: 21.3, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-12T00:00:00Z' },
  { id: 'batch-14', batch_code: 'HNY-2026-014', hive_id: 'hive-4',  harvest_date: '2026-05-10T00:00:00Z', harvest_weight: 23.4, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-05-10T00:00:00Z' },
  { id: 'batch-15', batch_code: 'HNY-2026-015', hive_id: 'hive-1',  harvest_date: '2026-04-25T00:00:00Z', harvest_weight: 16.1, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-04-25T00:00:00Z' },
  { id: 'batch-16', batch_code: 'HNY-2026-016', hive_id: 'hive-7',  harvest_date: '2026-06-05T00:00:00Z', harvest_weight: 18.9, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-06-05T00:00:00Z' },
  { id: 'batch-17', batch_code: 'HNY-2026-017', hive_id: 'hive-10', harvest_date: '2026-06-18T00:00:00Z', harvest_weight: 17.2, curing_status: 'complete',     quality_status: 'SUSPICIOUS',   blockchain_status: 'PENDING',       qr_status: 'not_generated', created_at: '2026-06-18T00:00:00Z' },
  { id: 'batch-18', batch_code: 'HNY-2026-018', hive_id: 'hive-5',  harvest_date: '2026-07-02T00:00:00Z', harvest_weight: 14.7, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-07-02T00:00:00Z' },
  { id: 'batch-19', batch_code: 'HNY-2026-019', hive_id: 'hive-9',  harvest_date: '2026-07-08T00:00:00Z', harvest_weight: 22.0, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-07-08T00:00:00Z' },
  { id: 'batch-20', batch_code: 'HNY-2026-020', hive_id: 'hive-12', harvest_date: '2026-07-14T00:00:00Z', harvest_weight: 20.8, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-07-14T00:00:00Z' },
  { id: 'batch-21', batch_code: 'HNY-2026-021', hive_id: 'hive-3',  harvest_date: '2026-08-31T00:00:00Z', harvest_weight: 11.5, curing_status: 'in_progress',  quality_status: 'pending',      blockchain_status: 'NOT_SUBMITTED', qr_status: 'not_generated', created_at: '2026-08-31T00:00:00Z' },
  { id: 'batch-22', batch_code: 'HNY-2026-022', hive_id: 'hive-4',  harvest_date: '2026-08-29T00:00:00Z', harvest_weight: 19.0, curing_status: 'in_progress',  quality_status: 'pending',      blockchain_status: 'NOT_SUBMITTED', qr_status: 'not_generated', created_at: '2026-08-29T00:00:00Z' },
  { id: 'batch-23', batch_code: 'HNY-2026-023', hive_id: 'hive-2',  harvest_date: '2026-08-30T00:00:00Z', harvest_weight: 13.6, curing_status: 'in_progress',  quality_status: 'pending',      blockchain_status: 'NOT_SUBMITTED', qr_status: 'not_generated', created_at: '2026-08-30T00:00:00Z' },
  { id: 'batch-24', batch_code: 'HNY-2026-024', hive_id: 'hive-10', harvest_date: '2026-08-27T00:00:00Z', harvest_weight: 23.9, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-27T00:00:00Z' },
  { id: 'batch-25', batch_code: 'HNY-2026-025', hive_id: 'hive-12', harvest_date: '2026-08-26T00:00:00Z', harvest_weight: 18.7, curing_status: 'complete',     quality_status: 'NORMAL',       blockchain_status: 'VERIFIED',      qr_status: 'generated',     created_at: '2026-08-26T00:00:00Z' },
]

// ─── Quality Screenings ───────────────────────────────────────────────────────
export const demoBatchScreenings: BatchQualityScreening[] = [
  { id: 'qs-1',  batch_id: 'batch-1',  moisture: 17.2, ph: 3.8, conductivity: 0.42, screening_result: 'NORMAL',       screening_notes: 'All IoT parameters within expected range. Moisture, pH, and conductivity are normal.', created_at: '2026-08-21T10:00:00Z' },
  { id: 'qs-2',  batch_id: 'batch-2',  moisture: 18.0, ph: 3.9, conductivity: 0.40, screening_result: 'NORMAL',       screening_notes: 'Curing pattern consistent with quality honey production.', created_at: '2026-08-19T10:00:00Z' },
  { id: 'qs-3',  batch_id: 'batch-3',  moisture: 21.5, ph: 4.2, conductivity: 0.61, screening_result: 'SUSPICIOUS',   screening_notes: 'Moisture reading (21.5%) is above typical threshold of 20%. Curing pattern shows anomaly in days 8–12.', created_at: '2026-07-16T10:00:00Z' },
  { id: 'qs-4',  batch_id: 'batch-5',  moisture: 16.8, ph: 3.7, conductivity: 0.39, screening_result: 'NORMAL',       screening_notes: 'Excellent curing pattern. Weight and humidity trends are optimal.', created_at: '2026-08-11T10:00:00Z' },
  { id: 'qs-5',  batch_id: 'batch-6',  moisture: 23.1, ph: 4.5, conductivity: 0.78, screening_result: 'REQUIRES_LAB_VERIFICATION', screening_notes: 'Multiple IoT parameters outside normal range. High moisture (23.1%), elevated pH (4.5), and conductivity (0.78). Laboratory verification required before distribution.', created_at: '2026-08-23T10:00:00Z' },
  { id: 'qs-6',  batch_id: 'batch-7',  moisture: 17.5, ph: 3.8, conductivity: 0.41, screening_result: 'NORMAL',       screening_notes: 'All parameters normal. Strong foraging season reflected in weight gain.', created_at: '2026-08-06T10:00:00Z' },
  { id: 'qs-7',  batch_id: 'batch-8',  moisture: 17.8, ph: 3.9, conductivity: 0.43, screening_result: 'NORMAL',       screening_notes: 'Consistent with HIVE-001 historical batches. Good quality indicators.', created_at: '2026-07-01T10:00:00Z' },
  { id: 'qs-8',  batch_id: 'batch-10', moisture: 16.9, ph: 3.7, conductivity: 0.38, screening_result: 'NORMAL',       screening_notes: 'Optimal reading from River Side Apiary batch.', created_at: '2026-08-29T10:00:00Z' },
  { id: 'qs-9',  batch_id: 'batch-11', moisture: 17.3, ph: 3.8, conductivity: 0.41, screening_result: 'NORMAL',       screening_notes: 'Normal parameters throughout curing period.', created_at: '2026-07-21T10:00:00Z' },
  { id: 'qs-10', batch_id: 'batch-12', moisture: 17.0, ph: 3.8, conductivity: 0.40, screening_result: 'NORMAL',       screening_notes: 'River Side Apiary consistently producing quality batches.', created_at: '2026-08-16T10:00:00Z' },
  { id: 'qs-11', batch_id: 'batch-13', moisture: 17.6, ph: 3.9, conductivity: 0.42, screening_result: 'NORMAL',       screening_notes: 'Mu Colony producing reliable quality this season.', created_at: '2026-08-13T10:00:00Z' },
  { id: 'qs-12', batch_id: 'batch-14', moisture: 16.5, ph: 3.7, conductivity: 0.39, screening_result: 'NORMAL',       screening_notes: 'Delta Colony mid-season batch – excellent result.', created_at: '2026-05-11T10:00:00Z' },
]

// ─── Blockchain Records ───────────────────────────────────────────────────────
export const demoBlockchainRecords: BlockchainRecord[] = [
  { id: 'bc-1',  batch_id: 'batch-1',  network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: '8a72f1c3e9b04d5fa3c291e7f8b1d6e92f7a4c81b0e3d5f2a9c7e4b2d8f6a1e3', transaction_hash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456', block_number: 8472341, status: 'VERIFIED', created_at: '2026-08-21T14:00:00Z' },
  { id: 'bc-2',  batch_id: 'batch-2',  network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: '3f91ab21c7d04e8fa2c381e6f9b2d5e83f8a3c70b1e4d6f3a8c8e5b3d9f7a2e4', transaction_hash: '0xdef456abc789012345678901234567890abcdef1234567890abcdef1234567890', block_number: 8471892, status: 'VERIFIED', created_at: '2026-08-19T15:00:00Z' },
  { id: 'bc-3',  batch_id: 'batch-5',  network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'c2e5d8f1a4b7e0c3d6f9a2b5e8c1d4f7a0b3e6c9d2f5a8b1e4c7d0f3a6b9e2c5', transaction_hash: '0x789012abcdef345678901234567890abcdef1234567890abcdef1234567890abc', block_number: 8468912, status: 'VERIFIED', created_at: '2026-08-11T16:00:00Z' },
  { id: 'bc-4',  batch_id: 'batch-7',  network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'e4f7a0b3c6d9f2a5b8e1c4d7f0a3b6e9c2d5f8a1b4e7c0d3f6a9b2e5c8d1f4a7', transaction_hash: '0x012345abcdef6789012345678901234567890abcdef1234567890abcdef123456', block_number: 8462104, status: 'VERIFIED', created_at: '2026-08-06T10:00:00Z' },
  { id: 'bc-5',  batch_id: 'batch-8',  network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'a1b4e7c0d3f6a9b2e5c8d1f4a7b0e3c6d9f2a5b8e1c4d7f0a3b6e9c2d5f8a1b4', transaction_hash: '0x345678abcdef901234567890123456789012abcdef1234567890abcdef12345678', block_number: 8441221, status: 'VERIFIED', created_at: '2026-07-01T11:00:00Z' },
  { id: 'bc-6',  batch_id: 'batch-10', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'b2c5e8a1d4f7b0c3e6a9d2f5b8c1e4a7d0f3b6e9c2d5a8b1e4c7d0f3a6b9e2c5', transaction_hash: '0x678901abcdef234567890123456789012345abcdef1234567890abcdef12345678', block_number: 8479203, status: 'VERIFIED', created_at: '2026-08-29T12:00:00Z' },
  { id: 'bc-7',  batch_id: 'batch-11', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'c3d6a9b2e5f8c1d4a7b0e3f6c9d2a5b8e1c4d7a0b3e6c9d2f5a8b1e4c7d0f3a6', transaction_hash: '0x901234abcdef567890123456789012345678abcdef1234567890abcdef12345678', block_number: 8447819, status: 'VERIFIED', created_at: '2026-07-21T13:00:00Z' },
  { id: 'bc-8',  batch_id: 'batch-12', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'd4e7b0c3f6a9d2e5b8c1d4f7a0b3e6c9d2f5a8b1e4c7d0f3a6b9e2c5d8f1a4b7', transaction_hash: '0xabcdef012345678901234567890123456789012345678901234567890abcdef1234', block_number: 8469334, status: 'VERIFIED', created_at: '2026-08-16T14:00:00Z' },
  { id: 'bc-9',  batch_id: 'batch-13', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'e5f8c1d4a7b0e3f6c9d2e5a8b1e4c7d0f3a6b9e2c5d8f1a4b7e0c3d6a9b2e5f8', transaction_hash: '0x234567abcdef890123456789012345678901234567890abcdef1234567890abcdef', block_number: 8467542, status: 'VERIFIED', created_at: '2026-08-13T15:00:00Z' },
  { id: 'bc-10', batch_id: 'batch-14', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'f6a9d2e5b8c1f4a7d0e3b6c9d2f5a8b1e4c7d0f3a6b9e2c5d8f1a4b7e0c3d6a9', transaction_hash: '0x567890abcdef123456789012345678901234567890abcdef1234567890abcdef1234', block_number: 8391204, status: 'VERIFIED', created_at: '2026-05-11T11:00:00Z' },
  { id: 'bc-11', batch_id: 'batch-15', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'a7b0e3c6d9f2a5b8e1c4d7a0b3e6f9c2d5a8b1e4c7d0f3a6b9e2c5d8f1a4b7e0', transaction_hash: '0x890123abcdef456789012345678901234567890abcdef1234567890abcdef12345678', block_number: 8378921, status: 'VERIFIED', created_at: '2026-04-26T10:00:00Z' },
  { id: 'bc-12', batch_id: 'batch-24', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'b8c1e4a7d0f3b6c9e2d5a8b1e4c7d0f3a6b9e2c5d8f1a4b7e0c3d6a9b2e5f8c1', transaction_hash: '0x123456abcdef789012345678901234567890abcdef1234567890abcdef1234567890', block_number: 8477890, status: 'VERIFIED', created_at: '2026-08-28T10:00:00Z' },
  { id: 'bc-13', batch_id: 'batch-25', network: 'Polygon Amoy Testnet', contract_address: '0x4F3d...A219', data_hash: 'c9d2f5b8e1c4d7a0b3e6f9c2d5a8b1e4c7d0f3a6b9e2c5d8f1a4b7e0c3d6a9b2', transaction_hash: '0x456789abcdef012345678901234567890abcdef1234567890abcdef1234567890abc', block_number: 8475912, status: 'VERIFIED', created_at: '2026-08-27T11:00:00Z' },
]

// ─── Batch Events ─────────────────────────────────────────────────────────────
export const demoBatchEvents: BatchEvent[] = [
  // Batch 1 (HNY-2026-001) - Complete journey
  { id: 'be-1',  batch_id: 'batch-1', event_type: 'NECTAR',            event_time: '2026-07-15T06:00:00Z', description: 'Nectar foraging commenced. Consistent bee activity detected on HIVE-001.',                  metadata: { activity: 85 },                                      created_at: '2026-07-15T06:00:00Z' },
  { id: 'be-2',  batch_id: 'batch-1', event_type: 'CURING',            event_time: '2026-07-20T08:00:00Z', description: 'Honey curing initiated. Humidity reduction patterns observed over 30-day period.',          metadata: { initial_humidity: 72, initial_weight: 42.4 },        created_at: '2026-07-20T08:00:00Z' },
  { id: 'be-3',  batch_id: 'batch-1', event_type: 'DEHYDRATION',       event_time: '2026-08-01T08:00:00Z', description: 'Dehydration phase active. Weight steady as moisture content reduces.',                     metadata: { weight: 43.8, humidity: 68 },                        created_at: '2026-08-01T08:00:00Z' },
  { id: 'be-4',  batch_id: 'batch-1', event_type: 'CAPPING',           event_time: '2026-08-15T10:00:00Z', description: 'Capping detected. Bees sealing honeycomb cells – moisture at optimal level.',              metadata: { estimated_moisture: 17.5 },                          created_at: '2026-08-15T10:00:00Z' },
  { id: 'be-5',  batch_id: 'batch-1', event_type: 'HARVEST',           event_time: '2026-08-20T08:30:00Z', description: 'Harvest completed from HIVE-001. 18.4 kg collected.',                                      metadata: { harvest_weight: 18.4, hive_weight_post: 24.0 },      created_at: '2026-08-20T08:30:00Z' },
  { id: 'be-6',  batch_id: 'batch-1', event_type: 'QUALITY_SCREENING', event_time: '2026-08-21T10:00:00Z', description: 'AI quality screening completed. Moisture 17.2%, pH 3.8, conductivity 0.42. Result: NORMAL.', metadata: { moisture: 17.2, ph: 3.8, conductivity: 0.42 },       created_at: '2026-08-21T10:00:00Z' },
  { id: 'be-7',  batch_id: 'batch-1', event_type: 'BLOCKCHAIN',        event_time: '2026-08-21T14:00:00Z', description: 'Batch fingerprint committed to Polygon Amoy Testnet. Transaction verified.',               metadata: { hash: '8a72f1c3...', block: 8472341 },               created_at: '2026-08-21T14:00:00Z' },
  { id: 'be-8',  batch_id: 'batch-1', event_type: 'QR_VERIFICATION',   event_time: '2026-08-22T09:00:00Z', description: 'QR code generated for consumer verification. Batch is traceable end-to-end.',              metadata: { url: '/verify/HNY-2026-001' },                       created_at: '2026-08-22T09:00:00Z' },
  // Batch 4 – in progress
  { id: 'be-20', batch_id: 'batch-4', event_type: 'NECTAR',            event_time: '2026-08-05T06:00:00Z', description: 'Nectar foraging commenced. High bee activity (92%) observed.',                             metadata: { activity: 92 },                                      created_at: '2026-08-05T06:00:00Z' },
  { id: 'be-21', batch_id: 'batch-4', event_type: 'CURING',            event_time: '2026-08-10T08:00:00Z', description: 'Curing initiated. Weight trending upward.',                                               metadata: { initial_weight: 44.2 },                              created_at: '2026-08-10T08:00:00Z' },
  { id: 'be-22', batch_id: 'batch-4', event_type: 'DEHYDRATION',       event_time: '2026-08-25T08:00:00Z', description: 'Harvest collected. Curing continues in storage.',                                         metadata: { harvest_weight: 22.7 },                              created_at: '2026-08-25T08:00:00Z' },
]

export const demoData = {
  apiaries: demoApiaries,
  hives: demoHives,
  sensorReadings: demoSensorReadings,
  hiveOpenings: demoHiveOpenings,
  aiInsights: demoAIInsights,
  honeyBatches: demoHoneyBatches,
  batchScreenings: demoBatchScreenings,
  blockchainRecords: demoBlockchainRecords,
  batchEvents: demoBatchEvents,
}
