'use client';

import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { SettlementTankPricing } from '@/types/database';
import { formatPrice } from '@/lib/pricing-utils';

interface PricingTableProps {
  pricing: SettlementTankPricing[];
  loading?: boolean;
  onEdit: (pricing: SettlementTankPricing) => void;
  onDelete: (pricing: SettlementTankPricing) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

// Extended interface for pricing with populated relations
interface PricingWithRelations extends SettlementTankPricing {
  settlement?: {
    id: string;
    name: string;
  };
  container_type?: {
    id: string;
    name: string;
    size: number;
    unit: string;
  };
}

export function PricingTable({
  pricing,
  loading = false,
  onEdit,
  onDelete,
  searchTerm = '',
}: PricingTableProps) {
  // Filter pricing based on search term
  const filteredPricing = pricing.filter((item) => {
    const pricingItem = item as PricingWithRelations;
    const searchLower = searchTerm.toLowerCase();

    return (
      pricingItem.settlement?.name?.toLowerCase().includes(searchLower) ||
      pricingItem.container_type?.name?.toLowerCase().includes(searchLower) ||
      pricingItem.price.toString().includes(searchTerm) ||
      pricingItem.currency.toLowerCase().includes(searchLower)
    );
  });

  const columns: Column<PricingWithRelations>[] = [
    {
      key: 'settlement',
      header: 'יישוב',
      render: (_, pricing) => (
        <div className="font-medium text-text-primary">
          {pricing.settlement?.name || 'לא נמצא'}
        </div>
      ),
    },
    {
      key: 'container_type',
      header: 'סוג מכל',
      render: (_, pricing) => (
        <div className="text-text-secondary">
          {pricing.container_type?.name || 'לא נמצא'}
          {pricing.container_type && (
            <span className="text-xs text-muted-foreground block">
              {pricing.container_type.size} {pricing.container_type.unit}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'מחיר למכל',
      render: (_, pricing) => (
        <div className="font-medium text-text-primary flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {formatPrice(pricing.price, pricing.currency)}
        </div>
      ),
    },
    {
      key: 'unit_price',
      header: 'מחיר ליחידה',
      render: (_, pricing) => {
        const unitPrice = pricing.container_type
          ? pricing.price / pricing.container_type.size
          : 0;
        return (
          <div className="text-text-secondary">
            {formatPrice(unitPrice, pricing.currency)} ל-
            {pricing.container_type?.unit || "יח'"}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      header: 'סטטוס',
      render: (value) => (
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'פעיל' : 'לא פעיל'}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'תאריך יצירה',
      render: (value) => (
        <div className="text-text-secondary text-sm">
          {new Date(value).toLocaleDateString('he-IL')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'פעולות',
      render: (_, pricing) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(pricing)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(pricing)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <DataTable
        data={filteredPricing as PricingWithRelations[]}
        columns={columns}
        loading={loading}
        emptyMessage="לא נמצאו תמחורים"
        rtl={true}
      />
    </div>
  );
}
