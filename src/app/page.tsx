'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TruckIcon, CalculatorIcon, BellIcon, ShieldIcon } from 'lucide-react';

export default function Home() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <TruckIcon className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">
            מערכת ניהול פסולת ירוקה
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            פתרון מתקדם לניהול איסוף ומחזור פסולת ירוקה עבור רשויות מקומיות.
            המערכת מאפשרת תיעוד בשטח, חישוב מחירים אוטומטי והפקת דוחות מקיפים.
          </p>
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="text-lg px-8 py-3"
          >
            כניסה למערכת
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              תיעוד דיגיטלי
            </h3>
            <p className="text-text-secondary">
              צילום מכלים, מדידת נפח ורישום הערות ישירות מהשטח
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CalculatorIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              חישוב מחירים
            </h3>
            <p className="text-text-secondary">
              חישוב עלויות אוטומטי על בסיס נפח ותעריפים מותאמים לכל יישוב
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              התראות אוטומטיות
            </h3>
            <p className="text-text-secondary">
              שליחת התראות WhatsApp ליישובים עם פרטי האיסוף והמחיר
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">
          ברוך הבא למערכת ניהול פסולת ירוקה
        </h1>
        <p className="text-text-secondary">
          שלום {user.email} - {user.role === 'ADMIN' && 'מנהל מערכת'}
          {user.role === 'SETTLEMENT_USER' && 'משתמש יישוב'}
          {user.role === 'DRIVER' && 'נהג'}
        </p>
      </div>

      {/* Role-based Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasRole('ADMIN') && (
          <>
            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center">
                  <ShieldIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    מערכת ניהול
                  </h3>
                  <p className="text-text-secondary mb-4">
                    ניהול מלא של המערכת, משתמשים והגדרות
                  </p>
                </div>
                <Button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full"
                >
                  כניסה לניהול
                </Button>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center">
                  <CalculatorIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    ניהול תמחור
                  </h3>
                  <p className="text-text-secondary mb-4">
                    הגדרת תעריפים עבור יישובים וסוגי מכלים
                  </p>
                </div>
                <Button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full"
                >
                  הגדרות מערכת
                </Button>
              </div>
            </div>
          </>
        )}

        {(hasRole('ADMIN') || hasRole('SETTLEMENT_USER')) && (
          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {hasRole('ADMIN') ? 'דוחות ונתונים' : 'דוחות היישוב'}
                </h3>
                <p className="text-text-secondary mb-4">
                  {hasRole('ADMIN')
                    ? 'צפייה בדוחות מקיפים וניתוח נתונים'
                    : 'צפייה בדוחות איסוף עבור היישוב שלך'}
                </p>
              </div>
              <Button
                onClick={() => handleNavigate('/data')}
                className="w-full"
              >
                צפייה בדוחות
              </Button>
            </div>
          </div>
        )}

        {hasRole('DRIVER') && (
          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-blue-200 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  דיווח איסוף
                </h3>
                <p className="text-text-secondary mb-4">
                  דיווח על איסוף מכלים מהשטח
                </p>
              </div>
              <Button
                onClick={() => handleNavigate('/report')}
                className="w-full"
              >
                דיווח איסוף
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="bg-card rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          אודות החברה
        </h2>
        <p className="text-text-secondary max-w-3xl mx-auto mb-6">
          A.V.R. Gezem Ltd. מתמחה באיסוף ומחזור פסולת ירוקה עירונית והחזרת החומר
          המעובד ליישובים המקוריים. המערכת שלנו מאפשרת למפעילי שטח לתעד איסוף
          מכלים עם תמונות, נפחים והערות, תוך חישוב מחירים אוטומטי והודעות
          ליישובים.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
          <span>✓ ממשק בעברית עם תמיכת RTL</span>
          <span>✓ גישה מותאמת לפי תפקידים</span>
          <span>✓ דוחות מפורטים ואנליטיקה</span>
          <span>✓ אבטחת מידע מתקדמת</span>
        </div>
      </div>

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
