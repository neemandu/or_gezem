'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Phone, Mail, Building } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { userDetails, refreshUserDetails } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userDetails) {
      setFormData({
        first_name: userDetails.first_name || '',
        last_name: userDetails.last_name || '',
        phone: userDetails.phone || '',
      });
    }
  }, [userDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDetails?.id) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן פרטים ללא זיהוי משתמש',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userDetails.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'הצלחה',
          description: 'פרטי הפרופיל עודכנו בהצלחה',
        });

        // Refresh user details
        await refreshUserDetails();
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בעדכון פרטי הפרופיל',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרטי משתמש...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הגדרות', href: '/settings' },
            { label: 'פרופיל משתמש', isActive: true },
          ]}
        />

        <div className="flex items-center space-x-3 space-x-reverse">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              פרופיל משתמש
            </h1>
            <p className="text-text-secondary">
              עדכן את פרטי הפרופיל האישי שלך
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">אימייל:</span>
              <span className="text-sm text-gray-900">{userDetails.email}</span>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">תפקיד:</span>
              <span className="text-sm text-gray-900">
                {userDetails.role === 'ADMIN'
                  ? 'מנהל מערכת'
                  : userDetails.role === 'SETTLEMENT_USER'
                    ? 'משתמש יישוב'
                    : userDetails.role === 'DRIVER'
                      ? 'נהג'
                      : userDetails.role}
              </span>
            </div>

            {userDetails.settlement && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  יישוב:
                </span>
                <span className="text-sm text-gray-900">
                  {userDetails.settlement.name}
                </span>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">שם פרטי</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange('first_name', e.target.value)
                }
                placeholder="הכנס שם פרטי"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="הכנס שם משפחה"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="הכנס מספר טלפון"
                  className="pr-10"
                  dir="rtl"
                />
              </div>
              <p className="text-xs text-gray-500">
                פורמט: 050-1234567 או +972-50-1234567
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'שומר...' : 'שמור שינויים'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
