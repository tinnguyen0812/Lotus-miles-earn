'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAdminGuard from '@/components/auth/withAdminGuard';
import { callApi } from '@/lib/api-client';
import { RequestDetail, type RequestDetailData, type ClaimStatus } from '@/components/admin/RequestDetail';
import { useTranslation } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

/** ===== Types khớp response API detail ===== */
type ApiDetail = {
  id: string;
  request_type: string;
  status: 'pending' | 'processing' | 'processed' | 'rejected';
  points: number;
  description?: string | null;
  user?: {
    id: string;
    user_name?: string | null;
    user_email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone_numbers?: string | null;
    user_number?: string | null; // mã hội viên
  } | null;
  file_url?: string | null;

  uploaded_at?: string | null;
  processed_at?: string | null;

  seat_code?: string | null;
  seat_class?: string | null;
  ticket_number?: string | null;

  flight_code?: string | null;
  flight_departure_airport?: string | null;
  flight_arrival_airport?: string | null;
  flight_departure_date?: string | null;
  flight_arrival_date?: string | null;
  distance?: number | null;
  flight_airline?: string | null;

  request_number?: string | null;
};

type ApiRes = { success: boolean; data: ApiDetail };

/** ===== Helpers ===== */
function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapStatus(s?: string): ClaimStatus {
  switch ((s || '').toLowerCase()) {
    case 'processed':
      return 'approved'; // Giữ label Approved như UI/i18n
    case 'rejected':
      return 'rejected';
    case 'processing':
      return 'processing';
    case 'pending':
    default:
      return 'pending';
  }
}

function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last || 'attachment';
  } catch {
    const seg = url.split('/').filter(Boolean).pop();
    return seg || 'attachment';
  }
}

/** Map API -> shape dùng cho <RequestDetail/> */
function mapDetail(api: ApiDetail): RequestDetailData {
  const fullName =
    [api.user?.first_name, api.user?.last_name].filter(Boolean).join(' ').trim() ||
    api.user?.user_name ||
    'Member';

  const memberCode = api.user?.user_number || '—';
  const email = api.user?.user_email || '—';
  const phone = api.user?.phone_numbers || '—';

  const flight: RequestDetailData['flight'] | undefined = api.request_type?.toLowerCase() === 'flight'
    ? {
        number: api.flight_code || '—',
        date: api.flight_departure_date || api.uploaded_at || new Date().toISOString(),
        routeFrom: api.flight_departure_airport || '—',
        routeTo: api.flight_arrival_airport || '—',
        cabin: api.seat_class || '—',
        distanceKm: api.distance ?? undefined,
      }
    : undefined;

  const attachments: RequestDetailData['attachments'] =
    api.file_url
      ? [
          {
            id: 'main',
            name: fileNameFromUrl(api.file_url),
            sizeBytes: 0, // BE không trả size → để 0
            url: api.file_url,
          },
        ]
      : [];

  return {
    id: api.request_number || api.id,
    submittedAt: api.uploaded_at || new Date().toISOString(),
    status: mapStatus(api.status),
    expectedMiles: Number(api.points || 0),
    reason:
      api.description ||
      (api.request_type?.toLowerCase() === 'flight'
        ? `Claim miles for flight ${api.flight_code || ''} ${api.flight_departure_airport || ''} → ${api.flight_arrival_airport || ''}`.trim()
        : 'Claim miles'),

    member: {
      initials: initialsFromName(fullName),
      fullName,
      memberCode,
      email,
      phone,
      tier: '—',          // API detail hiện chưa trả tier
      tenureMonths: 0,    // Không có trường tính thâm niên
      totalMiles: 0,      // Không có tổng dặm tích lũy trong API detail
    },

    flight,
    attachments,
  };
}

/** ===== Page (client) ===== */
function ClaimDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<RequestDetailData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await callApi<ApiRes>({
          method: 'GET',
          path: `/ms-loyalty/admin/claim-miles-manual/${encodeURIComponent(String(id))}`,
          headers: { Authorization: `Bearer ${token}` },
        });
        const api = res?.data as ApiDetail;
        if (!cancelled) setData(mapDetail(api));
      } catch (e) {
        console.error('Load detail error', e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);
  const userId = localStorage.getItem('user_id') || ''
  const approve = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token') || '';
      await callApi({
        method: 'PUT',
        path: `/ms-loyalty/admin/claim-miles-manual/${encodeURIComponent(String(id))}`,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-user-id': userId, },
        body: { status: 'processed', reason: 'Approved by admin' },
      });
      router.push('/admin/claims');
    } catch (e) {
      console.error('Approve error', e);
      setSaving(false);
    }
  };

  const reject = async (reason: string) => {
    if (!id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token') || '';
      await callApi({
        method: 'PUT',
        path: `/ms-loyalty/admin/claim-miles-manual/${encodeURIComponent(String(id))}`,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json','x-user-id': userId, },
        body: { status: 'rejected', reason: reason || 'Rejected by admin' },
      });
      router.push('/admin/claims');
    } catch (e) {
      console.error('Reject error', e);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('common.loading') || 'Loading...'}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-red-600">
        {t('common.error') || 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <RequestDetail
        data={data}
        onApprove={approve}
        onReject={reject}
      />
      {saving && (
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('common.saving') || 'Saving...'}</span>
        </div>
      )}
    </div>
  );
}

export default withAdminGuard(ClaimDetailPage);
