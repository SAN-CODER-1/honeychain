import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, CircleAlert, ExternalLink, Hexagon, ShieldCheck } from 'lucide-react'
import { useBatchScreening, useBlockchainRecords, useHoneyBatch } from '@/hooks/useData'
import { Card, Skeleton } from '@/components/ui'
import { formatDate, formatWeight } from '@/lib/utils'

export default function VerifyBatchPage() {
  const { batchCode } = useParams<{ batchCode: string }>()
  const { data: batch, loading } = useHoneyBatch(batchCode)
  const { data: screening } = useBatchScreening(batch?.id)
  const { data: blockchain } = useBlockchainRecords(batch?.id)

  if (loading) {
    return <main className="min-h-screen bg-honey-50 p-6"><div className="max-w-xl mx-auto space-y-4"><Skeleton className="h-20" /><Skeleton className="h-72" /></div></main>
  }

  if (!batch) {
    return (
      <main className="min-h-screen bg-honey-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CircleAlert size={42} className="mx-auto mb-4 text-amber-500" />
          <h1 className="font-display text-2xl font-bold text-gray-900">Batch not found</h1>
          <p className="mt-2 text-sm text-gray-500">This QR code does not match a HoneyChain batch.</p>
          <Link to="/" className="inline-block mt-6 text-sm font-semibold text-honey-700 hover:text-honey-800">Visit HoneyChain</Link>
        </Card>
      </main>
    )
  }

  const hive = batch.hive as { hive_code?: string; name?: string; apiary?: { name?: string } } | undefined
  const record = blockchain[0]
  const verified = batch.blockchain_status === 'VERIFIED' && record?.status === 'VERIFIED'
  const screeningLabel = screening?.screening_result.replace(/_/g, ' ') ?? 'PENDING'

  return (
    <main className="min-h-screen bg-honey-50 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-honey-gradient flex items-center justify-center text-2xl shadow-honey">🍯</div>
          <p className="text-sm font-semibold text-honey-700">HONEYCHAIN</p>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-1">Batch verification</h1>
        </header>

        <Card className="space-y-6">
          <div className={`rounded-xl p-4 flex items-start gap-3 ${verified ? 'bg-sage-50 border border-sage-200' : 'bg-amber-50 border border-amber-200'}`}>
            {verified ? <CheckCircle2 className="shrink-0 text-sage-600" size={24} /> : <CircleAlert className="shrink-0 text-amber-600" size={24} />}
            <div>
              <p className={`font-bold ${verified ? 'text-sage-800' : 'text-amber-800'}`}>{verified ? 'Verified on blockchain' : 'Verification pending'}</p>
              <p className={`text-sm mt-1 ${verified ? 'text-sage-700' : 'text-amber-700'}`}>{verified ? 'This batch has a verified HoneyChain traceability record.' : 'This batch exists, but its blockchain record is not yet verified.'}</p>
            </div>
          </div>

          <section>
            <p className="text-xs font-semibold tracking-wide text-gray-400">BATCH</p>
            <h2 className="font-display font-bold text-2xl text-gray-900 mt-1">{batch.batch_code}</h2>
          </section>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 text-xs">Harvest date</p><p className="font-semibold text-gray-800 mt-1">{formatDate(batch.harvest_date)}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 text-xs">Harvest weight</p><p className="font-semibold text-gray-800 mt-1">{formatWeight(batch.harvest_weight)}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 text-xs">Hive</p><p className="font-semibold text-gray-800 mt-1">{hive?.hive_code ?? 'Unavailable'}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 text-xs">Apiary</p><p className="font-semibold text-gray-800 mt-1">{hive?.apiary?.name ?? 'Unavailable'}</p></div>
          </div>

          <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3"><ShieldCheck className="text-sky-600 shrink-0" size={20} /><div><p className="text-xs text-gray-400">Quality screening</p><p className="font-semibold text-gray-800 text-sm mt-1">{screeningLabel}</p></div></div>
            {record && <div className="flex gap-3"><Hexagon className="text-indigo-600 shrink-0" size={20} /><div><p className="text-xs text-gray-400">Blockchain block</p><p className="font-semibold text-gray-800 text-sm mt-1">#{record.block_number.toLocaleString()}</p></div></div>}
          </div>

          <Link to={`/batches/${batch.id}`} className="flex w-full justify-center items-center gap-2 text-sm font-semibold text-honey-700 hover:text-honey-800">
            View traceability details <ExternalLink size={14} />
          </Link>
        </Card>
        <p className="text-center text-xs text-gray-400 mt-5">HoneyChain traceability data is supported by IoT monitoring and blockchain records.</p>
      </div>
    </main>
  )
}
