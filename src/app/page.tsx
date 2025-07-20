'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading, hasRole, canAccess } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    console.log('isLoading', isLoading);
    if (!isLoading && user) {
      if (hasRole('ADMIN')) {
        router.push('/admin');
      } else if (hasRole('SETTLEMENT_USER')) {
        router.push('/dashboard');
      } else if (hasRole('DRIVER')) {
        router.push('/mobile-report');
      }
    }
  }, [user, isLoading, hasRole, router]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-3">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  A.V.R. Gezem
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              {!user && (
                <Button onClick={handleLogin} variant="default">
                  כניסה למערכת
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
            מערכת ניהול פסולת ירוקה
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            פתרון מתקדם לניהול איסוף ומחזור פסולת ירוקה עבור רשויות מקומיות.
            המערכת מאפשרת תיעוד בשטח, חישוב מחירים אוטומטי והפקת דוחות מקיפים.
          </p>
          {!user && (
            <Button
              onClick={handleLogin}
              size="lg"
              className="text-lg px-8 py-3"
            >
              התחל עכשיו
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              תיעוד דיגיטלי
            </h3>
            <p className="text-gray-600">
              צילום מכלים, מדידת נפח ורישום הערות ישירות מהשטח
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              חישוב מחירים
            </h3>
            <p className="text-gray-600">
              חישוב עלויות אוטומטי על בסיס נפח ותעריפים מותאמים לכל יישוב
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              התראות אוטומטיות
            </h3>
            <p className="text-gray-600">
              שליחת התראות WhatsApp ליישובים עם פרטי האיסוף והמחיר
            </p>
          </div>
        </div>

        {/* Role-based Access Cards */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ברוך הבא, {user.email}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hasRole('ADMIN') && (
                <>
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      מערכת ניהול
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ניהול מלא של המערכת, משתמשים והגדרות
                    </p>
                    <Button
                      onClick={() => handleNavigate('/admin')}
                      className="w-full"
                    >
                      כניסה לניהול
                    </Button>
                  </div>

                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      דוחות ונתונים
                    </h3>
                    <p className="text-gray-600 mb-4">
                      צפייה בדוחות מקיפים וניתוח נתונים
                    </p>
                    <Button
                      onClick={() => handleNavigate('/dashboard')}
                      className="w-full"
                    >
                      צפייה בדוחות
                    </Button>
                  </div>

                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      ניהול תמחור
                    </h3>
                    <p className="text-gray-600 mb-4">
                      הגדרת תעריפים עבור יישובים וסוגי מכלים
                    </p>
                    <Button
                      onClick={() => handleNavigate('/settings')}
                      className="w-full"
                    >
                      הגדרות מערכת
                    </Button>
                  </div>
                </>
              )}

              {hasRole('SETTLEMENT_USER') && (
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    דוחות היישוב
                  </h3>
                  <p className="text-gray-600 mb-4">
                    צפייה בדוחות איסוף עבור היישוב שלך
                  </p>
                  <Button
                    onClick={() => handleNavigate('/dashboard')}
                    className="w-full"
                  >
                    צפייה בדוחות
                  </Button>
                </div>
              )}

              {hasRole('DRIVER') && (
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    דיווח איסוף
                  </h3>
                  <p className="text-gray-600 mb-4">
                    דיווח על איסוף מכלים מהשטח
                  </p>
                  <Button
                    onClick={() => handleNavigate('/mobile-report')}
                    className="w-full"
                  >
                    דיווח איסוף
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              אודות החברה
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              A.V.R. Gezem Ltd. מתמחה באיסוף ומחזור פסולת ירוקה עירונית והחזרת
              החומר המעובד ליישובים המקוריים. המערכת שלנו מאפשרת למפעילי שטח
              לתעד איסוף מכלים עם תמונות, נפחים והערות, תוך חישוב מחירים אוטומטי
              והודעות ליישובים.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>✓ ממשק בעברית עם תמיכת RTL</span>
              <span>✓ גישה מותאמת לפי תפקידים</span>
              <span>✓ דוחות מפורטים ואנליטיקה</span>
              <span>✓ אבטחת מידע מתקדמת</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 A.V.R. Gezem Ltd. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
