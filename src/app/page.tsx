'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  CalculatorIcon,
  BellIcon,
  ShieldIcon,
  UsersIcon,
  BarChart3Icon,
  CameraIcon,
} from 'lucide-react';

export default function Home() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <TruckIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-900">✓</span>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                מערכת ניהול פסולת ירוקה
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                פתרון מתקדם לניהול איסוף ומחזור פסולת ירוקה עבור רשויות מקומיות.
                המערכת מאפשרת תיעוד בשטח, חישוב מחירים אוטומטי והפקת דוחות
                מקיפים.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => router.push('/login')}
                  size="lg"
                  className="text-lg px-10 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  כניסה למערכת
                </Button>
                <div className="text-sm text-gray-500">
                  ✓ מאובטח • ✓ מהיר • ✓ ידידותי למשתמש
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CameraIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                תיעוד דיגיטלי
              </h3>
              <p className="text-gray-600 leading-relaxed">
                צילום מכלים, מדידת נפח ורישום הערות ישירות מהשטח עם טכנולוגיה
                מתקדמת
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CalculatorIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                חישוב מחירים
              </h3>
              <p className="text-gray-600 leading-relaxed">
                חישוב עלויות אוטומטי על בסיס נפח ותעריפים מותאמים לכל יישוב
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BellIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                התראות אוטומטיות
              </h3>
              <p className="text-gray-600 leading-relaxed">
                שליחת התראות WhatsApp ליישובים עם פרטי האיסוף והמחיר בזמן אמת
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  50+
                </div>
                <div className="text-gray-600">יישובים פעילים</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  1000+
                </div>
                <div className="text-gray-600">איסופים חודשיים</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  99%
                </div>
                <div className="text-gray-600">דיוק במדידות</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  24/7
                </div>
                <div className="text-gray-600">תמיכה טכנית</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <TruckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ברוך הבא למערכת ניהול פסולת ירוקה
          </h1>
          <p className="text-xl text-gray-600">
            שלום {user.email} -
            <span className="font-semibold text-green-600">
              {user.role === 'ADMIN' && 'מנהל מערכת'}
              {user.role === 'SETTLEMENT_USER' && 'משתמש יישוב'}
              {user.role === 'DRIVER' && 'נהג'}
            </span>
          </p>
        </div>

        {/* Role-based Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {hasRole('ADMIN') && (
            <>
              <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShieldIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      מערכת ניהול
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      ניהול מלא של המערכת, משתמשים והגדרות עם כלים מתקדמים
                    </p>
                  </div>
                  <Button
                    onClick={() => handleNavigate('/admin')}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    כניסה לניהול
                  </Button>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CalculatorIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      ניהול תמחור
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      הגדרת תעריפים עבור יישובים וסוגי מכלים עם גמישות מלאה
                    </p>
                  </div>
                  <Button
                    onClick={() => handleNavigate('/settings')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    הגדרות מערכת
                  </Button>
                </div>
              </div>
            </>
          )}

          {(hasRole('ADMIN') || hasRole('SETTLEMENT_USER')) && (
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {hasRole('ADMIN') ? 'דוחות ונתונים' : 'דוחות היישוב'}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {hasRole('ADMIN')
                      ? 'צפייה בדוחות מקיפים וניתוח נתונים מתקדם'
                      : 'צפייה בדוחות איסוף מפורטים עבור היישוב שלך'}
                  </p>
                </div>
                <Button
                  onClick={() => handleNavigate('/data')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  צפייה בדוחות
                </Button>
              </div>
            </div>
          )}

          {hasRole('DRIVER') && (
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    דיווח איסוף
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    דיווח על איסוף מכלים מהשטח עם צילומים ומדידות מדויקות
                  </p>
                </div>
                <Button
                  onClick={() => handleNavigate('/report')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  דיווח איסוף
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">אודות החברה</h2>
          <p className="text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed text-lg">
            A.V.R. Gezem Ltd. מתמחה באיסוף ומחזור פסולת ירוקה עירונית והחזרת
            החומר המעובד ליישובים המקוריים. המערכת שלנו מאפשרת למפעילי שטח לתעד
            איסוף מכלים עם תמונות, נפחים והערות, תוך חישוב מחירים אוטומטי
            והודעות ליישובים בזמן אמת.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>ממשק בעברית עם תמיכת RTL</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>גישה מותאמת לפי תפקידים</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>דוחות מפורטים ואנליטיקה</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>אבטחת מידע מתקדמת</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg">
              &copy; 2024 A.V.R. Gezem Ltd. כל הזכויות שמורות.
            </p>
            <p className="text-sm mt-2">פותח עם ❤️ בישראל</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
