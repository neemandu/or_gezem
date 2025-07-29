'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HebrewSelect } from '@/components/ui/hebrew-select';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  Bell,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  report_id: string;
  type: 'WHATSAPP';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  green_api_message_id: string | null;
  message: string;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  report?: {
    id: string;
    settlement_id: string;
    driver_id: string;
    volume: number;
    total_price: number;
    currency: string;
    settlement?: {
      id: string;
      name: string;
    };
    driver?: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

interface Settlement {
  id: string;
  name: string;
}

export default function NotificationsPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    settlement_id: '',
    status: '',
    date_from: '',
    date_to: '',
    search: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const itemsPerPage = 20;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load notifications when filters change
  useEffect(() => {
    loadNotifications();
  }, [filters, currentPage]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load settlements
      const settlementsResponse = await fetch('/api/settlements');
      if (settlementsResponse.ok) {
        const settlementsData = await settlementsResponse.json();
        if (settlementsData.success) {
          setSettlements(settlementsData.data || []);
        }
      }

      await loadNotifications();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הנתונים',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      // Add pagination
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());

      const response = await fetch(
        `/api/notifications?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
        setTotalNotifications(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת ההודעות',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      settlement_id: '',
      status: '',
      date_from: '',
      date_to: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency || 'ILS',
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'SENT':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'נמסרה';
      case 'SENT':
        return 'נשלחה';
      case 'FAILED':
        return 'נכשלה';
      case 'PENDING':
        return 'ממתינה';
      default:
        return 'לא ידוע';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriverName = (driver: any) => {
    if (driver?.first_name && driver?.last_name) {
      return `${driver.first_name} ${driver.last_name}`;
    }
    return driver?.email || 'לא ידוע';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען הודעות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הודעות', isActive: true },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                הודעות WhatsApp
              </h1>
              <p className="text-text-secondary">
                מעקב אחר הודעות שנשלחו ליישובים
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              onClick={() => loadNotifications()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            סינון הודעות
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>חיפוש</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש בהודעות..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Settlement Filter */}
          {userRole === 'ADMIN' && (
            <div className="space-y-2">
              <Label>יישוב</Label>
              <HebrewSelect
                options={[
                  { value: '', label: 'כל היישובים' },
                  ...settlements.map((s) => ({ value: s.id, label: s.name })),
                ]}
                value={filters.settlement_id}
                onValueChange={(value) =>
                  handleFilterChange('settlement_id', value)
                }
              />
            </div>
          )}

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>סטטוס</Label>
            <HebrewSelect
              options={[
                { value: '', label: 'כל הסטטוסים' },
                { value: 'PENDING', label: 'ממתינה' },
                { value: 'SENT', label: 'נשלחה' },
                { value: 'DELIVERED', label: 'נמסרה' },
                { value: 'FAILED', label: 'נכשלה' },
              ]}
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>מתאריך</Label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>עד תאריך</Label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              נקה סינון
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          סיכום הודעות
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalNotifications}
            </p>
            <p className="text-sm text-text-secondary">סה״כ הודעות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.status === 'DELIVERED').length}
            </p>
            <p className="text-sm text-text-secondary">נמסרו</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {notifications.filter((n) => n.status === 'PENDING').length}
            </p>
            <p className="text-sm text-text-secondary">ממתינות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.status === 'FAILED').length}
            </p>
            <p className="text-sm text-text-secondary">נכשלו</p>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך יצירה
                </th>
                {userRole === 'ADMIN' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    יישוב
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  נהג
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  נפח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך שליחה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך מסירה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  הודעה
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(notification.created_at)}
                  </td>
                  {userRole === 'ADMIN' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.report?.settlement?.name || 'לא ידוע'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDriverName(notification.report?.driver)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.report?.volume} מ״ק
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.report
                      ? formatPrice(
                          notification.report.total_price,
                          notification.report.currency
                        )
                      : 'לא ידוע'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(notification.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}
                      >
                        {getStatusText(notification.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.sent_at
                      ? formatDate(notification.sent_at)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.delivered_at
                      ? formatDate(notification.delivered_at)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(notification.message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                הקודם
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                הבא
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  מציג{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  עד{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalNotifications)}
                  </span>{' '}
                  מתוך <span className="font-medium">{totalNotifications}</span>{' '}
                  תוצאות
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    הקודם
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="mx-1"
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    הבא
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
