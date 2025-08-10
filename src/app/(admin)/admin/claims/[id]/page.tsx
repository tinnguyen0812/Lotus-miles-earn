'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import withAdminGuard from '@/components/auth/withAdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { callApi } from '@/lib/api-client';
import StatusBadge from '@/components/admin/status-badge';
import type { Claim } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  ChevronLeft,
  User2,
  Fingerprint,
  Mail,
  Phone,
  Medal,
  Coins,
  Plane,
  CalendarDays,
  Route as RouteIcon,
  Armchair,
  Ruler,
  Paperclip,
  MessageSquareText,
  type LucideIcon,
} from 'lucide-react';
const BASE = '/api/claims';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-1">
      <div className="col-span-4 md:col-span-3 text-sm text-muted-foreground">{label}</div>
      <div className="col-span-8 md:col-span-9 text-sm">{value ?? '—'}</div>
    </div>
  );
}
function SectionHeader({
  icon: Icon,
  children,
}: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">{children}</h3>
      </div>
      {/* đường kẻ ở HÀNG DƯỚI, full chiều rộng cột */}
      <div className="mt-2 h-px bg-border" />
    </div>
  );
}


function AdminClaimDetailPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  const nf = useMemo(() => new Intl.NumberFormat(locale || 'en'), [locale]);
  const df = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(locale || 'en', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await callApi<Claim>({ method: 'GET', path: `${BASE}/${id}` });
        if (!ignore) setData(res);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  async function approve() {
    await callApi({ method: 'POST', path: `${BASE}/${id}/approve` });
    toast({ title: t('admin.claims.toast.approved') });
    router.push('/admin/claims');
  }

  async function reject() {
    await callApi({ method: 'POST', path: `${BASE}/${id}/reject` });
    toast({ title: t('admin.claims.toast.rejected') });
    router.push('/admin/claims');
  }

  if (loading) return <div className="p-8 text-muted-foreground">{t('admin.detail.loading') ?? 'Loading…'}</div>;
  if (!data) return <div className="p-8 text-muted-foreground">{t('admin.detail.notFound') ?? 'Not found'}</div>;

  return (
    <div className="space-y-6">
      {/* Top bar: Back + status */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/admin/claims">
            <ChevronLeft className="h-4 w-4" />
            {t('admin.detail.back') || 'Back'}
          </Link>
        </Button>
        <StatusBadge status={data.status} />
      </div>

      {/* Summary header like mock */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                {t('admin.detail.requestInfo') || 'Request information'}
              </div>
              <div className="text-lg font-semibold">{t('admin.detail.requestId') || 'Request ID'} #{data.id}</div>
              <div className="text-sm text-muted-foreground">
                {t('admin.detail.sentAt') || 'Submitted'}: {df(data.submittedAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                +{nf.format(data.milesRequested)}
              </div>
              <div className="text-xs text-muted-foreground">{t('admin.detail.pointsLabel') || 'Requested miles'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two columns: Member info / Flight info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SectionHeader icon={User2}> {t('admin.detail.memberInfo') || 'Member info'} </SectionHeader>
              <Row label="Name" value={data.member.name} />
              <Row label="ID" value={data.member.id} />
              <Row label="Email" value={data.member.email} />
              <Row label="Phone" value={data.member.phone} />
              <Row label="Tier" value={data.member.tier} />
              <Row label={t('admin.detail.currentMiles') || 'Current miles'}
                   value={typeof data.member.milesTotal === 'number' ? nf.format(data.member.milesTotal) : '—'} />
            </div>
            <div>
              <SectionHeader icon={Plane}> {t('admin.detail.flightInfo') || 'Flight info'} </SectionHeader>
              <Row label="Flight no." value={data.flight.number} />
              <Row label={t('admin.detail.date') || 'Date'} value={df(data.flight.date)} />
              <Row label="Route" value={data.flight.route} />
              <Row label="Cabin" value={data.flight.cabin} />
              <Row label="Seat" value={data.flight.seat} />
              <Row label={t('admin.detail.distance') || 'Distance'}
                   value={data.flight.distanceKm ? `${nf.format(data.flight.distanceKm)} km` : '—'} />
            </div>
          </div>

          {/* Reason */}
          <div className="mt-8">
            <SectionHeader icon={MessageSquareText}>{t('admin.detail.reason') || 'Reason'} </SectionHeader>
            <CardDescription className="mt-2">{data.reason || '—'}</CardDescription>
          </div>

          {/* Attachments */}
          <div className="mt-8">
            <CardTitle className="text-base">
              {t('admin.detail.attachments') || 'Attachments'} {data.attachments?.length ? `(${data.attachments.length})` : ''}
            </CardTitle>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {(data.attachments ?? []).map((f) => (
                <div key={f.id} className="rounded-lg border p-4">
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {f.type || 'file'} {f.size ? `• ${(f.size / 1024 / 1024).toFixed(1)} MB` : ''}
                  </div>
                  <Button variant="secondary" size="sm" asChild className="mt-3">
                    <a href={f.url} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      {t('admin.detail.download') || 'Download'}
                    </a>
                  </Button>
                </div>
              ))}
              {(!data.attachments || data.attachments.length === 0) && (
                <div className="text-sm text-muted-foreground">{t('admin.detail.noAttachments') || 'No attachments'}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions like mock: two large buttons */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.claims.title')}</CardTitle>
          <CardDescription>{t('admin.claims.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button onClick={approve} className="md:w-auto w-full">
            {t('admin.detail.approve') || 'Approve claim'}
          </Button>
          <Button onClick={reject} variant="destructive" className="md:w-auto w-full">
            {t('admin.detail.reject') || 'Reject claim'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminGuard(AdminClaimDetailPage);
