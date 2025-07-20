'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ShieldX, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'ADMIN':
        router.push('/data');
        break;
      case 'SETTLEMENT_USER':
        router.push('/data');
        break;
      case 'DRIVER':
        router.push('/report');
        break;
      default:
        router.push('/login');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8 p-6">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-error/10 p-6">
              <ShieldX className="h-16 w-16 text-error" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-text-primary">
              אין הרשאה לגישה
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              אין לך הרשאה לגשת לדף זה. אנא פנה למנהל המערכת או חזור לדף הבית.
            </p>
          </div>

          {user && (
            <div className="bg-primary-gray-100 rounded-lg p-4 text-sm">
              <p className="text-text-secondary">
                <strong>משתמש:</strong> {user.email}
              </p>
              <p className="text-text-secondary">
                <strong>תפקיד:</strong> {user.role === 'ADMIN' && 'מנהל מערכת'}
                {user.role === 'SETTLEMENT_USER' && 'משתמש יישוב'}
                {user.role === 'DRIVER' && 'נהג'}
              </p>
              {/* {user.settlement && (
                <p className="text-text-secondary">
                  <strong>יישוב:</strong> {user.settlement.name}
                </p> */}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoHome}
            className="w-full space-x-2 space-x-reverse"
          >
            <Home className="h-4 w-4" />
            <span>חזור לדף הבית</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-full"
          >
            חזור לדף הקודם
          </Button>
        </div>
      </div>
    </div>
  );
}
