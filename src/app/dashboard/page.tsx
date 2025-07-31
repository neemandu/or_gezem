'use client';

import { useState } from 'react';
import { LogOut, User, Settings, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
// import { getRoleDisplayName } from '@/lib/auth-utils';

export default function DashboardPage() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  if (isLoading) {
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
                {/* <p className="text-gray-500">{getRoleDisplayName(userRole)}</p> */}
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
                  {/* {getRoleDisplayName(userRole)} */}
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
                  </>
                )}
                {userRole === 'SETTLEMENT_USER' && (
                  <>
                    <p>✅ צפייה בלוח בקרה</p>
                    <p>✅ צפייה בדוחות של היישוב</p>
                    <p>✅ ניהול פרופיל אישי</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <Link
              href="/data"
              className="flex items-center space-x-3 space-x-reverse mb-4"
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">דוחות</h3>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              צפה בדוחות איסוף הפסולת הירוקה
            </p>
            <Button className="w-full" variant="outline">
              צפייה בדוחות
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Link
              href="/settings"
              className="flex items-center space-x-3 space-x-reverse mb-4"
            >
              <Settings className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">הגדרות</h3>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              נהל את הגדרות החשבון והיישוב
            </p>
            <Button className="w-full" variant="outline">
              עריכת הגדרות
            </Button>
          </div>
        </div>

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
