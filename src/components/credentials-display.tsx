'use client';

import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

interface CredentialsDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
}

export function CredentialsDisplay({
  open,
  onOpenChange,
  email,
  password,
}: CredentialsDisplayProps) {
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(
    null
  );
  const { toast } = useToast();

  const copyToClipboard = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);

      toast({
        title: 'הועתק בהצלחה',
        description: `${field === 'email' ? 'האימייל' : 'הסיסמה'} הועתקה ללוח`,
        variant: 'default',
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעתיק ללוח',
        variant: 'destructive',
      });
    }
  };

  const copyEmail = () => copyToClipboard(email, 'email');
  const copyPassword = () => copyToClipboard(password, 'password');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]" dir="rtl">
        <SheetHeader>
          <SheetTitle>פרטי התחברות</SheetTitle>
          <SheetDescription>
            שמור את הפרטים הבאים ושתף אותם עם הנהג
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Email Section */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">אימייל</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md border">
                <code className="text-sm">{email}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyEmail}
                className="shrink-0"
              >
                {copiedField === 'email' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              סיסמה זמנית
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md border">
                <code className="text-sm font-mono">{password}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPassword}
                className="shrink-0"
              >
                {copiedField === 'password' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              הוראות חשובות:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• שמור את הפרטים במקום בטוח</li>
              <li>• שתף את הפרטים עם הנהג באופן פרטי</li>
              <li>• הנהג יוכל לשנות את הסיסמה לאחר ההתחברות הראשונה</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                copyToClipboard(`${email}\n${password}`, 'email');
              }}
              className="flex-1"
            >
              העתק הכל
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              סגור
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
