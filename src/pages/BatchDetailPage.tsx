import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, Printer, Share2, FileText, ShieldCheck,
  QrCode, Scale, Calendar, Hexagon, Package, CheckCircle, Link2,
  Thermometer, Droplets, Activity, AlertCircle,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid,
} from 'recharts'
import { useHoneyBatch, useBatchScreening, useBlockchainRecords, useBatchEvents, useSensorReadings } from '@/hooks/useData'
import { Card, CardHeader, CardTitle, Badge, Button, Skeleton, EmptyState, PageHeader } from '@/components/ui'
import { formatDate, formatDateTime, formatWeight, truncateHash, generateBatchQR } from '@/lib/utils'
import type { BatchEvent } from '@/lib/supabase'

const EVENT_COLORS: Record<BatchEvent['event_type'], { bg: string; border: string; icon: React.ReactNode; color: string }> = {
  NECTAR:            { bg: 'bg-sage-50',   border: 'border-sage-300',   icon: '🌸', color: 'text-sage-700' },
  CURING:            { bg: 'bg-honey-50',  border: 'border-honey-300',  icon: '🍯', color: 'text-honey-700' },
  DEHYDRATION:       { bg: 'bg-amber-50',  border: 'border-amber-300',  icon: '💧', color: 'text-amber-700' },
  CAPPING:           { bg: 'bg-orange-50', border: 'border-orange-300', icon: '🐝', color: 'text-orange-700' },
  HARVEST:           { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: '⚗️', color: 'text-yellow-700' },
  QUALITY_SCREENING: { bg: 'bg-sky-50',    border: 'border-sky-300',    icon: '🔬', color: 'text-sky-700' },
  BLOCKCHAIN:        { bg: 'bg-indigo-50', border: 'border-indigo-300', icon: '⛓️', color: 'text-indigo-700' },
  QR_VERIFICATION:   { bg: 'bg-purple-50', border: 'border-purple-300', icon: '📱', color: 'text-purple-700' },
}

