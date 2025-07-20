'use client';

import { useState } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { Settlement } from '@/types/api';

interface SettlementsTableProps {
  settlements: Settlement[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (settlement: Settlement) => void;
  onDelete: (settlement: Settlement) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function SettlementsTable({
  settlements,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  searchTerm = '',
  onSearchChange,
}: SettlementsTableProps) {
  // Filter settlements based on search term
  const filteredSettlements = settlements.filter(
    (settlement) =>
      settlement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.contact_person &&
        settlement.contact_person
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const columns: Column<Settlement>[] = [
    {
      key: 'name',
      header: 'שם היישוב',
      render: (value) => (
        <div className="font-medium text-text-primary">{value}</div>
      ),
    },
    {
      key: 'contact_person',
      header: 'איש קשר',
      render: (value) => (
        <div className="text-text-secondary">{value || '-'}</div>
      ),
    },
    {
      key: 'contact_phone',
      header: 'טלפון',
      render: (value) => (
        <div className="text-text-secondary font-mono">{value || '-'}</div>
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
      render: (_, settlement) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(settlement)}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">עריכה</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(settlement)}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">מחיקה</span>
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header with Add button and Search */}
      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={onAdd}
          className="flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="h-4 w-4" />
          <span>הוסף יישוב</span>
        </Button>

        {onSearchChange && (
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש יישובים..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable
          data={filteredSettlements}
          columns={columns}
          loading={loading}
          emptyMessage="לא נמצאו יישובים"
          rtl={true}
        />
      </div>

      {/* Stats Footer */}
      <div className="text-sm text-text-secondary text-center">
        סה&quot;כ {filteredSettlements.length} יישובים
        {searchTerm && ` (מתוך ${settlements.length} יישובים)`}
      </div>
    </div>
  );
}
