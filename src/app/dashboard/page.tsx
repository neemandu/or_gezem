'use client';

import { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
  Users,
  Building,
  Package,
  Bell,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getRoleDisplayName } from '@/lib/auth-utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  totalReports: number;
  todayReports: number;
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

export default function DashboardPage() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingData(true);

        const response = await fetch('/api/analytics?days=30');
        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error(data.error || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בטעינת נתוני לוח הבקרה',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user && userRole) {
      loadDashboardData();
    }
  }, [user, userRole, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(2)} מ״ק`;
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען לוח בקרה...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null; // Middleware will handle redirect
  }

  // Role-specific navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'דוחות',
        description: 'צפה בדוחות איסוף הפסולת הירוקה',
        href: '/reports',
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
    ];

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        {
          title: 'ניהול יישובים',
          description: 'נהל יישובים ואנשי קשר',
          href: '/settings/cities',
          icon: Building,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          title: 'ניהול נהגים',
          description: 'נהל נהגים והרשאות',
          href: '/settings/drivers',
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          title: 'ניהול מכלים',
          description: 'נהל סוגי מכלים וגדלים',
          href: '/settings/tanks',
          icon: Package,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
        {
          title: 'ניהול תמחור',
          description: 'נהל מחירים עבור יישובים ומכלים',
          href: '/settings/pricing',
          icon: DollarSign,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
        {
          title: 'פאנל ניהול',
          description: 'גישה מלאה למערכת הניהול',
          href: '/admin',
          icon: Settings,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
        },
      ];
    }

    if (userRole === 'SETTLEMENT_USER') {
      return [
        ...baseItems,
        {
          title: 'הגדרות יישוב',
          description: 'נהל הגדרות היישוב שלך',
          href: '/settings',
          icon: Settings,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          title: 'תמחור',
          description: 'צפה במחירים עבור היישוב שלך',
          href: '/pricing',
          icon: DollarSign,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
      ];
    }

    if (userRole === 'DRIVER') {
      return [
        {
          title: 'דיווח איסוף',
          description: 'שלח דיווח איסוף חדש',
          href: '/report',
          icon: MapPin,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          title: 'הדוחות שלי',
          description: 'צפה בדוחות ששלחת',
          href: '/my-reports',
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">לוח בקרה</h1>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{user.email}</p>
                <p className="text-gray-500">{getRoleDisplayName(userRole)}</p>
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={isSigningOut}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <LogOut className="h-4 w-4" />
                <span>{isSigningOut ? 'יוצא...' : 'יציאה'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ברוך הבא, {user.email}!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                פרטי המשתמש
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">כתובת מייל:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">תפקיד:</span>{' '}
                  {getRoleDisplayName(userRole)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">הרשאות</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {userRole === 'ADMIN' && (
                  <>
                    <p>✅ גישה מלאה למערכת</p>
                    <p>✅ ניהול משתמשים ויישובים</p>
                    <p>✅ צפייה בכל הדוחות</p>
                    <p>✅ ניהול תמחור</p>
                  </>
                )}
                {userRole === 'SETTLEMENT_USER' && (
                  <>
                    <p>✅ צפייה בלוח בקרה</p>
                    <p>✅ צפייה בדוחות של היישוב</p>
                    <p>✅ ניהול פרופיל אישי</p>
                    <p>✅ צפייה בתמחור</p>
                  </>
                )}
                {userRole === 'DRIVER' && (
                  <>
                    <p>✅ שליחת דיווחי איסוף</p>
                    <p>✅ צפייה בדוחות אישיים</p>
                    <p>✅ גישה למידע יישובים</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className={`p-2 rounded-lg ${item.bgColor}`}>
                      <Icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {item.description}
                  </p>
                  <Button className="w-full" variant="outline">
                    עבור ל{item.title}
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            סטטיסטיקות מהירות
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.todayReports || 0}
                </p>
              </div>
              <p className="text-sm text-gray-600">דוחות היום</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData
                    ? formatVolume(dashboardData.totalVolume)
                    : '0 מ״ק'}
                </p>
              </div>
              <p className="text-sm text-gray-600">נפח כולל (מ״ק)</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData
                    ? formatPrice(dashboardData.totalRevenue)
                    : '₪0'}
                </p>
              </div>
              <p className="text-sm text-gray-600">ערך כולל</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.totalNotifications || 0}
                </p>
              </div>
              <p className="text-sm text-gray-600">הודעות נשלחו</p>
            </div>
          </div>
        </div>

        {/* Admin Statistics */}
        {userRole === 'ADMIN' && dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                סקירת המערכת
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">סה״כ יישובים</span>
                  <span className="font-medium">
                    {dashboardData.settlementsCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">סה״כ נהגים</span>
                  <span className="font-medium">
                    {dashboardData.driversCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">סוגי מכלים</span>
                  <span className="font-medium">
                    {dashboardData.containerTypesCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">סה״כ דוחות</span>
                  <span className="font-medium">
                    {dashboardData.totalReports}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Settlements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                היישובים המובילים
              </h3>
              <div className="space-y-3">
                {dashboardData.topSettlements
                  .slice(0, 5)
                  .map((settlement, index) => (
                    <div
                      key={settlement.settlement_id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium">
                          {settlement.settlement_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPrice(settlement.total_revenue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {settlement.reports_count} דוחות
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Trends */}
        {dashboardData && dashboardData.reportsByMonth.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              מגמות חודשיות
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.reportsByMonth.map((monthData, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {monthData.month}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">דוחות:</span>
                      <span className="font-medium">{monthData.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">נפח:</span>
                      <span className="font-medium">
                        {formatVolume(monthData.volume)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">הכנסות:</span>
                      <span className="font-medium">
                        {formatPrice(monthData.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            סטטוס המערכת
          </h3>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              המערכת פועלת תקין - כל השירותים זמינים
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
