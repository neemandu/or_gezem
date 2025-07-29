'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Driver } from '@/types/api';

interface DriverFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  onSubmit: (formData: any) => void;
  loading?: boolean;
}

export function DriverFormModal({
  open,
  onOpenChange,
  driver,
  onSubmit,
  loading = false,
}: DriverFormModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    password: '', // Optional - if not provided, auto-generated
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (driver) {
      // When editing, populate with existing data
      // Note: We can't get the password or other metadata from the API in edit mode
      setFormData({
        email: driver.email || '',
        first_name: '',
        last_name: '',
        phone: '',
        license_number: '',
        password: '', // Never pre-fill password for security
      });
    } else {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        license_number: '',
        password: '',
      });
    }
    setErrors({});
  }, [driver, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל נדרש';
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = 'אימייל לא תקין';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'שם פרטי נדרש';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'שם משפחה נדרש';
    }

    // if (!formData.phone.trim()) {
    //   newErrors.phone = 'מספר טלפון נדרש';
    // } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
    //   newErrors.phone = 'מספר טלפון לא תקין';
    // }

    // Password validation (only for new drivers)
    if (!driver && formData.password && formData.password.length < 8) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('formData in driver form modal', formData);

    // Transform data for API
    const apiData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      // Only include password if provided (otherwise auto-generated)
      ...(formData.password && { password: formData.password }),
    };

    try {
      await onSubmit(apiData);
      // Form will be closed by parent component on success
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{driver ? 'עריכת נהג' : 'הוספת נהג חדש'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="driver@green-waste.co.il"
              className={errors.email ? 'border-destructive' : ''}
              disabled={!!driver} // Can't change email when editing
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="שם פרטי"
                className={errors.first_name ? 'border-destructive' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="שם משפחה"
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="מספר טלפון"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div> */}

          {!driver && (
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה (אופציונלי)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="השאר ריק ליצירת סיסמה אוטומטית"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                אם לא תמלא סיסמה, תיוצר סיסמה אוטומטית ותוצג לך בסיום
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'יוצר...' : driver ? 'עדכן' : 'הוסף נהג'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
