'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, Send, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HebrewSelect } from '@/components/ui/hebrew-select';
import { CameraInput } from '@/components/camera-input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form validation schema
const reportFormSchema = z.object({
  settlement_id: z.string().min(1, 'יש לבחור יישוב'),
  container_type_id: z.string().min(1, 'יש לבחור סוג מכל'),
  volume: z
    .number()
    .min(0.01, 'נפח חייב להיות גדול מ-0')
    .max(100, 'נפח גדול מדי'),
  notes: z.string().max(1000, 'הערות ארוכות מדי').optional(),
  image_url: z.string().optional(),
  image_public_id: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface Settlement {
  id: string;
  name: string;
}

interface ContainerType {
  id: string;
  name: string;
  size: number;
  unit: string;
}

export default function ReportPage() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const { toast } = useToast();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      settlement_id: '',
      container_type_id: '',
      volume: 0,
      notes: '',
      image_url: '',
      image_public_id: '',
    },
  });

  // Load settlements and container types
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch settlements
        const settlementsResponse = await fetch('/api/settlements');
        if (!settlementsResponse.ok) {
          throw new Error('Failed to load settlements');
        }
        const settlementsData = await settlementsResponse.json();
        if (settlementsData.success) {
          setSettlements(settlementsData.data || []);
        }

        // Fetch container types
        const containerTypesResponse = await fetch('/api/tanks');
        if (!containerTypesResponse.ok) {
          throw new Error('Failed to load container types');
        }
        const containerTypesData = await containerTypesResponse.json();
        if (containerTypesData.success) {
          setContainerTypes(containerTypesData.data || []);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בטעינת נתוני הטופס',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFormData();
  }, [toast]);

  // Handle image upload
  const handleImageUploaded = (imageUrl: string, filePath: string) => {
    form.setValue('image_url', imageUrl);
    form.setValue('image_public_id', filePath);
    toast({
      title: 'הצלחה',
      description: 'תמונה הועלתה בהצלחה',
    });
  };

  // Handle image upload error
  const handleImageError = (error: string) => {
    toast({
      title: 'שגיאה',
      description: error,
      variant: 'destructive',
    });
  };

  // Submit form
  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);

      // Add driver_id from current user
      const reportData = {
        ...data,
        driver_id: user?.id,
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה בשליחת הדיווח');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה!',
          description: 'הדיווח נשלח בהצלחה',
        });

        // Reset form
        form.reset();
      } else {
        throw new Error(result.error || 'שגיאה בשליחת הדיווח');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה בשליחת הדיווח',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'DRIVER') {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 space-x-reverse">
              <MapPin className="h-6 w-6 text-green-600" />
              <h1 className="text-lg font-semibold text-gray-900">
                דיווח איסוף
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 ml-2" />
              יציאה
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען נתונים...</p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Settlement Selection */}
            <div className="space-y-2">
              <Label htmlFor="settlement">יישוב *</Label>
              <HebrewSelect
                options={settlements.map((settlement) => ({
                  value: settlement.id,
                  label: settlement.name,
                }))}
                value={form.watch('settlement_id')}
                onValueChange={(value) => form.setValue('settlement_id', value)}
                placeholder="בחר יישוב..."
                error={form.formState.errors.settlement_id?.message}
              />
            </div>

            {/* Container Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="container_type">סוג מכל *</Label>
              <HebrewSelect
                options={containerTypes.map((type) => ({
                  value: type.id,
                  label: `${type.name} (${type.size} ${type.unit})`,
                }))}
                value={form.watch('container_type_id')}
                onValueChange={(value) =>
                  form.setValue('container_type_id', value)
                }
                placeholder="בחר סוג מכל..."
                error={form.formState.errors.container_type_id?.message}
              />
            </div>

            {/* Volume Input */}
            <div className="space-y-2">
              <Label htmlFor="volume">נפח (מ״ק) *</Label>
              <Input
                id="volume"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="הכנס נפח..."
                {...form.register('volume', { valueAsNumber: true })}
                className={cn(
                  'text-right',
                  form.formState.errors.volume && 'border-red-500'
                )}
              />
              {form.formState.errors.volume && (
                <p className="text-sm text-red-500 text-right">
                  {form.formState.errors.volume.message}
                </p>
              )}
            </div>

            {/* Camera Input */}
            <div className="space-y-2">
              <Label>תמונה</Label>
              <CameraInput
                onImageUploaded={handleImageUploaded}
                onError={handleImageError}
                maxSizeMB={5}
                quality={0.8}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <textarea
                id="notes"
                rows={4}
                placeholder="הכנס הערות..."
                {...form.register('notes')}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-right',
                  'focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500',
                  'placeholder:text-gray-400 resize-none',
                  form.formState.errors.notes && 'border-red-500'
                )}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-500 text-right">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  שולח דיווח...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  שלח דיווח
                </>
              )}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
