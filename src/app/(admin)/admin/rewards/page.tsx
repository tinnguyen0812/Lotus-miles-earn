'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Plus, Calendar, Gift, Edit, Eye, MoreHorizontal } from 'lucide-react';

type Reward = {
  id: string;
  name: string;
  type: 'Seasonal' | 'Birthday' | 'Challenge';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Scheduled';
  participants: number;
  budget: string;
  description: string;
};

export default function RewardsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: thay bằng dữ liệu API
  const rewards: Reward[] = [
    { id: '1', name: 'Khuyến mãi Tết Nguyên Đán 2024', type: 'Seasonal', startDate: '01/02/2024', endDate: '15/02/2024', status: 'Active', participants: 234, budget: '50,000,000 VND', description: 'Tặng 2x dặm cho tất cả chuyến bay trong dịp Tết' },
    { id: '2', name: 'Thưởng sinh nhật thành viên',       type: 'Birthday', startDate: '01/01/2024', endDate: '31/12/2024', status: 'Active',   participants: 1248, budget: '20,000,000 VND', description: 'Tặng 1,000 dặm cho thành viên trong tháng sinh nhật' },
    { id: '3', name: 'Khuyến mãi mùa hè 2023',            type: 'Seasonal', startDate: '01/06/2023', endDate: '31/08/2023', status: 'Expired', participants: 567,  budget: '30,000,000 VND', description: 'Giảm 30% dặm đổi vé cho các tuyến nội địa' },
    { id: '4', name: 'Thử thách 10,000 dặm',              type: 'Challenge', startDate: '15/01/2024', endDate: '15/03/2024', status: 'Active',   participants: 89,   budget: '15,000,000 VND', description: 'Thưởng 5,000 dặm bonus khi tích đủ 10,000 dặm' }
  ];

  const stats = [
    { label: t('admin.rewards.stats.running'),      value: '3',     color: 'bg-green-100 text-green-600' },
    { label: t('admin.rewards.stats.budget'),       value: '115M',  color: 'bg-blue-100 text-blue-600'  },
    { label: t('admin.rewards.stats.participants'), value: '1,571', color: 'bg-purple-100 text-purple-600' },
    { label: t('admin.rewards.stats.milesIssued'),  value: '2.3M',  color: 'bg-yellow-100 text-yellow-600' }
  ];

  const statusClass = (s: Reward['status']) =>
    s === 'Active' ? 'bg-green-100 text-green-700'
    : s === 'Scheduled' ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-700';

  const typeEmoji = (tpe: Reward['type']) =>
    tpe === 'Seasonal' ? '🎉' : tpe === 'Birthday' ? '🎂' : '🎯';

  const filtered = useMemo(
    () =>
      rewards.filter(r => {
        const q = searchTerm.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
      }),
    [rewards, searchTerm]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{t('admin.rewards.title')}</h1>
        <p className="text-gray-600">{t('admin.rewards.subtitle')}</p>
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
                <Gift size={20} className="opacity-60" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{t('admin.rewards.list.title')}</h2>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} />
            {t('admin.rewards.list.create')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={t('admin.rewards.list.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            {t('admin.rewards.list.filterStatus')}
          </Button>
        </div>
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{typeEmoji(r.type)}</div>
                  <div>
                    <CardTitle className="text-base mb-1">{r.name}</CardTitle>
                    <p className="text-sm text-gray-600">{r.description}</p>
                  </div>
                </div>
                <Badge className={statusClass(r.status)}>
                  {r.status === 'Active'
                    ? t('admin.rewards.status.running')
                    : r.status === 'Scheduled'
                    ? t('admin.rewards.status.scheduled')
                    : t('admin.rewards.status.expired')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={14} />
                    <span>{r.startDate} - {r.endDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('admin.rewards.cards.participants')}:</span>
                    <span className="ml-2 font-medium">{r.participants}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('admin.rewards.cards.budget')}:</span>
                    <span className="ml-2 font-medium">{r.budget}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-blue-600 border-blue-200">
                    <Eye size={14} className="mr-1" />
                    {t('admin.rewards.cards.view')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit size={14} className="mr-1" />
                    {t('admin.rewards.cards.edit')}
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <MoreHorizontal size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-dashed border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">{t('admin.rewards.quick.newPromo.title')}</h3>
            <p className="text-sm text-gray-600">{t('admin.rewards.quick.newPromo.subtitle')}</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium mb-1">{t('admin.rewards.quick.manualBonus.title')}</h3>
            <p className="text-sm text-gray-600">{t('admin.rewards.quick.manualBonus.subtitle')}</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium mb-1">{t('admin.rewards.quick.schedule.title')}</h3>
            <p className="text-sm text-gray-600">{t('admin.rewards.quick.schedule.subtitle')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
