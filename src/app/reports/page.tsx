'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HebrewSelect } from '@/components/ui/hebrew-select';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  FileText,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Package,
  DollarSign,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  settlement_id: string;
  driver_id: string;
  container_type_id: string;
  volume: number;
  notes: string | null;
  image_url: string | null;
  image_public_id: string | null;
  unit_price: number;
  total_price: number;
  currency: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
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
  container_type?: {
    id: string;
    name: string;
    size: number;
    unit: string;
  };
}

interface Settlement {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface ContainerType {
  id: string;
  name: string;
  size: number;
  unit: string;
}

export default function ReportsPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    settlement_id: '',
    driver_id: '',
    container_type_id: '',
    date_from: '',
    date_to: '',
    price_min: '',
    price_max: '',
    search: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 20;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load reports when filters change
  useEffect(() => {
    loadReports();
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

      // Load drivers
      const driversResponse = await fetch('/api/drivers');
      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        if (driversData.success) {
          setDrivers(driversData.data || []);
        }
      }

      // Load container types
      const containerTypesResponse = await fetch('/api/tanks');
      if (containerTypesResponse.ok) {
        const containerTypesData = await containerTypesResponse.json();
        if (containerTypesData.success) {
          setContainerTypes(containerTypesData.data || []);
        }
      }

      await loadReports();
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

  const loadReports = async () => {
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

      const response = await fetch(`/api/reports?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
        setTotalReports(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הדוחות',
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
      driver_id: '',
      container_type_id: '',
      date_from: '',
      date_to: '',
      price_min: '',
      price_max: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const exportReports = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      queryParams.append('format', format);

      const response = await fetch(
        `/api/reports/export?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to export reports');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'הצלחה',
        description: `הדוחות יוצאו בהצלחה ל-${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בייצוא הדוחות',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
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
          <p className="text-gray-600">טוען דוחות...</p>
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
            { label: 'דוחות', isActive: true },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                דוחות איסוף
              </h1>
              <p className="text-text-secondary">
                צפה וסנן דוחות איסוף הפסולת הירוקה
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button onClick={() => loadReports()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
            <Button
              onClick={() => exportReports('excel')}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 ml-2" />
              ייצא Excel
            </Button>
            <Button
              onClick={() => exportReports('pdf')}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 ml-2" />
              ייצא PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            סינון דוחות
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>חיפוש</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש בהערות..."
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

          {/* Driver Filter */}
          <div className="space-y-2">
            <Label>נהג</Label>
            <HebrewSelect
              options={[
                { value: '', label: 'כל הנהגים' },
                ...drivers.map((d) => ({
                  value: d.id,
                  label: getDriverName(d),
                })),
              ]}
              value={filters.driver_id}
              onValueChange={(value) => handleFilterChange('driver_id', value)}
            />
          </div>

          {/* Container Type Filter */}
          <div className="space-y-2">
            <Label>סוג מכל</Label>
            <HebrewSelect
              options={[
                { value: '', label: 'כל סוגי המכלים' },
                ...containerTypes.map((ct) => ({
                  value: ct.id,
                  label: `${ct.name} (${ct.size} ${ct.unit})`,
                })),
              ]}
              value={filters.container_type_id}
              onValueChange={(value) =>
                handleFilterChange('container_type_id', value)
              }
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

          {/* Price Range */}
          <div className="space-y-2">
            <Label>מחיר מינימלי</Label>
            <Input
              type="number"
              placeholder="₪"
              value={filters.price_min}
              onChange={(e) => handleFilterChange('price_min', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>מחיר מקסימלי</Label>
            <Input
              type="number"
              placeholder="₪"
              value={filters.price_max}
              onChange={(e) => handleFilterChange('price_max', e.target.value)}
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">סיכום</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
            <p className="text-sm text-text-secondary">סה״כ דוחות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {reports
                .reduce((sum, report) => sum + report.volume, 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-text-secondary">נפח כולל (מ״ק)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatPrice(
                reports.reduce((sum, report) => sum + report.total_price, 0),
                'ILS'
              )}
            </p>
            <p className="text-sm text-text-secondary">ערך כולל</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {reports.filter((r) => r.notification_sent).length}
            </p>
            <p className="text-sm text-text-secondary">הודעות נשלחו</p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  יישוב
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  נהג
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג מכל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  נפח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר יחידה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר כולל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תמונה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  הודעה
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.settlement?.name || 'לא ידוע'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDriverName(report.driver)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.container_type
                      ? `${report.container_type.name} (${report.container_type.size} ${report.container_type.unit})`
                      : 'לא ידוע'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.volume} מ״ק
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(report.unit_price, report.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(report.total_price, report.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.image_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(report.image_url || '', '_blank')
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-gray-400">אין תמונה</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.notification_sent
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {report.notification_sent ? 'נשלחה' : 'לא נשלחה'}
                    </span>
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
                    {Math.min(currentPage * itemsPerPage, totalReports)}
                  </span>{' '}
                  מתוך <span className="font-medium">{totalReports}</span>{' '}
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
