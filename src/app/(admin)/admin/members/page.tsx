'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Download, Edit, Eye, MoreHorizontal, Loader2 } from 'lucide-react';
import withAdminGuard from '@/components/auth/withAdminGuard';
import { callApi } from '@/lib/api-client';

type TierKey = 'gold' | 'silver' | 'bronze' | 'member';

type ApiUser = {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_type: string;
  created_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  tier?: { tier_name?: string | null } | null;
  points?: { total_points?: number } | null;
  user_number?: string | null;
};

type Row = {
  id: string;          // LM-...
  name: string;
  email: string;
  tier: TierKey;
  totalMiles: number;
  joinDate: string;    // dd/MM/yyyy
  status: 'Active' | 'Inactive';
  avatar: string;      // initials
};

function toInitials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function mapTier(tierName?: string | null): TierKey {
  const s = (tierName || '').toLowerCase();
  if (s === 'gold') return 'gold';
  if (s === 'silver') return 'silver';
  if (s === 'bronze') return 'bronze';
  return 'member';
}

function MembersPage() {
  const { t } = useTranslation();

  // search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // data state
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await callApi<any>({
          method: 'GET',
          path: `/ms-users/admin/users?size=${size}&page=${page}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        const list: ApiUser[] = res?.data?.data ?? [];
        const pg = res?.data?.pagination ?? { total: 0, page, size, totalPages: 1 };

        const df = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const mapped: Row[] = list.map((u) => {
          const name =
            [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
            u.user_name ||
            'Member';

          return {
            id: u.user_number || u.id,
            name,
            email: u.user_email || '-',
            tier: mapTier(u.tier?.tier_name),
            totalMiles: Number(u.points?.total_points || 0),
            joinDate: u.created_at ? df.format(new Date(u.created_at)) : '',
            status: 'Active', // API chưa có trạng thái
            avatar: toInitials(name),
          };
        });

        if (!cancelled) {
          setRows(mapped);
          setTotal(Number(pg.total || 0));
          setTotalPages(Number(pg.totalPages || 1));
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, size]);

  // filter client-side
  const filtered = useMemo(
    () => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return rows;
      return rows.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.id || '').toLowerCase().includes(q)
      );
    },
    [rows, searchTerm]
  );

  // stats
  const now = new Date();
  const newThisMonth = rows.filter(r => {
    const [d, m, y] = r.joinDate.split('/'); // dd/MM/yyyy
    if (!d || !m || !y) return false;
    return Number(m) === (now.getMonth() + 1) && Number(y) === now.getFullYear();
  }).length;

  const tierCounts = rows.reduce(
    (acc, r) => { acc[r.tier] = (acc[r.tier] || 0) + 1; return acc; },
    {} as Record<TierKey, number>
  );

  const stats = [
    { label: t('admin.members.stats.total'),        value: total.toLocaleString(), color: 'bg-blue-100 text-blue-600' },
    { label: t('admin.members.stats.newThisMonth'), value: newThisMonth,           color: 'bg-green-100 text-green-600' },
    { label: 'Gold',                                 value: tierCounts.gold   || 0, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Silver / Bronze',                      value: (tierCounts.silver || 0) + (tierCounts.bronze || 0), color: 'bg-gray-100 text-gray-700' },
  ];

  const tierBadgeClass = (tier: TierKey) =>
    tier === 'gold'
      ? 'bg-yellow-100 text-yellow-700'
      : tier === 'silver'
      ? 'bg-gray-200 text-gray-700'
      : tier === 'bronze'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-teal-100 text-teal-700';

  // pager helpers
  const from = total ? (page - 1) * size + 1 : 0;
  const to = total ? Math.min(page * size, total) : 0;
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{t('admin.members.title')}</h1>
        <p className="text-gray-600">{t('admin.members.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className="text-2xl font-semibold mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <div className="w-4 h-4 rounded-full bg-current opacity-60" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{t('admin.members.list.title')}</h2>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              {t('admin.members.list.export')}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {t('admin.members.list.add')}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={t('admin.members.list.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            {t('admin.members.list.filterTier')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-6 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('common.loading') || 'Loading...'}</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.member')}</th>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.memberId')}</th>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.tier')}</th>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.totalMiles')}</th>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.joinDate')}</th>
                    <th className="text-left p-4 text-sm text-gray-600">{t('admin.members.table.status')}</th>
                    <th className="text-center p-4 text-sm text-gray-600">{t('admin.members.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">{m.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{m.name}</p>
                            <p className="text-sm text-gray-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm">{m.id}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={tierBadgeClass(m.tier)}>
                          {m.tier === 'member' ? 'Member' : m.tier.charAt(0).toUpperCase() + m.tier.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          {m.totalMiles.toLocaleString()} {t('admin.members.miles')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{m.joinDate}</span>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-700"> {t('admin.members.status.active')} </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-blue-600">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-gray-600">
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-gray-600">
                            <MoreHorizontal size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-sm text-muted-foreground" colSpan={7}>
                        {t('common.no_data') || 'No data'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pager */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t">
              <p className="text-sm text-gray-600">
                {total ? `Hiển thị ${from}–${to} / ${total}` : t('admin.members.table.showing', { count: filtered.length, total: rows.length })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  {t('admin.members.pager.prev')}
                </Button>

                {pageNumbers[0] > 1 && <span className="px-1">…</span>}
                {pageNumbers.map((n) => (
                  <Button
                    key={n}
                    variant={n === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(n)}
                    className={n === page ? 'bg-blue-600 text-white' : undefined}
                  >
                    {n}
                  </Button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-1">…</span>}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  {t('admin.members.pager.next')}
                </Button>

                <select
                  className="ml-2 rounded-md border border-gray-300 p-2 text-sm"
                  value={size}
                  onChange={(e) => { setPage(1); setSize(Number(e.target.value) || 10); }}
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAdminGuard(MembersPage);
