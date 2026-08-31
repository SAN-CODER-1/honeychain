import React, { useState } from 'react'
import { useHives, useSensorReadings } from '@/hooks/useData'
import { Card, CardHeader, CardTitle, Select, PageHeader, EmptyState } from '@/components/ui'
import { formatTemp, formatHumidity, formatWeight } from '@/lib/utils'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip as ReTooltip, CartesianGrid, Legend,
} from 'recharts'
import { BarChart2, Thermometer, Droplets, Scale, Activity } from 'lucide-react'

const TIME_FILTERS = [
  { label: '24 Hours', days: 1 },
  { label: '7 Days',   days: 7 },
  { label: '30 Days',  days: 30 },
]

function SensorPanel({ hiveId, days }: { hiveId: string; days: number }) {
  const { data: readings } = useSensorReadings(hiveId, days)

  if (readings.length === 0) return <EmptyState title="No sensor data" description="No readings available for this hive and time range" />

  const data = readings.map(r => ({
    time: days === 1
      ? new Date(r.recorded_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
      : new Date(r.recorded_at).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
    temperature: r.temperature,
    humidity: r.humidity,
    weight: r.weight,
    activity: r.bee_activity,
  }))

  const stats = (key: keyof typeof data[0]) => {
    const vals = data.map(d => d[key] as number)
    return {
      current: vals[vals.length - 1]?.toFixed(1) ?? '—',
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
    }
  }

  const interval = Math.max(1, Math.floor(data.length / 12))

  return (
    <div className="space-y-6">
      {/* Temp + Humidity combined */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature & Humidity</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Temperature', key: 'temperature', unit: '°C', color: 'honey', ...stats('temperature') },
            { label: 'Humidity',    key: 'humidity',    unit: '%',  color: 'sky',   ...stats('humidity') },
          ].map(m => (
            <div key={m.key} className={`bg-${m.color}-50 rounded-xl p-4`}>
              <div className="text-xs text-gray-400 mb-2">{m.label}</div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[['Current', m.current], ['Avg', m.avg], ['Min', m.min], ['Max', m.max]].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-gray-400">{l}</div>
                    <div className="font-bold text-gray-800">{v}{m.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={interval} />
            <YAxis yAxisId="temp" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
            <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Weight */}
      <Card>
        <CardHeader>
          <CardTitle>Hive Weight</CardTitle>
          <div className="text-sm text-sage-700 font-semibold">{stats('weight').current} kg (current)</div>
        </CardHeader>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[['Current', stats('weight').current + ' kg'], ['Average', stats('weight').avg + ' kg'], ['Min', stats('weight').min + ' kg'], ['Max', stats('weight').max + ' kg']].map(([l, v]) => (
            <div key={l} className="bg-sage-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400">{l}</div>
              <div className="font-bold text-sage-700 text-sm">{v}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="weightGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={interval} />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [`${String(v ?? '')} kg`, 'Weight']} />
            <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} fill="url(#weightGrad2)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Bee Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Bee Activity</CardTitle>
          <div className="text-sm text-purple-700 font-semibold">{stats('activity').current}% (current)</div>
        </CardHeader>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={interval} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [`${String(v ?? '')}%`, 'Activity']} />
            <Area type="monotone" dataKey="activity" stroke="#8b5cf6" strokeWidth={2} fill="url(#actGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default function SensorAnalyticsPage() {
  const { data: hives } = useHives()
  const [selectedHive, setSelectedHive] = useState<string>('')
  const [days, setDays] = useState(7)

  const hiveId = selectedHive || (hives[0]?.id ?? '')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sensor Analytics"
        description="Interactive sensor data visualization for all hives"
      />

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={hiveId} onChange={e => setSelectedHive(e.target.value)}>
          {hives.map(h => <option key={h.id} value={h.id}>{h.hive_code} – {h.name}</option>)}
        </Select>
        <div className="flex gap-1">
          {TIME_FILTERS.map(f => (
            <button
              key={f.days}
              onClick={() => setDays(f.days)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${days === f.days ? 'bg-honey-500 text-white border-honey-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-honey-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {hiveId ? <SensorPanel hiveId={hiveId} days={days} /> : <EmptyState title="No hives available" />}
    </div>
  )
}
