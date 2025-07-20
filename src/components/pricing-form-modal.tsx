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
import {
  SettlementTankPricing,
  Settlement,
  ContainerType,
} from '@/types/database';
import { formatPrice } from '@/lib/pricing-utils';

interface PricingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing?: SettlementTankPricing | null;
  settlements: Settlement[];
  containerTypes: ContainerType[];
  onSubmit: (formData: any) => void;
}

export function PricingFormModal({
  open,
  onOpenChange,
  pricing,
  settlements,
  containerTypes,
  onSubmit,
}: PricingFormModalProps) {
  const [formData, setFormData] = useState({
    settlement_id: '',
    container_type_id: '',
    price: '',
    currency: 'ILS',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pricing) {
      setFormData({
        settlement_id: pricing.settlement_id,
        container_type_id: pricing.container_type_id,
        price: pricing.price.toString(),
        currency: pricing.currency,
        is_active: pricing.is_active,
      });
    } else {
      setFormData({
        settlement_id: '',
        container_type_id: '',
        price: '',
        currency: 'ILS',
        is_active: true,
      });
    }
    setErrors({});
  }, [pricing, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.settlement_id) {
      newErrors.settlement_id = 'יש לבחור יישוב';
    }

    if (!formData.container_type_id) {
      newErrors.container_type_id = 'יש לבחור סוג מכל';
    }

    if (!formData.price) {
      newErrors.price = 'יש להזין מחיר';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'מחיר חייב להיות מספר חיובי';
      } else if (priceNum > 10000) {
        newErrors.price = 'מחיר גבוה מדי (מעל 10,000)';
      }
    }

    if (!formData.currency) {
      newErrors.currency = 'יש לבחור מטבע';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    onSubmit(submitData);
  };

  // Get selected container type for unit price calculation
  const selectedContainerType = containerTypes.find(
    (ct) => ct.id === formData.container_type_id
  );

  const unitPrice =
    selectedContainerType && formData.price
      ? parseFloat(formData.price) / selectedContainerType.size
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {pricing ? 'עריכת תמחור' : 'הוספת תמחור חדש'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settlement_id">יישוב</Label>
            <Select
              value={formData.settlement_id}
              onValueChange={(value) => handleChange('settlement_id', value)}
            >
              <SelectTrigger
                className={errors.settlement_id ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="בחר יישוב" />
              </SelectTrigger>
              <SelectContent>
                {settlements.map((settlement) => (
                  <SelectItem key={settlement.id} value={settlement.id}>
                    {settlement.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.settlement_id && (
              <p className="text-sm text-destructive">{errors.settlement_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="container_type_id">סוג מכל</Label>
            <Select
              value={formData.container_type_id}
              onValueChange={(value) =>
                handleChange('container_type_id', value)
              }
            >
              <SelectTrigger
                className={errors.container_type_id ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="בחר סוג מכל" />
              </SelectTrigger>
              <SelectContent>
                {containerTypes.map((containerType) => (
                  <SelectItem key={containerType.id} value={containerType.id}>
                    {containerType.name} ({containerType.size}{' '}
                    {containerType.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.container_type_id && (
              <p className="text-sm text-destructive">
                {errors.container_type_id}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">מחיר למכל</Label>
            <div className="flex gap-2">
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="מחיר למכל מלא"
                type="number"
                step="0.01"
                min="0"
                className={errors.price ? 'border-destructive' : ''}
              />
              <div className="min-w-0 w-16 flex items-center justify-center bg-muted rounded-md px-3 text-sm text-muted-foreground">
                {formData.currency}
              </div>
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
            {unitPrice > 0 && (
              <p className="text-sm text-muted-foreground">
                מחיר ליחידה: {formatPrice(unitPrice, formData.currency)} ל-
                {selectedContainerType?.unit}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">מטבע</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger
                className={errors.currency ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="בחר מטבע" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ILS">שקל ישראלי (₪)</SelectItem>
                <SelectItem value="USD">דולר אמריקאי ($)</SelectItem>
                <SelectItem value="EUR">יורו (€)</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">סטטוס</Label>
            <Select
              value={formData.is_active.toString()}
              onValueChange={(value) =>
                handleChange('is_active', value === 'true')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">פעיל</SelectItem>
                <SelectItem value="false">לא פעיל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit">{pricing ? 'עדכן' : 'הוסף'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
