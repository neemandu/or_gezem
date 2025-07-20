'use client';

import { Edit, Trash2, Container } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { ContainerType } from '@/types/api';

interface TanksTableProps {
  tanks: ContainerType[];
  loading?: boolean;
  onEdit: (tank: ContainerType) => void;
  onDelete: (tank: ContainerType) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

// Helper function to get unit text based on type
const getUnitText = (type: string) => {
  switch (type) {
    case 'green_waste':
      return 'ליטר';
    case 'organic':
      return 'ליטר';
    case 'mixed':
      return 'ליטר';
    default:
      return 'ליטר';
  }
};

// Helper function to get type display text
const getTypeDisplayText = (type: string) => {
  switch (type) {
    case 'green_waste':
      return 'פסולת ירוקה';
    case 'organic':
      return 'פסולת אורגנית';
    case 'mixed':
      return 'פסולת מעורבת';
    default:
      return type;
  }
};

export function TanksTable({
  tanks,
  loading = false,
  onEdit,
  onDelete,
  searchTerm = '',
}: TanksTableProps) {
  // Filter tanks based on search term
  const filteredTanks = tanks.filter(
    (tank) =>
      tank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeDisplayText(tank.unit)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tank.size.toString().includes(searchTerm)
  );

  const columns: Column<ContainerType>[] = [
    {
      key: 'name',
      header: 'שם המכל',
      render: (value) => (
        <div className="font-medium text-text-primary flex items-center gap-2">
          <Container className="h-4 w-4" />
          {value}
        </div>
      ),
    },
    {
      key: 'size',
      header: 'גודל',
      render: (value, tank) => (
        <div className="text-text-secondary">
          {value} {getUnitText(tank.unit)}
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'יחידת מידה',
      render: (value) => (
        <div className="text-text-secondary">{getTypeDisplayText(value)}</div>
      ),
    },
    {
      key: 'actions',
      header: 'פעולות',
      render: (_, tank) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(tank)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(tank)}
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
        data={filteredTanks}
        columns={columns}
        loading={loading}
        emptyMessage="לא נמצאו מכלים"
        rtl={true}
      />
    </div>
  );
}
