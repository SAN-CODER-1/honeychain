import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Search, Filter, QrCode, ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import { useHoneyBatches } from '@/hooks/useData'
import { Card, Badge, Button, Input, Select, PageHeader, Skeleton, EmptyState } from '@/components/ui'
import { formatDate, formatWeight } from '@/lib/utils'
import type { HoneyBatch, Hive } from '@/lib/supabase'

type FilterType = 'all' | 'normal' | 'suspicious' | 'lab' | 'verified' | 'curing'

function getBatchBadge(batch: HoneyBatch) {
  if (batch.blockchain_status === 'VERIFIED') return <Badge variant="verified">✓ Verified</Badge>
  if (batch.quality_status === 'SUSPICIOUS') return <Badge variant="suspicious">⚠ Suspicious</Badge>
  if (batch.quality_status === 'REQUIRES_LAB_VERIFICATION') return <Badge variant="lab">🔬 Lab Required</Badge>
  if (batch.curing_status === 'in_progress') return <Badge variant="warning">⏳ Curing</Badge>
  return <Badge variant="default">Pending</Badge>
}

function BatchRow({ batch }: { batch: HoneyBatch }) {
  const navigate = useNavigate()
  const hive = batch.hive as Hive & { apiary?: { name: string } }

  return (
    <tr
      className="hover:bg-honey-50 cursor-pointer transition-colors"
      onClick={() => navigate(`/batches/${batch.id}`)}
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900 text-sm">{batch.batch_code}</div>
        <div className="text-xs text-gray-400">{formatDate(batch.created_at)}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-700">{hive?.hive_code}</div>
        <div className="text-xs text-gray-400">{hive?.name}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{hive?.apiary?.name}</td>
      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatDate(batch.harvest_date)}</td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatWeight(batch.harvest_weight)}</td>
      <td className="px-4 py-3">
        <Badge variant={batch.curing_status === 'complete' ? 'verified' : batch.curing_status === 'in_progress' ? 'warning' : 'default'}>
          {batch.curing_status === 'complete' ? 'Complete' : batch.curing_status === 'in_progress' ? 'In Progress' : 'Pending'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={
          batch.quality_status === 'NORMAL' ? 'normal' :
          batch.quality_status === 'SUSPICIOUS' ? 'suspicious' :
          batch.quality_status === 'REQUIRES_LAB_VERIFICATION' ? 'lab' : 'default'
        }>
          {batch.quality_status === 'NORMAL' ? '✓ Normal' :
           batch.quality_status === 'SUSPICIOUS' ? '⚠ Suspicious' :
           batch.quality_status === 'REQUIRES_LAB_VERIFICATION' ? '🔬 Lab' : 'Pending'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={batch.blockchain_status === 'VERIFIED' ? 'verified' : batch.blockchain_status === 'PENDING' ? 'warning' : 'default'}>
          {batch.blockchain_status === 'VERIFIED' ? '✓ Verified' : batch.blockchain_status === 'PENDING' ? 'Pending' : 'Not Submitted'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={batch.qr_status === 'generated' ? 'normal' : 'default'}>
          {batch.qr_status === 'generated' ? <><QrCode size={10} /> Ready</> : 'Not Generated'}
        </Badge>
      </td>
    </tr>
  )
}

const FILTER_TABS: { label: string; value: FilterType; icon: React.ReactNode }[] = [
  { label: 'All', value: 'all', icon: <Package size={14} /> },
  { label: 'Verified', value: 'verified', icon: <ShieldCheck size={14} /> },
  { label: 'Curing', value: 'curing', icon: <Clock size={14} /> },
  { label: 'Normal', value: 'normal', icon: <CheckCircle size={14} /> },
  { label: 'Suspicious', value: 'suspicious', icon: <Filter size={14} /> },
]

export default function BatchesPage() {
  const { data: batches, loading } = useHoneyBatches()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const navigate = useNavigate()

  const filtered = batches.filter(b => {
    const hive = b.hive as Hive
    const q = search.toLowerCase()
    const matchSearch = !q || b.batch_code.toLowerCase().includes(q) || hive?.hive_code?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'verified' && b.blockchain_status === 'VERIFIED') ||
      (filter === 'curing' && b.curing_status === 'in_progress') ||
      (filter === 'normal' && b.quality_status === 'NORMAL') ||
      (filter === 'suspicious' && (b.quality_status === 'SUSPICIOUS' || b.quality_status === 'REQUIRES_LAB_VERIFICATION'))
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Honey Batches"
        description={`${batches.length} batches across all hives`}
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              filter === tab.value
                ? 'bg-honey-500 text-white border-honey-500 shadow-honey'
                : 'bg-white text-gray-600 border-gray-200 hover:border-honey-300 hover:text-honey-700'
            }`}
          >
            {tab.icon}{tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.value ? 'bg-white/20' : 'bg-gray-100'}`}>
              {tab.value === 'all' ? batches.length :
               tab.value === 'verified' ? batches.filter(b => b.blockchain_status === 'VERIFIED').length :
               tab.value === 'curing' ? batches.filter(b => b.curing_status === 'in_progress').length :
               tab.value === 'normal' ? batches.filter(b => b.quality_status === 'NORMAL').length :
               batches.filter(b => b.quality_status === 'SUSPICIOUS' || b.quality_status === 'REQUIRES_LAB_VERIFICATION').length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by batch code or hive…" className="pl-9 max-w-sm" />
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<Package size={48} />} title="No batches found" description="Try adjusting your filters" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hive</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Apiary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harvest Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weight</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Curing</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quality</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Blockchain</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(batch => <BatchRow key={batch.id} batch={batch} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
