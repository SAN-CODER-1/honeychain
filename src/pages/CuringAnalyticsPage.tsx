import React, { useState } from 'react'
import { useHives, useHoneyBatches, useSensorReadings } from '@/hooks/useData'
import { Card, CardHeader, CardTitle, Badge, Select, PageHeader, EmptyState } from '@/components/ui'
import { demoData } from '@/lib/demoData'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid,
} from 'recharts'
import { Droplets, Scale, Thermometer, Brain } from 'lucide-react'

function CuringProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-honey-400 to-honey-600 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function CuringAnalyticsPage() {
  const { data: hives } = useHives()
  const { data: batches } = useHoneyBatches()
  const [selectedHive, setSelectedHive] = useState('')
  const hiveId = selectedHive || hives[0]?.id || 'hive-1'
  const { data: readings } = useSensorReadings(hiveId, 30)

  const hive = hives.find(h => h.id === hiveId)
  const hiveBatches = batches.filter(b => b.hive_id === hiveId)
  const activeBatch = hiveBatches.find(b => b.curing_status === 'in_progress') ?? hiveBatches[0]

  // Get AI insight for curing
  const curingInsight = demoData.aiInsights.find(i => i.hive_id === hiveId && i.type === 'curing')

  // Compute curing progress from humidity trend
  const humidity = readings.map(r => r.humidity)
  const initialHum = humidity[0] ?? 75
  const currentHum = humidity[humidity.length - 1] ?? 68
  const targetHum = 60
  const curingPct = Math.min(Math.max(((initialHum - currentHum) / (initialHum - targetHum)) * 100, 0), 100)

  const data = readings.slice(-30).map(r => ({
    time: new Date(r.recorded_at).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
    humidity: r.humidity,
    weight: r.weight,
    temperature: r.temperature,
  }))

  const resultColor = (curingInsight?.result === 'Normal' || curingInsight?.result === 'Above Average')
    ? 'text-sage-600 bg-sage-50 border-sage-200'
    : curingInsight?.result?.includes('Anomaly') ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-sky-600 bg-sky-50 border-sky-200'

  return (
    <div className="space-y-6">
      <PageHeader title="Curing Analytics" description="Track honey curing progress and weight trends" />

      <div className="flex items-center gap-3">
        <Select value={hiveId} onChange={e => setSelectedHive(e.target.value)}>
          {hives.map(h => <option key={h.id} value={h.id}>{h.hive_code} – {h.name}</option>)}
        </Select>
        {activeBatch && (
          <Badge variant="warning">{activeBatch.batch_code} – Curing</Badge>
        )}
      </div>

      {/* Curing progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Curing Progress</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="text-3xl font-display font-bold text-honey-600">{curingPct.toFixed(0)}%</div>
            <CuringProgressBar value={curingPct} />
            <div className="text-xs text-gray-400">Based on humidity reduction from {initialHum.toFixed(0)}% → {targetHum}% target</div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Current Moisture</CardTitle></CardHeader>
          <div className="space-y-2">
            <div className="text-3xl font-display font-bold text-sky-600">{currentHum.toFixed(0)}%</div>
            <div className="text-xs text-gray-400">Hive humidity</div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${currentHum <= 68 ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'}`}>
              {currentHum <= 68 ? '✓ On track' : '⚠ Monitor closely'}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capping Status</CardTitle></CardHeader>
          <div className="space-y-2">
            <div className="text-2xl font-display font-bold text-sage-600">
              {curingPct >= 80 ? '✓ Partial' : '⏳ Progressing'}
            </div>
            <div className="text-xs text-gray-400">Estimated harvest in {curingPct >= 90 ? '3–5' : curingPct >= 70 ? '7–10' : '14+'} days</div>
          </div>
        </Card>
      </div>

      {/* AI Insight */}
      {curingInsight && (
        <div className={`border rounded-xl p-4 flex items-start gap-3 ${resultColor}`}>
          <Brain size={20} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm mb-1">AI Curing Analysis · {Math.round(curingInsight.confidence * 100)}% confidence</div>
            <p className="text-sm">{curingInsight.message}</p>
            <div className="mt-2">
              <Badge variant={curingInsight.severity === 'success' ? 'normal' : curingInsight.severity === 'warning' ? 'suspicious' : 'lab'}>
                {curingInsight.result === 'Normal' ? 'NORMAL' : curingInsight.result === 'Possible Anomaly' ? 'POSSIBLE ANOMALY' : 'REQUIRES VERIFICATION'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Humidity Trend (30 days)</CardTitle><Droplets size={18} className="text-sky-500" /></CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="humGradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} domain={[55, 80]} />
              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [`${String(v ?? '')}%`, 'Humidity']} />
              <Area type="monotone" dataKey="humidity" stroke="#0ea5e9" strokeWidth={2} fill="url(#humGradC)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Weight Trend (30 days)</CardTitle><Scale size={18} className="text-sage-500" /></CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="wGradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [`${String(v ?? '')} kg`, 'Weight']} />
              <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} fill="url(#wGradC)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Temperature Trend (30 days)</CardTitle><Thermometer size={18} className="text-honey-500" /></CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="tGradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [`${String(v ?? '')}°C`, 'Temperature']} />
              <Area type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} fill="url(#tGradC)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Batch list */}
        <Card>
          <CardHeader><CardTitle>Batches from This Hive</CardTitle></CardHeader>
          {hiveBatches.length === 0 ? (
            <EmptyState title="No batches" />
          ) : (
            <div className="space-y-2">
              {hiveBatches.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="font-semibold text-gray-800">{b.batch_code}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-500">{b.harvest_weight} kg</span>
                    <Badge variant={b.curing_status === 'complete' ? 'verified' : 'warning'}>
                      {b.curing_status === 'complete' ? 'Complete' : 'Curing'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>⚠ Note:</strong> Curing analytics are derived from IoT sensor data (humidity, weight, temperature). They do not represent direct moisture measurement of extracted honey. Laboratory verification confirms final moisture content.
      </div>
    </div>
  )
}
