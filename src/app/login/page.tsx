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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p>You are being redirected to your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              התחברות למערכת
            </h1>
            <p className="text-sm text-gray-600">מערכת ניהול פסולת ירוקה</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                כתובת מייל
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="הזן כתובת מייל"
                className="w-full text-right mt-1"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                סיסמה
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזן סיסמה"
                className="w-full text-right mt-1"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחברות'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
