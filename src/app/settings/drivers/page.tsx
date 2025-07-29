'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DriversTable } from '@/components/drivers-table';
import { DriverFormModal } from '@/components/driver-form-modal';
import { CredentialsDisplay } from '@/components/credentials-display';
import { useToast } from '@/hooks/use-toast';
import { Driver } from '@/types/api';
import { ConfirmDialog } from '@/components';

interface DriversPageProps {}

export default function DriversPage({}: DriversPageProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [newDriverCredentials, setNewDriverCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const { toast } = useToast();

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drivers');
      if (!response.ok) throw new Error('Failed to fetch drivers');
      const result = await response.json();
      setDrivers(result.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את רשימת הנהגים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle add driver
  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  // Handle edit driver
  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = (driver: Driver) => {
    setDeletingDriver(driver);
    setDeleteModalOpen(true);
  };

  // Handle delete driver
  const handleConfirmDelete = async () => {
    if (!deletingDriver) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/drivers/${deletingDriver.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete driver');

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה',
          description: 'הנהג נמחק בהצלחה',
          variant: 'default',
        });

        fetchDrivers();
        setDeleteModalOpen(false);
        setDeletingDriver(null);
      } else {
        throw new Error('Failed to delete driver');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את הנהג',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      const url = editingDriver
        ? `/api/drivers/${editingDriver.id}`
        : '/api/drivers';
      const method = editingDriver ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save driver');
      }

      const result = await response.json();

      // Show success message with login credentials for new drivers
      if (!editingDriver && result.data?.temporary_password) {
        setNewDriverCredentials({
          email: formData.email,
          password: result.data.temporary_password,
        });
        setCredentialsOpen(true);
      } else {
        toast({
          title: 'הצלחה',
          description: editingDriver ? 'הנהג עודכן בהצלחה' : 'הנהג נוסף בהצלחה',
          variant: 'default',
        });
      }

      setIsModalOpen(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'לא ניתן לשמור את פרטי הנהג';
      toast({
        title: 'שגיאה',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">ניהול נהגים</h1>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="חיפוש נהגים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          הוספת נהג
        </Button>
      </div>

      {/* Drivers Table */}
      <DriversTable
        drivers={drivers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Driver Form Modal */}
      <DriverFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        driver={editingDriver}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        variant="destructive"
        itemName={deletingDriver?.email}
        title="מחיקת נהג"
        description={`האם אתה בטוח שברצונך למחוק את הנהג "${deletingDriver?.email}"? פעולה זו תמחק גם את כל הדוחות הקשורים לנהג זה.`}
      />

      {/* Credentials Display */}
      {newDriverCredentials && (
        <CredentialsDisplay
          open={credentialsOpen}
          onOpenChange={setCredentialsOpen}
          email={newDriverCredentials.email}
          password={newDriverCredentials.password}
        />
      )}
    </div>
  );
}
