'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Building,
  Users,
  Bell,
  RefreshCw,
  Download,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalReports: number;
  totalVolume: number;
  totalRevenue: number;
  totalNotifications: number;
  settlementsCount: number;
  driversCount: number;
  containerTypesCount: number;
  reportsByMonth: Array<{
    month: string;
    count: number;
    volume: number;
    revenue: number;
  }>;
  topSettlements: Array<{
    settlement_id: string;
    settlement_name: string;
    reports_count: number;
    total_volume: number;
    total_revenue: number;
  }>;
  topDrivers: Array<{
    driver_id: string;
    driver_name: string;
    reports_count: number;
    total_volume: number;
  }>;
  containerTypeStats: Array<{
    container_type_id: string;
    container_type_name: string;
    usage_count: number;
    total_volume: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  // Load initial data
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/analytics?days=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת נתוני האנליטיקה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(2)} מ״ק`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען אנליטיקה...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'ADMIN') {
    return null; // Middleware will handle redirect
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            אין נתונים זמינים
          </h3>
          <p className="text-gray-500">לא נמצאו נתונים לאנליטיקה</p>
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
            { label: 'אנליטיקה', isActive: true },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">אנליטיקה</h1>
              <p className="text-text-secondary">
                נתונים סטטיסטיים וניתוח ביצועי המערכת
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7">7 ימים אחרונים</option>
              <option value="30">30 ימים אחרונים</option>
              <option value="90">90 ימים אחרונים</option>
              <option value="365">שנה אחרונה</option>
            </select>
            <Button onClick={() => loadAnalytics()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
            <Button
              onClick={() => {
                /* Export functionality */
              }}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 ml-2" />
              ייצא
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">סה״כ דוחות</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.totalReports}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">נפח כולל</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatVolume(analyticsData.totalVolume)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">הכנסות</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(analyticsData.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">הודעות נשלחו</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.totalNotifications}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Building className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">יישובים</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {analyticsData.settlementsCount}
          </p>
          <p className="text-sm text-gray-600">יישובים פעילים במערכת</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Users className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">נהגים</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {analyticsData.driversCount}
          </p>
          <p className="text-sm text-gray-600">נהגים רשומים במערכת</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Package className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">סוגי מכלים</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {analyticsData.containerTypesCount}
          </p>
          <p className="text-sm text-gray-600">סוגי מכלים זמינים</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Settlements */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            יישובים מובילים
          </h3>
          <div className="space-y-4">
            {analyticsData.topSettlements
              .slice(0, 5)
              .map((settlement, index) => (
                <div
                  key={settlement.settlement_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {settlement.settlement_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {settlement.reports_count} דוחות
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(settlement.total_revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatVolume(settlement.total_volume)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Drivers */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            נהגים מובילים
          </h3>
          <div className="space-y-4">
            {analyticsData.topDrivers.slice(0, 5).map((driver, index) => (
              <div
                key={driver.driver_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {driver.driver_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {driver.reports_count} דוחות
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatVolume(driver.total_volume)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Container Type Usage */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          שימוש בסוגי מכלים
        </h3>
        <div className="space-y-4">
          {analyticsData.containerTypeStats.map((containerType) => (
            <div
              key={containerType.container_type_id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {containerType.container_type_name}
                </p>
                <p className="text-sm text-gray-600">
                  {containerType.usage_count} שימושים
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatVolume(containerType.total_volume)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          מגמות חודשיות
        </h3>
        <div className="space-y-4">
          {analyticsData.reportsByMonth.map((monthData) => (
            <div
              key={monthData.month}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{monthData.month}</p>
                <p className="text-sm text-gray-600">{monthData.count} דוחות</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatPrice(monthData.revenue)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatVolume(monthData.volume)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
