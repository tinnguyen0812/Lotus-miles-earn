'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Download, Edit, Eye, MoreHorizontal } from 'lucide-react';

type Member = {
  id: string;
  name: string;
  email: string;
  tier: 'Business' | 'Gold' | 'Silver';
  totalMiles: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  avatar: string;
};

export default function MembersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: thay bằng dữ liệu API
  const members: Member[] = [
    { id: 'LM-106751', name: 'Nguyễn Văn Khải', email: 'khai.nguyen@email.com', tier: 'Business', totalMiles: 45230, joinDate: '15/03/2023', status: 'Active', avatar: 'NK' },
    { id: 'LM-108932', name: 'Trần Thị Lan', email: 'lan.tran@email.com', tier: 'Gold', totalMiles: 32150, joinDate: '22/07/2022', status: 'Active', avatar: 'TL' },
    { id: 'LM-105634', name: 'Lê Minh Hoàng', email: 'hoang.le@email.com', tier: 'Silver', totalMiles: 18940, joinDate: '08/11/2023', status: 'Active', avatar: 'LH' },
    { id: 'LM-109876', name: 'Phạm Thị Hương', email: 'huong.pham@email.com', tier: 'Business', totalMiles: 67820, joinDate: '03/01/2022', status: 'Active', avatar: 'PH' },
    { id: 'LM-107543', name: 'Vũ Đình Nam', email: 'nam.vu@email.com', tier: 'Gold', totalMiles: 29650, joinDate: '19/09/2023', status: 'Inactive', avatar: 'VN' }
  ];

  const stats = [
    { label: t('admin.members.stats.total'),        value: '1,248', color: 'bg-blue-100 text-blue-600' },
    { label: t('admin.members.stats.newThisMonth'), value: '45',    color: 'bg-green-100 text-green-600' },
    { label: 'Business',                            value: '156',   color: 'bg-purple-100 text-purple-600' },
    { label: 'Gold/Silver',                         value: '892',   color: 'bg-yellow-100 text-yellow-600' }
  ];

  const tierClass = (tier: Member['tier']) =>
    tier === 'Business' ? 'bg-purple-100 text-purple-700'
    : tier === 'Gold'    ? 'bg-yellow-100 text-yellow-700'
                         : 'bg-gray-100 text-gray-700';

  const filtered = useMemo(
    () => members.filter(m => {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }),
    [members, searchTerm]
  );

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
                    <Badge className={tierClass(m.tier)}>{m.tier}</Badge>
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
                    <Badge
                      variant={m.status === 'Active' ? 'default' : 'secondary'}
                      className={m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                    >
                      {m.status === 'Active' ? t('admin.members.status.active') : t('admin.members.status.inactive')}
                    </Badge>
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
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-600">
            {t('admin.members.table.showing', { count: filtered.length, total: members.length })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>{t('admin.members.pager.prev')}</Button>
            <Button size="sm" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">{t('admin.members.pager.next')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
