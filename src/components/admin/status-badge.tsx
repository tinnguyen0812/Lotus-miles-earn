'use client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function StatusBadge({ status }: { status: 'pending'|'approved'|'rejected' }) {
  const tone = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200'
  } as const
  return <Badge variant="outline" className={cn('capitalize', tone[status])}>{status}</Badge>
}
