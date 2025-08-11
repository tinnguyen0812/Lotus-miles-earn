import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, MapPin, Calendar, Star } from 'lucide-react';

interface MemberInfo {
  name: string;
  email: string;
  membershipTier: string;
  totalMiles: number;
  milesThisYear: number;
  nextTierMiles: number;
}

interface MemberDashboardProps {
  memberInfo: MemberInfo;
}

export function MemberDashboard({ memberInfo }: MemberDashboardProps) {
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'bg-gray-800 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-teal-600 text-white';
    }
  };

  const progressToNextTier = (memberInfo.milesThisYear / memberInfo.nextTierMiles) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2>Chào mừng trở lại, {memberInfo.name}</h2>
            <p className="text-teal-100 mt-1">{memberInfo.email}</p>
          </div>
          <Badge className={getTierColor(memberInfo.membershipTier)}>
            <Star className="w-4 h-4 mr-1" />
            {memberInfo.membershipTier}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              Tổng số dặm
            </CardTitle>
            <MapPin className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {memberInfo.totalMiles.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Tích lũy từ khi gia nhập
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              Dặm năm nay
            </CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {memberInfo.milesThisYear.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Từ 01/01/2025
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              Tiến độ thăng hạng
            </CardTitle>
            <Trophy className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {Math.round(progressToNextTier)}%
            </div>
            <div className="w-full bg-teal-100 rounded-full h-2 mt-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNextTier}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Còn {(memberInfo.nextTierMiles - memberInfo.milesThisYear).toLocaleString()} dặm để thăng hạng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div>
                <p className="font-medium text-teal-700">Chuyến bay SGN → HAN</p>
                <p className="text-sm text-gray-600">08/08/2025</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +1,250 dặm
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div>
                <p className="font-medium text-teal-700">Mua sắm tại đối tác</p>
                <p className="text-sm text-gray-600">05/08/2025</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +500 dặm
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-700">Yêu cầu tích dặm thủ công</p>
                <p className="text-sm text-gray-600">03/08/2025</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Đang xử lý
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}