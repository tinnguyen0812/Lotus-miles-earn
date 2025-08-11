import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Shield } from 'lucide-react';
import { useState } from 'react';

interface MemberInfo {
  name: string;
  email: string;
  membershipTier: string;
  totalMiles: number;
  milesThisYear: number;
  nextTierMiles: number;
}

interface AccountInfoProps {
  memberInfo: MemberInfo;
}

export function AccountInfo({ memberInfo }: AccountInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: memberInfo.name,
    phone: '+84 123 456 789',
    address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    dateOfBirth: '1990-01-15'
  });

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

  const getTierBenefits = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return ['Ưu tiên check-in', 'Lounge miễn phí', 'Nâng hạng miễn phí', 'Hành lý thêm 40kg'];
      case 'gold':
        return ['Ưu tiên check-in', 'Lounge có phí ưu đãi', 'Hành lý thêm 20kg', 'Tích dặm thưởng 50%'];
      case 'silver':
        return ['Check-in online ưu tiên', 'Hành lý thêm 10kg', 'Tích dặm thưởng 25%'];
      default:
        return ['Tích dặm cơ bản', 'Ưu đãi đặc biệt'];
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically update the backend
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-600">Thông tin tài khoản</h2>
        <p className="text-gray-600">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </p>
      </div>

      {/* Member Status Card */}
      <Card className="border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-600">Trạng thái thành viên</CardTitle>
            <Badge className={getTierColor(memberInfo.membershipTier)}>
              {memberInfo.membershipTier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {memberInfo.totalMiles.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Tổng dặm tích lũy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {memberInfo.milesThisYear.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Dặm năm nay</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(memberInfo.nextTierMiles - memberInfo.milesThisYear).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Dặm để thăng hạng</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Quyền lợi hạng {memberInfo.membershipTier}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getTierBenefits(memberInfo.membershipTier).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-600">Thông tin cá nhân</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{formData.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{memberInfo.email}</span>
              </div>
              <p className="text-xs text-gray-500">Email không thể thay đổi</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{formData.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{formData.address}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Lưu thay đổi
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Đổi mật khẩu</h4>
              <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
            </div>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              Đổi mật khẩu
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Xác thực 2 bước</h4>
              <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản</p>
            </div>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              Kích hoạt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}