function BatchTimeline({ batchId }: { batchId: string }) {
  const { data: events } = useBatchEvents(batchId)

  if (events.length === 0) return (
    <EmptyState title="No events recorded for this batch" />
  )

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-honey-300 via-honey-200 to-honey-100" />
      <div className="space-y-4">
        {events.map((event, idx) => {
          const style = EVENT_COLORS[event.event_type] ?? EVENT_COLORS['NECTAR']
          return (
            <div key={event.id} className="relative flex items-start gap-4 pl-12">
              <div className={`absolute left-2 top-3 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 ${style.border} ${style.bg} z-10`}>
                {style.icon}
              </div>
              <div className={`flex-1 border rounded-xl p-4 ${style.bg} ${style.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${style.color}`}>{event.event_type.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(event.event_time)}</span>
                </div>
                <p className="text-sm text-gray-700">{event.description}</p>
                {Object.keys(event.metadata ?? {}).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(event.metadata ?? {}).map(([k, v]) => (
                      <span key={k} className="text-xs bg-white/70 rounded-full px-2 py-0.5 text-gray-600">
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BatchSensorHistory({ hiveId, harvestDate }: { hiveId: string; harvestDate: string }) {
  const { data: allReadings } = useSensorReadings(hiveId, 45)
  const readings = allReadings.filter(r => {
    const harvDate = new Date(harvestDate)
    const rd = new Date(r.recorded_at)
    const start = new Date(harvDate)
    start.setDate(start.getDate() - 30)
    return rd >= start && rd <= harvDate
  }).slice(-60)

  const data = readings.map(r => ({
    time: formatDate(r.recorded_at),
    temperature: r.temperature,
    humidity: r.humidity,
    weight: r.weight,
    activity: r.bee_activity,
  }))

  if (data.length === 0) return <EmptyState title="No sensor history for this batch period" />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { key: 'temperature', label: 'Temperature', color: '#f59e0b', unit: '°C' },
        { key: 'humidity',    label: 'Humidity',    color: '#0ea5e9', unit: '%' },
        { key: 'weight',      label: 'Hive Weight', color: '#22c55e', unit: ' kg' },
        { key: 'activity',    label: 'Bee Activity',color: '#8b5cf6', unit: '%' },
      ].map(m => (
        <div key={m.key}>
          <div className="text-sm font-medium text-gray-600 mb-2">{m.label}</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 8 }} interval={Math.floor(data.length / 4)} />
              <YAxis tick={{ fontSize: 8 }} domain={['auto', 'auto']} />
              <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: unknown) => [`${String(v ?? '')}${m.unit}`]} />
              <Area type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={1.5} fill={`url(#grad-${m.key})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}

function QualityScreeningPanel({ batchId }: { batchId: string }) {
  const { data: screening } = useBatchScreening(batchId)

  if (!screening) return (
    <div className="text-center py-8 text-gray-400">
      <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
      <p className="text-sm">Quality screening not yet completed for this batch.</p>
    </div>
  )

  const resultVariant = (screening.screening_result === 'NORMAL' ? 'normal' : screening.screening_result === 'SUSPICIOUS' ? 'suspicious' : 'lab') as 'normal' | 'suspicious' | 'lab'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant={resultVariant} className="text-sm px-3 py-1">
          {screening.screening_result === 'NORMAL' ? '✓ NORMAL' :
           screening.screening_result === 'SUSPICIOUS' ? '⚠ SUSPICIOUS' : '🔬 REQUIRES LAB VERIFICATION'}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-sky-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Moisture</div>
          <div className="text-2xl font-display font-bold text-sky-700">{screening.moisture}%</div>
          <div className={`text-xs mt-1 ${screening.moisture <= 20 ? 'text-sage-600' : 'text-amber-600'}`}>
            {screening.moisture <= 20 ? '✓ Normal' : '⚠ Elevated'}
          </div>
        </div>
        <div className="bg-honey-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">pH</div>
          <div className="text-2xl font-display font-bold text-honey-700">{screening.ph}</div>
          <div className={`text-xs mt-1 ${screening.ph >= 3.5 && screening.ph <= 4.2 ? 'text-sage-600' : 'text-amber-600'}`}>
            {screening.ph >= 3.5 && screening.ph <= 4.2 ? '✓ Normal' : '⚠ Review'}
          </div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Conductivity</div>
          <div className="text-2xl font-display font-bold text-sage-700">{screening.conductivity}</div>
          <div className={`text-xs mt-1 ${screening.conductivity <= 0.6 ? 'text-sage-600' : 'text-amber-600'}`}>
            {screening.conductivity <= 0.6 ? '✓ Normal' : '⚠ Elevated'}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">{screening.screening_notes}</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <strong>⚠ Disclaimer:</strong> AI and IoT screening identifies suspicious patterns and does not replace laboratory chemical verification.
      </div>
    </div>
  )
}

function BlockchainPanel({ batchId }: { batchId: string }) {
  const { data: records } = useBlockchainRecords(batchId)
  const record = records[0]

  if (!record) return (
    <EmptyState icon={<Link2 size={40} />} title="Not yet submitted to blockchain" description="This batch has not been submitted to the blockchain yet." />
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="verified" className="text-sm px-3 py-1">✓ VERIFIED ON BLOCKCHAIN</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Network</div>
          <div className="font-semibold text-indigo-700">{record.network}</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Block Number</div>
          <div className="font-semibold text-indigo-700">#{record.block_number.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 col-span-full">
          <div className="text-xs text-gray-400 mb-1">Data Hash</div>
          <div className="font-mono text-xs text-gray-700 break-all">{record.data_hash}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 col-span-full">
          <div className="text-xs text-gray-400 mb-1">Transaction Hash</div>
          <div className="font-mono text-xs text-gray-700 break-all">{record.transaction_hash}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Contract Address</div>
          <div className="font-mono text-xs text-gray-700">{record.contract_address}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Verified At</div>
          <div className="text-sm text-gray-700">{formatDateTime(record.created_at)}</div>
        </div>
      </div>
    </div>
  )
}

function QRPanel({ batchCode }: { batchCode: string }) {
  const qrRef = useRef<HTMLDivElement>(null)
  const verifyUrl = generateBatchQR(batchCode)

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${batchCode}-QR.png`
    a.click()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-card">
        <QRCodeSVG value={verifyUrl} size={200} level="H" includeMargin />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Scan to verify batch</p>
        <p className="text-xs font-mono text-gray-400 break-all max-w-xs">{verifyUrl}</p>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button variant="primary" size="sm" onClick={downloadQR}>
          <Download size={14} /> Download QR
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer size={14} /> Print
        </Button>
        <Button variant="secondary" size="sm" onClick={copyLink}>
          <Share2 size={14} /> Copy Link
        </Button>
      </div>
    </div>
  )
}

async function generatePDF(batch: ReturnType<typeof useHoneyBatch>['data'], screening: ReturnType<typeof useBatchScreening>['data'], blockchain: ReturnType<typeof useBlockchainRecords>['data']) {
  const { default: jsPDF } = await import('jspdf')
  if (!batch) return

  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, pageW, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('🍯 HoneyChain', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered IoT System for Honey Purity Screening & Smart Hive Management', 14, 28)
  doc.setFontSize(12)
  doc.text('Honey Batch Traceability Report', 14, 36)

  // Batch info
  doc.setTextColor(30, 30, 30)
  let y = 55
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`Batch: ${batch.batch_code}`, 14, y)
  y += 8

  const hive = batch.hive as { hive_code?: string; name?: string; apiary?: { name?: string } }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const info = [
    ['Batch ID', batch.batch_code],
    ['Hive', `${hive?.hive_code} – ${hive?.name}`],
    ['Apiary', hive?.apiary?.name ?? '—'],
    ['Harvest Date', formatDate(batch.harvest_date)],
    ['Harvest Weight', formatWeight(batch.harvest_weight)],
    ['Curing Status', batch.curing_status],
    ['Quality Status', batch.quality_status],
    ['Blockchain Status', batch.blockchain_status],
  ]

  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 14, y += 8)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 70, y)
  })

  if (screening) {
    y += 12
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Quality Screening', 14, y)
    y += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Result: ${screening.screening_result}`, 14, y)
    doc.text(`Moisture: ${screening.moisture}%  |  pH: ${screening.ph}  |  Conductivity: ${screening.conductivity}`, 14, y += 8)
    const notes = doc.splitTextToSize(screening.screening_notes, pageW - 28)
    doc.text(notes, 14, y += 8)
    y += notes.length * 6
  }

  if (blockchain[0]) {
    y += 8
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Blockchain Verification', 14, y)
    y += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Network: ${blockchain[0].network}`, 14, y)
    doc.text(`Block: #${blockchain[0].block_number}`, 14, y += 6)
    doc.text(`Tx: ${blockchain[0].transaction_hash}`, 14, y += 6)
    doc.text(`Hash: ${blockchain[0].data_hash}`, 14, y += 6)
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('HoneyChain · AI-Powered IoT System for Honey Purity Screening & Smart Hive Management', pageW / 2, y, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleString('en-AU')}`, pageW / 2, y + 5, { align: 'center' })
  doc.text('AI screening does not replace laboratory chemical verification.', pageW / 2, y + 10, { align: 'center' })

  doc.save(`${batch.batch_code}-Traceability-Report.pdf`)
}

type TabKey = 'journey' | 'sensors' | 'quality' | 'blockchain' | 'qr'

export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const { data: batch, loading } = useHoneyBatch(batchId)
  const { data: screening } = useBatchScreening(batchId)
  const { data: blockchainRecords } = useBlockchainRecords(batchId)
  const [tab, setTab] = useState<TabKey>('journey')

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>
  if (!batch) return <EmptyState icon={<Package size={48} />} title="Batch not found" />

  const hive = batch.hive as { hive_code?: string; name?: string; apiary?: { name?: string }; id?: string }
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'journey',    label: 'Journey',    icon: <CheckCircle size={14} /> },
    { key: 'sensors',    label: 'Sensor History', icon: <Activity size={14} /> },
    { key: 'quality',    label: 'Quality Screening', icon: <Thermometer size={14} /> },
    { key: 'blockchain', label: 'Blockchain', icon: <Link2 size={14} /> },
    { key: 'qr',         label: 'QR Code',    icon: <QrCode size={14} /> },
  ]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/batches')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-honey-600 transition-colors">
        <ArrowLeft size={16} /> Back to Batches
      </button>

      <PageHeader
        title={batch.batch_code}
        description={`${hive?.hive_code} · ${hive?.apiary?.name}`}
        badge={
          <Badge variant={batch.blockchain_status === 'VERIFIED' ? 'verified' : 'warning'}>
            {batch.blockchain_status === 'VERIFIED' ? '✓ Verified' : batch.blockchain_status}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generatePDF(batch, screening, blockchainRecords)}
          >
            <FileText size={14} /> Download PDF
          </Button>
        }
      />

      {/* Batch info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400"><Hexagon size={14} /> Hive</div>
          <div className="font-display font-bold text-gray-900">{hive?.hive_code}</div>
          <div className="text-xs text-gray-500">{hive?.name}</div>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={14} /> Harvest</div>
          <div className="font-display font-bold text-gray-900">{formatDate(batch.harvest_date)}</div>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400"><Scale size={14} /> Weight</div>
          <div className="font-display font-bold text-gray-900">{formatWeight(batch.harvest_weight)}</div>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400"><ShieldCheck size={14} /> Quality</div>
          <div className="font-display font-bold text-gray-900">
            {batch.quality_status === 'NORMAL' ? 'Normal' : batch.quality_status === 'SUSPICIOUS' ? 'Suspicious' : batch.quality_status === 'REQUIRES_LAB_VERIFICATION' ? 'Lab Required' : 'Pending'}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-honey-700' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card>
        {tab === 'journey' && (
          <>
            <CardHeader><CardTitle>Batch Journey</CardTitle></CardHeader>
            <BatchTimeline batchId={batchId!} />
          </>
        )}
        {tab === 'sensors' && (
          <>
            <CardHeader><CardTitle>Production Sensor History</CardTitle></CardHeader>
            {hive?.id && <BatchSensorHistory hiveId={hive.id} harvestDate={batch.harvest_date} />}
          </>
        )}
        {tab === 'quality' && (
          <>
            <CardHeader><CardTitle>AI Quality Screening</CardTitle></CardHeader>
            <QualityScreeningPanel batchId={batchId!} />
          </>
        )}
        {tab === 'blockchain' && (
          <>
            <CardHeader><CardTitle>Blockchain Verification</CardTitle></CardHeader>
            <BlockchainPanel batchId={batchId!} />
          </>
        )}
        {tab === 'qr' && (
          <>
            <CardHeader><CardTitle>QR Verification Code</CardTitle></CardHeader>
            <QRPanel batchCode={batch.batch_code} />
          </>
        )}
      </Card>
    </div>
  )
}
