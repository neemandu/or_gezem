'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  DollarSign,
  Package,
  Building,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Pricing {
  id: string;
  settlement_id: string;
  container_type_id: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settlement?: {
    id: string;
    name: string;
  };
  container_type?: {
    id: string;
    name: string;
    size: number;
    unit: string;
  };
}

interface ContainerType {
  id: string;
  name: string;
  size: number;
  unit: string;
}

export default function PricingPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlementName, setSettlementName] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load container types
      const containerTypesResponse = await fetch('/api/tanks');
      if (containerTypesResponse.ok) {
        const containerTypesData = await containerTypesResponse.json();
        if (containerTypesData.success) {
          setContainerTypes(containerTypesData.data || []);
        }
      }

      // Load pricing for the user's settlement
      if (userRole === 'SETTLEMENT_USER' && user?.id) {
        // First get user profile to get settlement_id
        const userProfileResponse = await fetch(`/api/users/${user.id}`);
        if (userProfileResponse.ok) {
          const userProfileData = await userProfileResponse.json();
          if (userProfileData.success && userProfileData.data?.settlement_id) {
            const pricingResponse = await fetch(
              `/api/pricing/settlement/${userProfileData.data.settlement_id}`
            );
            if (pricingResponse.ok) {
              const pricingData = await pricingResponse.json();
              if (pricingData.success) {
                setPricing(pricingData.data || []);

                // Get settlement name from first pricing record
                if (pricingData.data && pricingData.data.length > 0) {
                  setSettlementName(pricingData.data[0].settlement?.name || '');
                }
              }
            }
          }
        }
      } else if (userRole === 'ADMIN') {
        // Load all pricing for admin
        const pricingResponse = await fetch('/api/pricing');
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          if (pricingData.success) {
            setPricing(pricingData.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת נתוני התמחור',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency || 'ILS',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getContainerTypeName = (containerTypeId: string) => {
    const containerType = containerTypes.find(
      (ct) => ct.id === containerTypeId
    );
    return containerType
      ? `${containerType.name} (${containerType.size} ${containerType.unit})`
      : 'לא ידוע';
  };

  const getSettlementName = (settlementId: string) => {
    const pricingRecord = pricing.find((p) => p.settlement_id === settlementId);
    return pricingRecord?.settlement?.name || 'לא ידוע';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען תמחור...</p>
        </div>
      </div>
    );
  }

  if (!user || (userRole !== 'ADMIN' && userRole !== 'SETTLEMENT_USER')) {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'תמחור', isActive: true },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">תמחור</h1>
              <p className="text-text-secondary">
                {userRole === 'ADMIN'
                  ? 'ניהול תמחור עבור כל היישובים'
                  : `תמחור עבור יישוב: ${settlementName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Button onClick={() => loadData()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          סיכום תמחור
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{pricing.length}</p>
            <p className="text-sm text-text-secondary">סה״כ פריטי תמחור</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {pricing.filter((p) => p.is_active).length}
            </p>
            <p className="text-sm text-text-secondary">פריטים פעילים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {userRole === 'ADMIN'
                ? new Set(pricing.map((p) => p.settlement_id)).size
                : 1}
            </p>
            <p className="text-sm text-text-secondary">יישובים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {new Set(pricing.map((p) => p.container_type_id)).size}
            </p>
            <p className="text-sm text-text-secondary">סוגי מכלים</p>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {userRole === 'ADMIN' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    יישוב
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג מכל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מטבע
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך עדכון
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricing.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {userRole === 'ADMIN' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSettlementName(item.settlement_id)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getContainerTypeName(item.container_type_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(item.price, item.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pricing.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              אין פריטי תמחור
            </h3>
            <p className="text-gray-500">
              {userRole === 'ADMIN'
                ? 'לא נמצאו פריטי תמחור במערכת'
                : 'לא נמצאו פריטי תמחור עבור היישוב שלך'}
            </p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          מידע נוסף
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">איך עובד התמחור</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• המחיר מחושב לפי נפח המכל</li>
              <li>• המחיר כולל איסוף, הובלה ועיבוד</li>
              <li>• התמחור מתעדכן באופן קבוע</li>
              <li>• הודעות נשלחות אוטומטית ליישוב</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">פרטי התקשרות</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• לשאלות על תמחור: פנה למנהל המערכת</li>
              <li>• עדכוני מחירים: מתבצעים על ידי המנהל</li>
              <li>• הודעות: נשלחות אוטומטית לווטסאפ</li>
              <li>• דוחות: זמינים בלוח הבקרה</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
