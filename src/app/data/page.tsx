'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HebrewSelect } from '@/components/ui/hebrew-select';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  Filter,
  Download,
  Calendar,
  Users,
  Truck,
  Container,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  settlement_id: string;
  driver_id: string;
  container_type_id: string;
  volume: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  driver?: {
    id: string;
    email: string;
  };
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

interface Driver {
  id: string;
  email: string;
}

export default function DataPage() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    settlement_id: '',
    driver_id: '',
    tank_id: '',
    report_date_from: '',
    report_date_to: '',
  });

  // Image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Load initial data
  useEffect(() => {
    loadData();
    if (hasRole('ADMIN')) {
      loadSettlements();
      loadDrivers();
    }
    loadContainerTypes();
  }, []);

  // Load reports when filters or page changes
  useEffect(() => {
    loadReports();
  }, [filters, currentPage]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup function to prevent DOM manipulation errors
      setReports([]);
      setSettlements([]);
      setContainerTypes([]);
      setDrivers([]);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await loadReports();
    setIsLoading(false);
  };

  const loadReports = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data || []);
        setTotalReports(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.error || 'שגיאה בטעינת הדיווחים');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הדיווחים',
        variant: 'destructive',
      });
    }
  };

  const loadSettlements = async () => {
    try {
      // Request all settlements for filter dropdown (use max limit)
      const response = await fetch('/api/settlements?limit=100');
      const data = await response.json();
      if (data.success) {
        setSettlements(data.data || []);
      }
    } catch (error) {
      console.error('Error loading settlements:', error);
    }
  };

  const loadContainerTypes = async () => {
    try {
      // Request all container types for filter dropdown (use max limit)
      const response = await fetch('/api/tanks?limit=100');
      const data = await response.json();
      if (data.success) {
        setContainerTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading container types:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      // Request all drivers for filter dropdown (use max limit)
      const response = await fetch('/api/drivers?limit=100');
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Force re-render of select components when data changes
  const selectKey = useMemo(() => {
    return `${settlements.length}-${drivers.length}-${containerTypes.length}`;
  }, [settlements.length, drivers.length, containerTypes.length]);

  const clearFilters = () => {
    setFilters({
      settlement_id: '',
      driver_id: '',
      tank_id: '',
      report_date_from: '',
      report_date_to: '',
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען דיווחים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {hasRole('ADMIN') ? 'כל הדיווחים' : 'דיווחי היישוב'}
        </h1>
        <p className="text-gray-600">
          {hasRole('ADMIN')
            ? 'צפייה וניהול כל הדיווחים במערכת'
            : 'צפייה בדיווחי איסוף הפסולת של היישוב שלך'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">מסננים</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>מתאריך</Label>
            <Input
              type="date"
              value={filters.report_date_from}
              onChange={(e) =>
                handleFilterChange('report_date_from', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>עד תאריך</Label>
            <Input
              type="date"
              value={filters.report_date_to}
              onChange={(e) =>
                handleFilterChange('report_date_to', e.target.value)
              }
            />
          </div>

          {/* Settlement Filter (Admin only) */}
          {hasRole('ADMIN') && (
            <div className="space-y-2">
              <Label>יישוב</Label>
              <ErrorBoundary
                onError={(error) => {
                  console.error('Settlement filter error:', error);
                }}
              >
                <HebrewSelect
                  key={`settlement-${selectKey}`}
                  options={[
                    { value: 'all', label: 'כל היישובים' },
                    ...settlements.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  value={filters.settlement_id || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'settlement_id',
                      value === 'all' ? '' : value
                    )
                  }
                  placeholder="בחר יישוב..."
                />
              </ErrorBoundary>
            </div>
          )}

          {/* Driver Filter (Admin only) */}
          {hasRole('ADMIN') && (
            <div className="space-y-2">
              <Label>נהג</Label>
              <ErrorBoundary
                onError={(error) => {
                  console.error('Driver filter error:', error);
                }}
              >
                <HebrewSelect
                  key={`driver-${selectKey}`}
                  options={[
                    { value: 'all', label: 'כל הנהגים' },
                    ...drivers.map((d) => ({ value: d.id, label: d.email })),
                  ]}
                  value={filters.driver_id || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'driver_id',
                      value === 'all' ? '' : value
                    )
                  }
                  placeholder="בחר נהג..."
                />
              </ErrorBoundary>
            </div>
          )}

          {/* Container Type Filter */}
          <div className="space-y-2">
            <Label>סוג מכל</Label>
            <ErrorBoundary
              onError={(error) => {
                console.error('Container type filter error:', error);
              }}
            >
              <HebrewSelect
                key={`container-${selectKey}`}
                options={[
                  { value: 'all', label: 'כל סוגי המכלים' },
                  ...containerTypes.map((ct) => ({
                    value: ct.id,
                    label: `${ct.name} (${ct.size} ${ct.unit})`,
                  })),
                ]}
                value={filters.tank_id || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('tank_id', value === 'all' ? '' : value)
                }
                placeholder="בחר סוג מכל..."
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          נמצאו {totalReports} דיווחים
          {totalPages > 1 && ` | עמוד ${currentPage} מתוך ${totalPages}`}
        </p>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">יישוב</TableHead>
              <TableHead className="text-right">נהג</TableHead>
              <TableHead className="text-right">סוג מכל</TableHead>
              <TableHead className="text-right">נפח</TableHead>
              <TableHead className="text-right">תמונה</TableHead>
              <TableHead className="text-right">הערות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  לא נמצאו דיווחים מתאימים
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-right">
                    {formatDate(report.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.settlement?.name || 'לא ידוע'}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.driver?.email || 'לא ידוע'}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.container_type?.name
                      ? `${report.container_type.name} (${report.container_type.size} ${report.container_type.unit})`
                      : 'לא ידוע'}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.volume} מ&quot;ק
                  </TableCell>
                  <TableCell className="text-right">
                    {report.image_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImage(report.image_url!)}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        צפה
                      </Button>
                    ) : (
                      <span className="text-gray-400">אין תמונה</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.notes ? (
                      <span className="text-sm">{report.notes}</span>
                    ) : (
                      <span className="text-gray-400">אין הערות</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              עמוד קודם
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              עמוד הבא
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            עמוד {currentPage} מתוך {totalPages}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>תמונת דיווח</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="תמונת דיווח"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
