import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Hexagon, Package, CheckCircle, ShieldCheck, AlertTriangle,
  XCircle, TrendingUp, Activity, Thermometer, Droplets,
  Scale, BarChart2, Brain, Clock,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, AreaChart, Area,
} from 'recharts'
import { useDashboardKPIs, useHives, useHoneyBatches, useAIInsights, useLatestReading } from '@/hooks/useData'
import { StatCard, Card, CardHeader, CardTitle, Badge, Skeleton, EmptyState } from '@/components/ui'
import { formatDate, timeAgo, formatTemp, formatHumidity, formatWeight } from '@/lib/utils'
import { demoData } from '@/lib/demoData'
import { useDemoMode } from '@/contexts/DemoModeContext'
import type { Hive } from '@/lib/supabase'

function HiveCard({ hive }: { hive: Hive }) {
  const { data: reading } = useLatestReading(hive.id)
  const navigate = useNavigate()

  const statusVariant = (hive.status === 'healthy' ? 'healthy' : hive.status === 'warning' ? 'warning' : hive.status === 'critical' ? 'critical' : 'inactive') as 'healthy' | 'warning' | 'critical' | 'inactive'

  return (
    <Card
      className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/hives/${hive.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-display font-bold text-gray-900 text-sm">{hive.hive_code}</div>
          <div className="text-xs text-gray-400">{hive.name}</div>
        </div>
        <Badge variant={statusVariant} className="capitalize">{hive.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-honey-50 rounded-lg p-2">
          <div className="text-gray-400 mb-0.5">Temp</div>
          <div className="font-semibold text-honey-700">{reading ? formatTemp(reading.temperature) : '—'}</div>
        </div>
        <div className="bg-sky-50 rounded-lg p-2">
          <div className="text-gray-400 mb-0.5">Humidity</div>
          <div className="font-semibold text-sky-700">{reading ? formatHumidity(reading.humidity) : '—'}</div>
        </div>
        <div className="bg-sage-50 rounded-lg p-2">
          <div className="text-gray-400 mb-0.5">Weight</div>
          <div className="font-semibold text-sage-700">{reading ? formatWeight(reading.weight) : '—'}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <div className="text-gray-400 mb-0.5">Activity</div>
          <div className="font-semibold text-purple-700">{reading ? `${reading.bee_activity}%` : '—'}</div>
        </div>
      </div>
    </Card>
  )
}

function ActivityFeed() {
  const { data: insights } = useAIInsights()
  const recent = insights.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent AI Insights</CardTitle>
        <Brain size={18} className="text-honey-500" />
      </CardHeader>
      <div className="space-y-3">
        {recent.length === 0 && <EmptyState title="No insights yet" />}
        {recent.map(insight => {
          const hive = demoData.hives.find(h => h.id === insight.hive_id)
          const severityColors = {
            success: 'bg-sage-50 border-sage-200 text-sage-700',
            warning: 'bg-amber-50 border-amber-200 text-amber-700',
            critical: 'bg-red-50 border-red-200 text-red-700',
            info:    'bg-sky-50 border-sky-200 text-sky-700',
          }
          return (
            <div key={insight.id} className={`border rounded-xl p-3 ${severityColors[insight.severity]}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs">{hive?.hive_code} · {insight.type.replace('_', ' ').toUpperCase()}</span>
                <span className="text-xs opacity-70">{timeAgo(insight.created_at)}</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function WeightTrendChart() {
  const { isDemo } = useDemoMode()
  const readings = isDemo
    ? demoData.sensorReadings.filter(r => r.hive_id === 'hive-1').slice(-24)
    : []

  const data = readings.map(r => ({
    time: new Date(r.recorded_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
    weight: r.weight,
    temperature: r.temperature,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>HIVE-001 – Live Sensor Trend (24h)</CardTitle>
        <Scale size={18} className="text-honey-500" />
      </CardHeader>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <ReTooltip
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #fde68a' }}
            formatter={(v: unknown) => [`${String(v ?? '')} kg`, 'Weight']}
          />
          <Area type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} fill="url(#weightGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

function RecentBatches() {
  const { data: batches } = useHoneyBatches()
  const navigate = useNavigate()
  const recent = batches.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Batches</CardTitle>
        <Package size={18} className="text-honey-500" />
      </CardHeader>
      <div className="space-y-2">
        {recent.map(batch => (
          <div
            key={batch.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-honey-50 cursor-pointer transition-colors"
            onClick={() => navigate(`/batches/${batch.id}`)}
          >
            <div>
              <div className="font-semibold text-sm text-gray-800">{batch.batch_code}</div>
              <div className="text-xs text-gray-400">{(batch.hive as Hive)?.hive_code} · {formatDate(batch.harvest_date)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{batch.harvest_weight} kg</span>
              <Badge variant={batch.blockchain_status === 'VERIFIED' ? 'verified' : batch.quality_status === 'SUSPICIOUS' ? 'suspicious' : 'warning'}>
                {batch.blockchain_status === 'VERIFIED' ? '✓' : '⏳'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: kpis, loading: kpiLoading } = useDashboardKPIs()
  const { data: hives, loading: hivesLoading } = useHives()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">AI-powered honey traceability & smart hive monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Apiaries"   value={kpis.totalApiaries}   icon={<span>🌿</span>}          color="sage"  loading={kpiLoading} />
        <StatCard label="Total Hives"       value={kpis.totalHives}       icon={<Hexagon size={18} />}    color="honey" loading={kpiLoading} />
        <StatCard label="Healthy Hives"     value={kpis.healthyHives}     icon={<CheckCircle size={18} />} color="sage"  loading={kpiLoading} />
        <StatCard label="Warning Hives"     value={kpis.warningHives}     icon={<AlertTriangle size={18} />} color="honey" loading={kpiLoading} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Critical Hives"   value={kpis.criticalHives}    icon={<XCircle size={18} />}      color="red"   loading={kpiLoading} />
        <StatCard label="Active Batches"   value={kpis.activeBatches}    icon={<Activity size={18} />}     color="honey" loading={kpiLoading} />
        <StatCard label="Harvest Ready"    value={kpis.harvestReady}     icon={<TrendingUp size={18} />}   color="sage"  loading={kpiLoading} />
        <StatCard label="Verified Batches" value={kpis.verifiedBatches}  icon={<ShieldCheck size={18} />}  color="sky"   loading={kpiLoading} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeightTrendChart />
          <RecentBatches />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Hive status grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-gray-800">Hive Overview</h2>
          <span className="text-sm text-gray-400">{hives.length} hives</span>
        </div>
        {hivesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {hives.map(hive => <HiveCard key={hive.id} hive={hive} />)}
          </div>
        )}
      </div>
    </div>
  )
}
