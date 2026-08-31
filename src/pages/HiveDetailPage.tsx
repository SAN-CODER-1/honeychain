import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Thermometer, Droplets, Scale, Activity, Crown, Package,
  Brain, DoorOpen, Eye, BarChart2, Hexagon, MapPin, Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid,
} from 'recharts'
import { useHive, useLatestReading, useSensorReadings, useHoneyBatches, useAIInsights, useHiveOpenings, useRealtimeSensor } from '@/hooks/useData'
import { Card, CardHeader, CardTitle, Badge, Button, Skeleton, EmptyState, StatusDot, PageHeader } from '@/components/ui'
import { formatTemp, formatHumidity, formatWeight, formatDate, timeAgo } from '@/lib/utils'
import type { SensorReading } from '@/lib/supabase'

const TIME_FILTERS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
]

function SensorChart({ hiveId }: { hiveId: string }) {
  const [days, setDays] = useState(7)
  const { data: readings } = useSensorReadings(hiveId, days)

  const chartData = readings.map(r => ({
    time: new Date(r.recorded_at).toLocaleString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    weight: r.weight,
    bee_activity: r.bee_activity,
  }))

  const metricOptions = [
    { key: 'temperature', label: 'Temperature (°C)', color: '#f59e0b', unit: '°C' },
    { key: 'humidity',    label: 'Humidity (%)',     color: '#0ea5e9', unit: '%' },
    { key: 'weight',      label: 'Weight (kg)',       color: '#22c55e', unit: ' kg' },
    { key: 'bee_activity',label: 'Bee Activity (%)', color: '#8b5cf6', unit: '%' },
  ]
  const [metric, setMetric] = useState(metricOptions[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor History</CardTitle>
        <div className="flex gap-2">
          {TIME_FILTERS.map(f => (
            <button
              key={f.days}
              onClick={() => setDays(f.days)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${days === f.days ? 'bg-honey-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-honey-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <div className="flex gap-2 mb-4 flex-wrap">
        {metricOptions.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${metric.key === m.key ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={metric.key === m.key ? { backgroundColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>
      {readings.length === 0 ? (
        <EmptyState title="No sensor readings" description="No data available for this time range" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 8)} />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <ReTooltip
              contentStyle={{ fontSize: 12, borderRadius: 12 }}
              formatter={(v: unknown) => [`${String(v ?? '')}${metric.unit}`, metric.label]}
            />
            <Area
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={2}
              fill="url(#chartGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

function QueenExcluder() {
  const [frame, setFrame] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 60), 100)
    return () => clearInterval(t)
  }, [])

  const bees = [
    { x: Math.sin(frame * 0.1) * 40 + 50, y: Math.cos(frame * 0.08) * 20 + 30 },
    { x: Math.cos(frame * 0.12) * 30 + 60, y: Math.sin(frame * 0.09) * 25 + 50 },
    { x: Math.sin(frame * 0.07 + 1) * 35 + 40, y: Math.cos(frame * 0.11 + 2) * 18 + 40 },
    { x: Math.cos(frame * 0.09 + 2) * 45 + 55, y: Math.sin(frame * 0.13) * 22 + 60 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Queen Excluder</CardTitle>
        <Crown size={18} className="text-honey-500" />
      </CardHeader>
      <div className="relative bg-honey-50 rounded-xl overflow-hidden h-40 mb-4">
        <svg width="100%" height="100%" viewBox="0 0 120 100">
          {/* Excluder grid */}
          {[...Array(8)].map((_, i) => (
            <line key={i} x1={10 + i * 14} y1="35" x2={10 + i * 14} y2="65" stroke="#fcd34d" strokeWidth="2" strokeDasharray="2 3" />
          ))}
          <rect x="5" y="32" width="110" height="5" fill="#f59e0b" rx="2" />
          <rect x="5" y="63" width="110" height="5" fill="#f59e0b" rx="2" />
          <text x="60" y="22" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">QUEEN EXCLUDER</text>
          <text x="60" y="85" textAnchor="middle" fontSize="7" fill="#6b7280">Brood Box</text>
          <text x="60" y="12" textAnchor="middle" fontSize="7" fill="#6b7280">Honey Super</text>
          {/* Animated worker bees */}
          {bees.map((bee, i) => (
            <g key={i} transform={`translate(${bee.x}, ${bee.y})`}>
              <ellipse rx="5" ry="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
              <ellipse rx="3.5" ry="2" transform="translate(-1,0)" fill="#fef3c7" />
              <ellipse cx="-3" cy="-2" rx="2.5" ry="1.5" fill="rgba(186,230,253,0.7)" transform="rotate(-30)" />
              <ellipse cx="-3" cy="2" rx="2.5" ry="1.5" fill="rgba(186,230,253,0.7)" transform="rotate(30)" />
            </g>
          ))}
          {/* Queen indicator */}
          <ellipse cx="60" cy="50" rx="7" ry="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <text x="60" y="53" textAnchor="middle" fontSize="6" fill="white">♛</text>
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-sage-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-1">Worker Traffic</div>
          <div className="font-semibold text-sage-700">Normal</div>
        </div>
        <div className="bg-honey-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-1">Queen Status</div>
          <div className="font-semibold text-honey-700">✓ Detected</div>
        </div>
        <div className="bg-sky-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-1">Congestion</div>
          <div className="font-semibold text-sky-700">Low</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-1">Movement</div>
          <div className="font-semibold text-purple-700">Active</div>
        </div>
      </div>
    </Card>
  )
}

export default function HiveDetailPage() {
  const { hiveId } = useParams<{ hiveId: string }>()
  const navigate = useNavigate()
  const { data: hive, loading: hiveLoading } = useHive(hiveId)
  const { data: reading, loading: readingLoading } = useLatestReading(hiveId)
  const { data: batches } = useHoneyBatches(hiveId)
  const { data: insights } = useAIInsights(hiveId)
  const { data: openings } = useHiveOpenings(hiveId)

  const [liveReading, setLiveReading] = useState<SensorReading | null>(null)
  const handleRealtimeUpdate = useCallback((r: SensorReading) => setLiveReading(r), [])
  useRealtimeSensor(hiveId, handleRealtimeUpdate)

  const currentReading = liveReading ?? reading

  if (hiveLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-24" />
      <div className="grid grid-cols-4 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
    </div>
  )

  if (!hive) return (
    <EmptyState icon={<Hexagon size={48} />} title="Hive not found" description="This hive doesn't exist or has been removed" />
  )

  const statusVariant = (hive.status === 'healthy' ? 'healthy' : hive.status === 'warning' ? 'warning' : hive.status === 'critical' ? 'critical' : 'inactive') as 'healthy' | 'warning' | 'critical' | 'inactive'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/hives')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-honey-600 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Hives
        </button>
        <PageHeader
          title={hive.hive_code}
          description={`${hive.name} · ${hive.apiary?.name}`}
          badge={<Badge variant={statusVariant} className="capitalize">{hive.status}</Badge>}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/batches?hive=${hive.id}`)}>
                <Package size={14} /> View Batches
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/analytics/sensors')}>
                <BarChart2 size={14} /> Analytics
              </Button>
            </>
          }
        />
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={14} />{hive.location}</span>
          <span className="flex items-center gap-1"><Calendar size={14} />Installed {formatDate(hive.installed_at)}</span>
          {liveReading && <span className="flex items-center gap-1 text-sage-600 font-medium animate-pulse">⚡ Live data</span>}
        </div>
      </div>

      {/* Current readings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {readingLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : currentReading ? (
          <>
            <Card className="text-center">
              <div className="w-10 h-10 bg-honey-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Thermometer size={20} className="text-honey-600" /></div>
              <div className="text-2xl font-display font-bold text-honey-700">{formatTemp(currentReading.temperature)}</div>
              <div className="text-xs text-gray-400 mt-1">Temperature</div>
            </Card>
            <Card className="text-center">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Droplets size={20} className="text-sky-600" /></div>
              <div className="text-2xl font-display font-bold text-sky-700">{formatHumidity(currentReading.humidity)}</div>
              <div className="text-xs text-gray-400 mt-1">Humidity</div>
            </Card>
            <Card className="text-center">
              <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Scale size={20} className="text-sage-600" /></div>
              <div className="text-2xl font-display font-bold text-sage-700">{formatWeight(currentReading.weight)}</div>
              <div className="text-xs text-gray-400 mt-1">Hive Weight</div>
            </Card>
            <Card className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Activity size={20} className="text-purple-600" /></div>
              <div className="text-2xl font-display font-bold text-purple-700">{currentReading.bee_activity}%</div>
              <div className="text-xs text-gray-400 mt-1">Bee Activity</div>
            </Card>
          </>
        ) : (
          <div className="col-span-4">
            <EmptyState title="No sensor readings available" description="No sensor data has been recorded for this hive yet." />
          </div>
        )}
      </div>

      {/* Charts & Queen Excluder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SensorChart hiveId={hive.id} />
        </div>
        <div>
          <QueenExcluder />
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <Brain size={18} className="text-honey-500" />
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map(i => {
              const sev = { success: 'bg-sage-50 border-sage-200 text-sage-700', warning: 'bg-amber-50 border-amber-200 text-amber-700', critical: 'bg-red-50 border-red-200 text-red-700', info: 'bg-sky-50 border-sky-200 text-sky-700' }
              return (
                <div key={i.id} className={`border rounded-xl p-4 ${sev[i.severity]}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide opacity-70">{i.type.replace('_', ' ')}</span>
                    <span className="text-xs opacity-60">{Math.round(i.confidence * 100)}% confidence</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{i.result}</div>
                  <p className="text-xs opacity-80">{i.message}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recent openings */}
      {openings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Openings</CardTitle>
            <DoorOpen size={18} className="text-honey-500" />
          </CardHeader>
          <div className="space-y-2">
            {openings.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-gray-800">{o.reason}</span>
                  <span className="text-gray-400 ml-2 text-xs">{timeAgo(o.opened_at)}</span>
                </div>
                <span className="text-gray-500 text-xs">{o.duration_minutes ? `${o.duration_minutes} min` : 'Open'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Honey Batches ({batches.length})</CardTitle>
          <Package size={18} className="text-honey-500" />
        </CardHeader>
        {batches.length === 0 ? (
          <EmptyState title="No batches for this hive" />
        ) : (
          <div className="space-y-2">
            {batches.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-honey-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/batches/${b.id}`)}
              >
                <div>
                  <span className="font-semibold text-gray-800">{b.batch_code}</span>
                  <span className="text-gray-400 ml-2 text-xs">{formatDate(b.harvest_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{b.harvest_weight} kg</span>
                  <Badge variant={b.blockchain_status === 'VERIFIED' ? 'verified' : b.quality_status === 'SUSPICIOUS' ? 'suspicious' : 'warning'}>
                    {b.blockchain_status === 'VERIFIED' ? '✓ Verified' : b.curing_status === 'in_progress' ? 'Curing' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
