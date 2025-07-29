'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContainerType, CreateTankRequest } from '@/types/api';

interface TankFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tank?: ContainerType | null;
  onSubmit: (formData: any) => void;
}

export function TankFormModal({
  open,
  onOpenChange,
  tank,
  onSubmit,
}: TankFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    size: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tank) {
      setFormData({
        name: tank.name,
        size: tank.size.toString(),
      });
    } else {
      setFormData({
        name: '',
        size: '',
      });
    }
    setErrors({});
  }, [tank, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם המכל נדרש';
    }

    if (!formData.size.trim()) {
      newErrors.size = 'גודל המכל נדרש';
    } else if (isNaN(Number(formData.size)) || Number(formData.size) <= 0) {
      newErrors.size = 'גודל המכל חייב להיות מספר חיובי';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Transform data for API
    const apiData: CreateTankRequest = {
      name: formData.name,
      size: Number(formData.size),
      unit: 'm³',
    };

    onSubmit(apiData);
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
          <DialogTitle>{tank ? 'עריכת מכל' : 'הוספת מכל חדש'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם המכל</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="הכנס שם המכל"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">גודל</Label>
            <div className="flex gap-2">
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                placeholder="גודל המכל"
                type="number"
                className={errors.size ? 'border-destructive' : ''}
              />
              <div className="min-w-0 w-20 flex items-center justify-center bg-muted rounded-md px-3 text-sm text-muted-foreground">
                m³
              </div>
            </div>
            {errors.size && (
              <p className="text-sm text-destructive">{errors.size}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit">{tank ? 'עדכן' : 'הוסף'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
