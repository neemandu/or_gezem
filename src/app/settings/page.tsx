'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Building, Users, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

interface QuickStats {
  settlementsCount: number;
  driversCount: number;
  tanksCount: number;
}

const settingsTabs: TabItem[] = [
  {
    id: 'settlements',
    label: 'יישובים',
    href: '/settings/cities',
    icon: Building,
    description: 'ניהול יישובים, אנשי קשר ופרטי התקשרות',
  },
  {
    id: 'drivers',
    label: 'נהגים',
    href: '/settings/drivers',
    icon: Users,
    description: 'ניהול נהגים, הרשאות וסטטוס פעילות',
  },
  {
    id: 'containers',
    label: 'סוגי מכלים',
    href: '/settings/tanks',
    icon: Package,
    description: 'ניהול סוגי מכלים, גדלים ויחידות',
  },
  {
    id: 'pricing',
    label: 'תמחור',
    href: '/settings/pricing',
    icon: DollarSign,
    description: 'ניהול מחירים עבור יישובים וסוגי מכלים',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats>({
    settlementsCount: 0,
    driversCount: 0,
    tanksCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הגדרות', isActive: true },
          ]}
        />

        <div className="flex items-center space-x-3 space-x-reverse">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              הגדרות מערכת
            </h1>
            <p className="text-text-secondary">
              נהל את הגדרות המערכת וקבע תצורות
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <div
              key={tab.id}
              className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow p-6 space-y-4"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {tab.label}
                </h3>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed">
                {tab.description}
              </p>

              <Button
                onClick={() => handleTabClick(tab.href)}
                className="w-full"
                variant="outline"
              >
                עבור לניהול {tab.label}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          סיכום מהיר
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {loading ? '...' : stats.settlementsCount}
            </p>
            <p className="text-sm text-text-secondary">יישובים פעילים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : stats.driversCount}
            </p>
            <p className="text-sm text-text-secondary">נהגים רשומים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : stats.tanksCount}
            </p>
            <p className="text-sm text-text-secondary">סוגי מכלים</p>
          </div>
        </div>
      </div>
    </div>
  );
}
