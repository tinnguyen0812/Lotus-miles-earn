import { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { 
  Home, 
  History, 
  Send, 
  Search, 
  User, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userEmail: string;
  children: React.ReactNode;
}

export function Layout({ currentView, onViewChange, onLogout, userEmail, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'history', label: 'Lịch sử tích điểm', icon: History },
    { id: 'manual-request', label: 'Yêu cầu tích dặm', icon: Send },
    { id: 'request-tracking', label: 'Theo dõi yêu cầu', icon: Search },
    { id: 'account-info', label: 'Thông tin tài khoản', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="sm" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200
                      ${currentView === item.id 
                        ? 'bg-teal-100 text-teal-700 font-medium' 
                        : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop User Info & Logout */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 max-w-32 truncate">
                  {userEmail}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-teal-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left
                      ${currentView === item.id 
                        ? 'bg-teal-100 text-teal-700 font-medium' 
                        : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
                
                <div className="px-4 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}