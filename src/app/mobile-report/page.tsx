'use client';

import { useState } from 'react';
import { LogOut, Truck, Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getRoleDisplayName } from '@/lib/auth-utils';

export default function MobileReportPage() {
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
          <p className="text-gray-600">טוען דיווח נייד...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || !['ADMIN', 'DRIVER'].includes(userRole)) {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Truck className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                דיווח נייד
              </h1>
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
            דיווח איסוף פסולת ירוקה
          </h2>
          <p className="text-gray-600">
            השתמש באפליקציה כדי לדווח על איסוף פסולת ירוקה ביישובים השונים.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <Camera className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">דיווח חדש</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              צלם ודווח על איסוף פסולת ירוקה
            </p>
            <Button className="w-full" variant="default">
              התחל דיווח
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <MapPin className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">
                מיקומי איסוף
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              צפה במיקומי האיסוף המתוכננים להיום
            </p>
            <Button className="w-full" variant="outline">
              צפייה במפה
            </Button>
          </div>
        </div>

        {/* Today's Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">דוחות היום</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">אין דוחות להיום</p>
            <p className="text-sm text-gray-400 mt-2">
              התחל דיווח חדש כדי לראות את הדוחות שלך כאן
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
