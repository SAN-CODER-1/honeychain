import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      apiaries: {
        Row: Apiary
        Insert: Omit<Apiary, 'id' | 'created_at'>
        Update: Partial<Omit<Apiary, 'id'>>
      }
      hives: {
        Row: Hive
        Insert: Omit<Hive, 'id' | 'created_at'>
        Update: Partial<Omit<Hive, 'id'>>
      }
      sensor_readings: {
        Row: SensorReading
        Insert: Omit<SensorReading, 'id'>
        Update: Partial<Omit<SensorReading, 'id'>>
      }
      hive_openings: {
        Row: HiveOpening
        Insert: Omit<HiveOpening, 'id' | 'created_at'>
        Update: Partial<Omit<HiveOpening, 'id'>>
      }
      ai_insights: {
        Row: AIInsight
        Insert: Omit<AIInsight, 'id' | 'created_at'>
        Update: Partial<Omit<AIInsight, 'id'>>
      }
      honey_batches: {
        Row: HoneyBatch
        Insert: Omit<HoneyBatch, 'id' | 'created_at'>
        Update: Partial<Omit<HoneyBatch, 'id'>>
      }
      batch_quality_screenings: {
        Row: BatchQualityScreening
        Insert: Omit<BatchQualityScreening, 'id' | 'created_at'>
        Update: Partial<Omit<BatchQualityScreening, 'id'>>
      }
      blockchain_records: {
        Row: BlockchainRecord
        Insert: Omit<BlockchainRecord, 'id' | 'created_at'>
        Update: Partial<Omit<BlockchainRecord, 'id'>>
      }
      batch_events: {
        Row: BatchEvent
        Insert: Omit<BatchEvent, 'id' | 'created_at'>
        Update: Partial<Omit<BatchEvent, 'id'>>
      }
      camera_images: {
        Row: CameraImage
        Insert: Omit<CameraImage, 'id'>
        Update: Partial<Omit<CameraImage, 'id'>>
      }
    }
  }
}

// Domain types
export interface Apiary {
  id: string
  name: string
  location: string
  description: string
  created_at: string
}

export interface Hive {
  id: string
  hive_code: string
  apiary_id: string
  name: string
  location: string
  status: 'healthy' | 'warning' | 'critical' | 'inactive'
  installed_at: string
  created_at: string
  apiary?: Apiary
}

export interface SensorReading {
  id: string
  hive_id: string
  temperature: number
  humidity: number
  weight: number
  bee_activity: number
  recorded_at: string
}

export interface HiveOpening {
  id: string
  hive_id: string
  opened_at: string
  closed_at: string | null
  duration_minutes: number | null
  reason: 'Routine Inspection' | 'Queen Check' | 'Harvest' | 'Maintenance' | 'Other'
  created_at: string
  hive?: Hive
}

export interface AIInsight {
  id: string
  hive_id: string
  type: 'queen_detection' | 'activity' | 'curing' | 'opening_frequency' | 'productivity'
  result: string
  confidence: number
  message: string
  severity: 'info' | 'warning' | 'critical' | 'success'
  created_at: string
  hive?: Hive
}

export interface HoneyBatch {
  id: string
  batch_code: string
  hive_id: string
  harvest_date: string
  harvest_weight: number
  curing_status: 'in_progress' | 'complete' | 'pending'
  quality_status: 'NORMAL' | 'SUSPICIOUS' | 'REQUIRES_LAB_VERIFICATION' | 'pending'
  blockchain_status: 'VERIFIED' | 'PENDING' | 'NOT_SUBMITTED'
  qr_status: 'generated' | 'not_generated'
  created_at: string
  hive?: Hive
}

export interface BatchQualityScreening {
  id: string
  batch_id: string
  moisture: number
  ph: number
  conductivity: number
  screening_result: 'NORMAL' | 'SUSPICIOUS' | 'REQUIRES_LAB_VERIFICATION'
  screening_notes: string
  created_at: string
}

export interface BlockchainRecord {
  id: string
  batch_id: string
  network: string
  contract_address: string
  data_hash: string
  transaction_hash: string
  block_number: number
  status: 'VERIFIED' | 'PENDING' | 'FAILED'
  created_at: string
  batch?: HoneyBatch
}

export interface BatchEvent {
  id: string
  batch_id: string
  event_type: 'NECTAR' | 'CURING' | 'DEHYDRATION' | 'CAPPING' | 'HARVEST' | 'QUALITY_SCREENING' | 'BLOCKCHAIN' | 'QR_VERIFICATION'
  event_time: string
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface CameraImage {
  id: string
  hive_id: string
  storage_path: string
  captured_at: string
}
