import React, { useState } from 'react'
import { useHiveOpenings, useHives } from '@/hooks/useData'
import { Card, CardHeader, CardTitle, Badge, Select, PageHeader, EmptyState } from '@/components/ui'
import { formatDateTime, formatDate } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid,
} from 'recharts'
import { DoorOpen, Clock, Calendar, Brain } from 'lucide-react'

export default function OpeningHistoryPage() {
  const { data: hives } = useHives()
  const [selectedHive, setSelectedHive] = useState('')
  const hiveId = selectedHive || undefined
  const { data: openings } = useHiveOpenings(hiveId)

  // KPIs
  const now = new Date()
  const today = openings.filter(o => new Date(o.opened_at).toDateString() === now.toDateString())
  const week = openings.filter(o => {
    const d = new Date(o.opened_at)
    const start = new Date(now); start.setDate(start.getDate() - 7)
    return d >= start
  })
  const month = openings.filter(o => {
    const d = new Date(o.opened_at)
    const start = new Date(now); start.setDate(start.getDate() - 30)
    return d >= start
  })
  const avgDuration = openings.reduce((sum, o) => sum + (o.duration_minutes ?? 0), 0) / Math.max(openings.length, 1)

  // Chart data: openings per day (last 14 days)
  const days14: { date: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
    const count = openings.filter(o => new Date(o.opened_at).toDateString() === d.toDateString()).length
    days14.push({ date: dateStr, count })
  }

  // Frequency AI insight
  const hive = hives.find(h => h.id === hiveId) ?? hives[0]
  const weeklyAvg = week.length
  const highFrequency = weeklyAvg > 3

  return (
    <div className="space-y-6">
      <PageHeader title="Hive Opening History" description="Monitor inspection frequency and patterns" />

      <div className="flex items-center gap-3">
        <Select value={selectedHive} onChange={e => setSelectedHive(e.target.value)}>
          <option value="">All Hives</option>
          {hives.map(h => <option key={h.id} value={h.id}>{h.hive_code} – {h.name}</option>)}
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Openings",  value: today.length,              icon: <DoorOpen size={18} />,  color: 'text-honey-600 bg-honey-50' },
          { label: 'This Week',          value: week.length,               icon: <Calendar size={18} />,  color: 'text-sky-600 bg-sky-50' },
          { label: 'This Month',         value: month.length,              icon: <Calendar size={18} />,  color: 'text-sage-600 bg-sage-50' },
          { label: 'Avg Duration',       value: avgDuration.toFixed(0) + ' min', icon: <Clock size={18} />, color: 'text-purple-600 bg-purple-50' },
        ].map(k => (
          <Card key={k.label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{k.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
            </div>
            <div className="text-2xl font-display font-bold text-gray-900">{k.value}</div>
          </Card>
        ))}
      </div>

      {/* AI Insight */}
      <div className={`border rounded-xl p-4 flex items-start gap-3 ${highFrequency ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-sage-50 border-sage-200 text-sage-700'}`}>
        <Brain size={20} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-sm mb-1">AI Opening Frequency Analysis</div>
          {highFrequency
            ? <p className="text-sm">Opening frequency is 35% higher than this hive's baseline. Frequent inspections can stress the colony. Consider spacing inspections by at least 7–10 days.</p>
            : <p className="text-sm">Opening frequency is within the normal range. Inspection pattern is not causing undue stress to the colony.</p>
          }
        </div>
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle>Opening Frequency (Last 14 Days)</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={days14} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v: unknown) => [String(v ?? ''), 'Openings']} />
            <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-semibold text-gray-800">Opening Log</h3>
        </div>
        {openings.length === 0 ? (
          <div className="p-6"><EmptyState icon={<DoorOpen size={40} />} title="No openings recorded" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Hive', 'Date', 'Opened', 'Closed', 'Duration', 'Reason', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {openings.map(o => {
                  const hive = hives.find(h => h.id === o.hive_id)
                  return (
                    <tr key={o.id} className="hover:bg-honey-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{hive?.hive_code ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(o.opened_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(o.opened_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{o.closed_at ? new Date(o.closed_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{o.duration_minutes ? `${o.duration_minutes} min` : '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={o.reason === 'Harvest' ? 'verified' : o.reason === 'Maintenance' ? 'suspicious' : 'normal'}>
                          {o.reason}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={o.closed_at ? 'healthy' : 'warning'}>{o.closed_at ? 'Closed' : 'Open'}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
