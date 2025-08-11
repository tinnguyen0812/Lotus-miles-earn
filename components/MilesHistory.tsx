import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, MapPin, ShoppingBag, Plane } from 'lucide-react';

interface MileTransaction {
  id: string;
  type: 'flight' | 'partner' | 'bonus' | 'manual';
  description: string;
  date: string;
  miles: number;
  status: 'completed' | 'pending' | 'rejected';
}

const mockTransactions: MileTransaction[] = [
  {
    id: '1',
    type: 'flight',
    description: 'Chuyến bay SGN → HAN (VN210)',
    date: '2025-08-08',
    miles: 1250,
    status: 'completed'
  },
  {
    id: '2',
    type: 'partner',
    description: 'Mua sắm tại Vincom - Hóa đơn #VIN123456',
    date: '2025-08-05',
    miles: 500,
    status: 'completed'
  },
  {
    id: '3',
    type: 'manual',
    description: 'Yêu cầu tích dặm thủ công - Chuyến bay quốc tế',
    date: '2025-08-03',
    miles: 2000,
    status: 'pending'
  },
  {
    id: '4',
    type: 'flight',
    description: 'Chuyến bay HAN → SGN (VN215)',
    date: '2025-07-28',
    miles: 1250,
    status: 'completed'
  },
  {
    id: '5',
    type: 'bonus',
    description: 'Thưởng đăng ký thành viên mới',
    date: '2025-07-15',
    miles: 1000,
    status: 'completed'
  },
  {
    id: '6',
    type: 'partner',
    description: 'Thanh toán qua VietinBank Credit Card',
    date: '2025-07-12',
    miles: 300,
    status: 'completed'
  }
];

export function MilesHistory() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'partner':
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      case 'manual':
        return <MapPin className="w-4 h-4 text-orange-600" />;
      default:
        return <Calendar className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Đã cộng</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Đang xử lý</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
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
          <h2 className="text-teal-600">Lịch sử tích dặm</h2>
          <p className="text-gray-600">Theo dõi tất cả các giao dịch tích dặm của bạn</p>
        </div>
      </div>

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-teal-100">
                <TableHead className="text-teal-600">Loại giao dịch</TableHead>
                <TableHead className="text-teal-600">Mô tả</TableHead>
                <TableHead className="text-teal-600">Ngày giao dịch</TableHead>
                <TableHead className="text-teal-600">Số dặm</TableHead>
                <TableHead className="text-teal-600">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id} 
                  className={index % 2 === 0 ? 'bg-teal-50/30' : 'bg-white'}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="capitalize">
                        {transaction.type === 'flight' && 'Chuyến bay'}
                        {transaction.type === 'partner' && 'Đối tác'}
                        {transaction.type === 'manual' && 'Thủ công'}
                        {transaction.type === 'bonus' && 'Thưởng'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{transaction.description}</div>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-teal-700">
                      +{transaction.miles.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-teal-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">6,300</div>
              <p className="text-sm text-gray-600">Tổng dặm tháng này</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">4</div>
              <p className="text-sm text-gray-600">Giao dịch hoàn thành</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <p className="text-sm text-gray-600">Đang chờ xử lý</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}