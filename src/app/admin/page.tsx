'use client';

import { useState } from 'react';
import { LogOut, Users, Building, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getRoleDisplayName } from '@/lib/auth-utils';

export default function AdminPage() {
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
          <p className="text-gray-600">טוען פאנל ניהול...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || userRole !== 'ADMIN') {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Settings className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                פאנל ניהול
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
            ברוך הבא למערכת הניהול!
          </h2>
          <p className="text-gray-600">
            כמנהל מערכת, יש לך גישה מלאה לכל התכונות והנתונים במערכת.
          </p>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                ניהול משתמשים
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              נהל משתמשים, הרשאות ותפקידים במערכת
            </p>
            <Button className="w-full" variant="outline">
              ניהול משתמשים
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <Building className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">
                ניהול יישובים
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              נהל יישובים, הגדרות איסוף ודוחות
            </p>
            <Button className="w-full" variant="outline">
              ניהול יישובים
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <Settings className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">
                הגדרות מערכת
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              נהל הגדרות כלליות ותצורת המערכת
            </p>
            <Button className="w-full" variant="outline">
              הגדרות מערכת
            </Button>
          </div>
        </div>

        {/* System Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            סטטיסטיקות המערכת
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600">משתמשים פעילים</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">יישובים רשומים</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600">דוחות השבוע</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
