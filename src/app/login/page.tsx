'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { getDefaultRedirectUrl } from '@/lib/auth-utils';

// Form validation schema with Hebrew error messages
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'נדרש להזין כתובת מייל')
    .email('כתובת מייל לא תקינה'),
  password: z
    .string()
    .min(1, 'נדרש להזין סיסמה')
    .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, isLoading } = useAuth();

  const redirectTo = searchParams?.get('redirectTo') || null;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      const targetUrl = redirectTo || getDefaultRedirectUrl(user);
      console.log('User already authenticated, redirecting to:', targetUrl);

      // Use window.location.href for more reliable redirect that won't be affected by router refresh
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    }
  }, [user, isLoading, redirectTo]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        console.log('Login successful');

        // Don't redirect immediately here - let the useEffect handle it
        // after the auth state has properly updated
      } else {
        setError(result.error || 'שגיאה בהתחברות למערכת');
      }
    } catch (err) {
      setError('שגיאה בהתחברות למערכת');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-green-600 font-medium">טוען...</p>
        </div>
      </div>
    );
  }

  // Don't render the login form if user is authenticated (redirect is in progress)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-green-600 font-medium">מעביר לדף הבא...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-green-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              התחברות למערכת
            </h1>
            <p className="text-sm text-gray-600">מערכת ניהול פסולת ירוקה</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      כתובת מייל
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="הזן כתובת מייל"
                        className="w-full text-right"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      סיסמה
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="הזן סיסמה"
                          className="w-full text-right pr-10"
                          disabled={isSubmitting}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <LogIn className="h-4 w-4" />
                    <span>התחברות</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              מערכת ניהול פסולת ירוקה - גרסה 1.0
            </p>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
            סוגי משתמשים במערכת:
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>מנהל מערכת</span>
              <span className="text-green-600 font-medium">ADMIN</span>
            </div>
            <div className="flex justify-between items-center">
              <span>משתמש יישוב</span>
              <span className="text-blue-600 font-medium">SETTLEMENT_USER</span>
            </div>
            <div className="flex justify-between items-center">
              <span>נהג</span>
              <span className="text-purple-600 font-medium">DRIVER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
