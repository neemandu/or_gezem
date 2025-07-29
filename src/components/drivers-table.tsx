'use client';

import { Edit, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Driver } from '@/types/api';
import { useEffect } from 'react';

interface DriversTableProps {
  drivers: Driver[];
  loading?: boolean;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function DriversTable({
  drivers,
  loading = false,
  onEdit,
  onDelete,
  searchTerm = '',
}: DriversTableProps) {
  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user_metadata?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      driver.user_metadata?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log('drivers', drivers);
  }, [drivers]);

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'שם הנהג',
      render: (_, driver) => {
        const metadata = driver.user_metadata || {};
        const fullName =
          metadata.first_name && metadata.last_name
            ? `${metadata.first_name} ${metadata.last_name}`
            : driver.first_name && driver.last_name
              ? `${driver.first_name} ${driver.last_name}`
              : '-';

        return <div className="font-medium text-text-primary">{fullName}</div>;
      },
    },
    {
      key: 'email',
      header: 'אימייל',
      render: (_, driver) => (
        <div className="text-text-secondary">{driver.email}</div>
      ),
    },
    // {
    //   key: 'phone',
    //   header: 'טלפון',
    //   render: (_, driver) => {
    //     const phone = driver.user_metadata?.phone;
    //     if (!phone) {
    //       return <div className="text-muted-foreground">-</div>;
    //     }

    //     return (
    //       <div className="flex items-center gap-2 text-text-secondary">
    //         <Phone className="h-4 w-4" />
    //         <a href={`tel:${phone}`} className="hover:text-primary transition-colors">
    //           {phone}
    //         </a>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   key: 'license',
    //   header: 'רישיון',
    //   render: (_, driver) => (
    //     <div className="text-text-secondary">
    //       {driver.user_metadata?.license_number || '-'}
    //     </div>
    //   ),
    // },
    {
      key: 'actions',
      header: 'פעולות',
      render: (_, driver) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(driver)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(driver)}
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
        data={filteredDrivers}
        columns={columns}
        loading={loading}
        emptyMessage="לא נמצאו נהגים"
        rtl={true}
      />
    </div>
  );
}
