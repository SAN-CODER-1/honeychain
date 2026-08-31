import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Hexagon, Thermometer, Droplets, Scale, Activity } from 'lucide-react'
import { useHives, useLatestReading } from '@/hooks/useData'
import { Card, Badge, Button, Input, Select, PageHeader, Skeleton, EmptyState, StatusDot } from '@/components/ui'
import { formatTemp, formatHumidity, formatWeight, timeAgo } from '@/lib/utils'
import type { Hive } from '@/lib/supabase'

function HiveSensorRow({ hiveId }: { hiveId: string }) {
  const { data: reading } = useLatestReading(hiveId)
  if (!reading) return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {[...Array(4)].map((_, i) => <div key={i} className="text-center p-2 bg-gray-50 rounded-lg text-xs text-gray-400">—</div>)}
    </div>
  )
  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      <div className="text-center p-2 bg-honey-50 rounded-lg">
        <div className="text-xs text-gray-400">Temp</div>
        <div className="text-sm font-bold text-honey-700">{formatTemp(reading.temperature)}</div>
      </div>
      <div className="text-center p-2 bg-sky-50 rounded-lg">
        <div className="text-xs text-gray-400">Hum</div>
        <div className="text-sm font-bold text-sky-700">{formatHumidity(reading.humidity)}</div>
      </div>
      <div className="text-center p-2 bg-sage-50 rounded-lg">
        <div className="text-xs text-gray-400">Wt</div>
        <div className="text-sm font-bold text-sage-700">{formatWeight(reading.weight)}</div>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded-lg">
        <div className="text-xs text-gray-400">Act</div>
        <div className="text-sm font-bold text-purple-700">{reading.bee_activity}%</div>
      </div>
    </div>
  )
}

function HiveCard({ hive }: { hive: Hive & { apiary?: { name: string } } }) {
  const navigate = useNavigate()
  const statusVariant = (hive.status === 'healthy' ? 'healthy' : hive.status === 'warning' ? 'warning' : hive.status === 'critical' ? 'critical' : 'inactive') as 'healthy' | 'warning' | 'critical' | 'inactive'

  return (
    <Card
      className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/hives/${hive.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-honey-100 rounded-xl flex items-center justify-center shrink-0">
            <Hexagon size={20} className="text-honey-600" />
          </div>
          <div>
            <div className="font-display font-bold text-gray-900">{hive.hive_code}</div>
            <div className="text-sm text-gray-500">{hive.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{hive.apiary?.name}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant} className="capitalize">{hive.status}</Badge>
          <StatusDot status={hive.status} />
        </div>
      </div>
      <HiveSensorRow hiveId={hive.id} />
      <div className="mt-3 text-xs text-gray-400">{hive.location}</div>
    </Card>
  )
}

export default function HivesPage() {
  const { data: hives, loading } = useHives()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('code')

  const filtered = hives
    .filter(h => {
      const q = search.toLowerCase()
      const matchSearch = !q || h.hive_code.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || h.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'code') return a.hive_code.localeCompare(b.hive_code)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hives"
        description={`${hives.length} hives across all apiaries`}
        actions={
          <Button size="sm">
            <Plus size={16} /> Add Hive
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hives…"
            className="pl-9 w-56"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="code">Sort: Code</option>
          <option value="status">Sort: Status</option>
        </Select>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} hives</span>
      </div>

      {/* Status summary */}
      <div className="flex gap-3 flex-wrap">
        {['healthy', 'warning', 'critical', 'inactive'].map(status => {
          const count = hives.filter(h => h.status === status).length
          const variant = (status === 'healthy' ? 'healthy' : status === 'warning' ? 'warning' : status === 'critical' ? 'critical' : 'inactive') as 'healthy' | 'warning' | 'critical' | 'inactive'
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${statusFilter === status ? 'ring-2 ring-offset-1 ring-honey-400' : ''}`}
            >
              <Badge variant={variant}>{count} {status}</Badge>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Hexagon size={48} />} title="No hives found" description="Try adjusting your search or filters" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(hive => <HiveCard key={hive.id} hive={hive as Hive & { apiary?: { name: string } }} />)}
        </div>
      )}
    </div>
  )
}
