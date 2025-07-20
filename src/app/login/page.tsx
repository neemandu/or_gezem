'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getDefaultRedirectUrl } from '@/lib/auth-utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, userRole } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && userRole) {
      const redirectUrl = getDefaultRedirectUrl(userRole);
      router.push(redirectUrl);
    }
  }, [user, userRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            מעביר אותך...
          </h2>
          <p className="text-gray-600">אתה מועבר לדף הניהול שלך</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                התחברות למערכת
              </h1>
              <p className="text-green-100 text-sm">מערכת ניהול פסולת ירוקה</p>
            </div>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="mr-3 text-sm text-red-700 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 ml-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  כתובת מייל
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הזן כתובת מייל"
                  className="w-full text-right border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg py-3 px-4 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 ml-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  סיסמה
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  className="w-full text-right border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg py-3 px-4 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    <span>מתחבר...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>התחברות</span>
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500">
                מערכת מאובטחת • © 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
