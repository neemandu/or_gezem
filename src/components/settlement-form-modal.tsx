'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSettlementSchema } from '@/lib/validations';
import { Settlement } from '@/types/api';
import { HebrewModal } from '@/components/ui/hebrew-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

type SettlementFormData = z.infer<typeof createSettlementSchema>;

interface SettlementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SettlementFormData) => Promise<void>;
  settlement?: Settlement | null;
  loading?: boolean;
}

export function SettlementFormModal({
  open,
  onOpenChange,
  onSubmit,
  settlement,
  loading = false,
}: SettlementFormModalProps) {
  const isEdit = !!settlement;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettlementFormData>({
    resolver: zodResolver(createSettlementSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      contact_phone: '',
    },
  });

  // Reset form when settlement changes or modal opens/closes
  useEffect(() => {
    if (settlement) {
      reset({
        name: settlement.name,
        contact_person: settlement.contact_person || '',
        contact_phone: settlement.contact_phone || '',
      });
    } else {
      reset({
        name: '',
        contact_person: '',
        contact_phone: '',
      });
    }
  }, [settlement, reset, open]);

  const handleFormSubmit = async (data: SettlementFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handling will be done by the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <HebrewModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'עריכת יישוב' : 'הוספת יישוב חדש'}
      description={
        isEdit ? 'ערוך את פרטי היישוב' : 'הכנס פרטי יישוב חדש למערכת'
      }
      size="md"
      footer={
        <div className="flex justify-between w-full gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            form="settlement-form"
            disabled={isSubmitting || loading}
            className="min-w-[100px]"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>{isEdit ? 'מעדכן...' : 'מוסיף...'}</span>
              </div>
            ) : isEdit ? (
              'עדכן'
            ) : (
              'הוסף'
            )}
          </Button>
        </div>
      }
    >
      <form
        id="settlement-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Settlement Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-right block">
            שם היישוב *
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="הכנס שם יישוב"
            className={errors.name ? 'border-destructive' : ''}
            disabled={isSubmitting || loading}
          />
          {errors.name && (
            <p className="text-sm text-destructive text-right">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Contact Person */}
        <div className="space-y-2">
          <Label htmlFor="contact_person" className="text-right block">
            איש קשר
          </Label>
          <Input
            id="contact_person"
            {...register('contact_person')}
            placeholder="הכנס שם איש קשר"
            className={errors.contact_person ? 'border-destructive' : ''}
            disabled={isSubmitting || loading}
          />
          {errors.contact_person && (
            <p className="text-sm text-destructive text-right">
              {errors.contact_person.message}
            </p>
          )}
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="text-right block">
            טלפון
          </Label>
          <Input
            id="contact_phone"
            {...register('contact_phone')}
            placeholder="הכנס מספר טלפון"
            className={errors.contact_phone ? 'border-destructive' : ''}
            disabled={isSubmitting || loading}
            dir="ltr"
          />
          {errors.contact_phone && (
            <p className="text-sm text-destructive text-right">
              {errors.contact_phone.message}
            </p>
          )}
        </div>

        {/* Helper text */}
        <div className="text-sm text-muted-foreground text-right pt-2">
          <p>* שדות חובה</p>
        </div>
      </form>
    </HebrewModal>
  );
}
