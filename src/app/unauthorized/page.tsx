'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, Home, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getDefaultRedirectUrl, getRoleDisplayName } from '@/lib/auth-utils';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const handleGoHome = () => {
    if (user) {
      const homeUrl = getDefaultRedirectUrl(user);
      router.push(homeUrl);
    } else {
      router.push('/login');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-red-100 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            אין הרשאה לגישה
          </h1>

          {/* Message */}
          <div className="mb-6 space-y-3">
            <p className="text-gray-600">אין לך הרשאה לגשת לעמוד זה</p>

            {user && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>משתמש מחובר:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>תפקיד:</strong> {getRoleDisplayName(user.role)}
                </p>
                {user.settlement?.name && (
                  <p className="text-sm text-gray-700">
                    <strong>יישוב:</strong> {user.settlement.name}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500">
              אם אתה חושב שזו שגיאה, צור קשר עם מנהל המערכת
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <Home className="h-4 w-4" />
                <span>חזור לעמוד הבית</span>
              </div>
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <ArrowRight className="h-4 w-4" />
                <span>התנתק ממערכת</span>
              </div>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              במידת הצורך, פנה למנהל המערכת לקבלת הרשאות נוספות
            </p>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
            הרשאות לפי תפקיד:
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>גישה מלאה למערכת</span>
              <span className="text-green-600 font-medium">מנהל מערכת</span>
            </div>
            <div className="flex justify-between items-center">
              <span>לוח בקרה ודוחות</span>
              <span className="text-blue-600 font-medium">משתמש יישוב</span>
            </div>
            <div className="flex justify-between items-center">
              <span>דיווח נייד בלבד</span>
              <span className="text-purple-600 font-medium">נהג</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
