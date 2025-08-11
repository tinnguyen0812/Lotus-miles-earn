import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Calendar, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface MilesRequest {
  id: string;
  type: string;
  description: string;
  submittedDate: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  expectedMiles: number;
  actualMiles?: number;
  rejectionReason?: string;
  processingNotes?: string;
}

const mockRequests: MilesRequest[] = [
  {
    id: 'REQ-2025-001',
    type: 'missing-flight',
    description: 'Chuyến bay SGN → NRT (VN301) - 15/07/2025',
    submittedDate: '2025-08-03',
    status: 'processing',
    expectedMiles: 2500,
    processingNotes: 'Đang xác minh thông tin với hãng hàng không'
  },
  {
    id: 'REQ-2025-002',
    type: 'partner-purchase',
    description: 'Mua sắm tại Vincom Center - Hóa đơn #VIN789012',
    submittedDate: '2025-07-28',
    status: 'approved',
    expectedMiles: 800,
    actualMiles: 800
  },
  {
    id: 'REQ-2025-003',
    type: 'hotel-stay',
    description: 'Lưu trú tại Sheraton Hanoi - 3 đêm',
    submittedDate: '2025-07-20',
    status: 'rejected',
    expectedMiles: 1200,
    rejectionReason: 'Không tìm thấy booking trong hệ thống đối tác'
  },
  {
    id: 'REQ-2025-004',
    type: 'credit-card',
    description: 'Thanh toán thẻ VietinBank - Tháng 6/2025',
    submittedDate: '2025-07-15',
    status: 'approved',
    expectedMiles: 1500,
    actualMiles: 1350
  }
];

export function RequestTracking() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Chờ xử lý</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Đã cộng</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'missing-flight':
        return 'Chuyến bay thiếu dặm';
      case 'partner-purchase':
        return 'Mua sắm đối tác';
      case 'hotel-stay':
        return 'Lưu trú khách sạn';
      case 'credit-card':
        return 'Thẻ tín dụng';
      default:
        return 'Khác';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-teal-600">Theo dõi yêu cầu</h2>
          <p className="text-gray-600">
            Theo dõi trạng thái các yêu cầu tích dặm thủ công của bạn
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã cộng</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {mockRequests.map((request) => (
          <Card key={request.id} className="border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="font-medium text-teal-700">
                      {request.id}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{getTypeLabel(request.type)}</span>
                    </div>
                    
                    <p className="text-gray-800">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Gửi ngày: {formatDate(request.submittedDate)}</span>
                      </div>
                      <div>
                        <span>Dặm mong đợi: </span>
                        <span className="font-medium text-teal-600">
                          {request.expectedMiles.toLocaleString()}
                        </span>
                      </div>
                      {request.actualMiles && (
                        <div>
                          <span>Dặm thực tế: </span>
                          <span className="font-medium text-green-600">
                            {request.actualMiles.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Processing Notes */}
                    {request.processingNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700">
                          <strong>Ghi chú xử lý:</strong> {request.processingNotes}
                        </p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {request.rejectionReason && (
                      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <p className="text-sm text-red-700">
                          <strong>Lý do từ chối:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="ml-4">
                  <Eye className="w-4 h-4 mr-1" />
                  Chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no requests) */}
      {mockRequests.length === 0 && (
        <Card className="border-teal-200">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-teal-200 mx-auto mb-4" />
            <h3 className="text-teal-600 mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa gửi yêu cầu tích dặm thủ công nào
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Tạo yêu cầu đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}