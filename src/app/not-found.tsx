'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { HomeIcon, ArrowRightIcon, AlertTriangleIcon } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <AlertTriangleIcon className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-yellow-900">404</span>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            עמוד לא נמצא
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            העמוד שחיפשת לא קיים או הועבר לכתובת אחרת. אנא בדוק את הכתובת או
            חזור לדף הבית.
          </p>

          <div className="text-lg text-gray-500 mb-8">
            שגיאה 404 - העמוד לא נמצא
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGoHome}
              size="lg"
              className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <HomeIcon className="w-5 h-5 ml-2" />
              חזרה לדף הבית
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowRightIcon className="w-5 h-5 ml-2" />
              חזרה לעמוד הקודם
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              זקוק לעזרה?
            </h3>
            <p className="text-gray-600">
              אם אתה חושב שזו טעות, אנא צור קשר עם צוות התמיכה שלנו.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
