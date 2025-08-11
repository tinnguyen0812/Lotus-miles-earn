import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ManualMilesRequest() {
  const [formData, setFormData] = useState({
    requestType: '',
    flightNumber: '',
    route: '',
    flightDate: '',
    bookingReference: '',
    ticketNumber: '',
    description: '',
    expectedMiles: ''
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
      toast.success(`Đã thêm ${files.length} file`);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('Đã xóa file');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    toast.success('Yêu cầu đã được gửi thành công! Chúng tôi sẽ xem xét trong vòng 3-5 ngày làm việc.');
    
    // Reset form
    setFormData({
      requestType: '',
      flightNumber: '',
      route: '',
      flightDate: '',
      bookingReference: '',
      ticketNumber: '',
      description: '',
      expectedMiles: ''
    });
    setAttachedFiles([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-600">Gửi yêu cầu tích dặm thủ công</h2>
        <p className="text-gray-600">
          Gửi yêu cầu cho các chuyến bay hoặc giao dịch chưa được tích dặm tự động
        </p>
      </div>

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">Thông tin yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div className="space-y-2">
              <Label htmlFor="requestType">Loại yêu cầu *</Label>
              <Select 
                value={formData.requestType} 
                onValueChange={(value) => handleInputChange('requestType', value)}
              >
                <SelectTrigger className="border-teal-200 focus:border-teal-600">
                  <SelectValue placeholder="Chọn loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing-flight">Chuyến bay bị thiếu dặm</SelectItem>
                  <SelectItem value="partner-purchase">Mua sắm tại đối tác</SelectItem>
                  <SelectItem value="credit-card">Thanh toán thẻ tín dụng</SelectItem>
                  <SelectItem value="hotel-stay">Lưu trú khách sạn</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flight Information (if flight related) */}
            {(formData.requestType === 'missing-flight') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Số hiệu chuyến bay</Label>
                  <Input
                    id="flightNumber"
                    placeholder="VN210"
                    value={formData.flightNumber}
                    onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Tuyến bay</Label>
                  <Input
                    id="route"
                    placeholder="SGN - HAN"
                    value={formData.route}
                    onChange={(e) => handleInputChange('route', e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flightDate">Ngày bay</Label>
                  <Input
                    id="flightDate"
                    type="date"
                    value={formData.flightDate}
                    onChange={(e) => handleInputChange('flightDate', e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedMiles">Số dặm mong đợi</Label>
                  <Input
                    id="expectedMiles"
                    type="number"
                    placeholder="1250"
                    value={formData.expectedMiles}
                    onChange={(e) => handleInputChange('expectedMiles', e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
              </div>
            )}

            {/* Booking Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingReference">Mã đặt chỗ / Số hóa đơn</Label>
                <Input
                  id="bookingReference"
                  placeholder="ABC123 hoặc số hóa đơn"
                  value={formData.bookingReference}
                  onChange={(e) => handleInputChange('bookingReference', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Số vé / Số tham chiếu</Label>
                <Input
                  id="ticketNumber"
                  placeholder="Số vé máy bay hoặc số tham chiếu"
                  value={formData.ticketNumber}
                  onChange={(e) => handleInputChange('ticketNumber', e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết *</Label>
              <Textarea
                id="description"
                placeholder="Vui lòng mô tả chi tiết về giao dịch của bạn..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="border-teal-200 focus:border-teal-600 min-h-[100px]"
                required
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Đính kèm file chứng minh *</Label>
              <div className="border-2 border-dashed border-teal-200 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Kéo thả file hoặc click để chọn
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Hỗ trợ: PDF, JPG, PNG, DOC (Tối đa 10MB)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Chọn file
                </Button>
              </div>
              
              {/* Attached Files List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>File đã đính kèm:</Label>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-teal-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!formData.requestType || !formData.description || attachedFiles.length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi yêu cầu
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-600">Lưu ý quan trọng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-blue-700">
            • Yêu cầu cần được gửi trong vòng 6 tháng kể từ ngày thực hiện giao dịch
          </p>
          <p className="text-sm text-blue-700">
            • Vui lòng đính kèm đầy đủ chứng từ: vé máy bay, hóa đơn, biên lai thanh toán
          </p>
          <p className="text-sm text-blue-700">
            • Thời gian xử lý: 3-5 ngày làm việc
          </p>
          <p className="text-sm text-blue-700">
            • Bạn có thể theo dõi trạng thái yêu cầu trong phần "Theo dõi yêu cầu"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}