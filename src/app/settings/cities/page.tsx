'use client';

import { useState, useEffect } from 'react';
import { Building, AlertCircle } from 'lucide-react';
import {
  Breadcrumbs,
  SettlementsTable,
  SettlementFormModal,
  ConfirmDialog,
} from '@/components';
import { useToast } from '@/hooks/use-toast';
import {
  Settlement,
  CreateSettlementRequest,
  UpdateSettlementRequest,
} from '@/types/api';

export default function SettlementsCitiesPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSettlement, setDeletingSettlement] =
    useState<Settlement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // Fetch settlements on component mount
  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settlements');

      if (!response.ok) {
        throw new Error('שגיאה בטעינת היישובים');
      }

      const result = await response.json();

      if (result.success) {
        setSettlements(result.data || []);
      } else {
        throw new Error(result.error || 'שגיאה בטעינת היישובים');
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה בטעינת היישובים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSettlement(null);
    setFormModalOpen(true);
  };

  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement);
    setFormModalOpen(true);
  };

  const handleDelete = (settlement: Settlement) => {
    setDeletingSettlement(settlement);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (
    formData: CreateSettlementRequest | UpdateSettlementRequest
  ) => {
    try {
      setSubmitting(true);

      const isEdit = !!editingSettlement;
      const url = isEdit
        ? `/api/settlements/${editingSettlement.id}`
        : '/api/settlements';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(isEdit ? 'שגיאה בעדכון היישוב' : 'שגיאה בהוספת היישוב');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה',
          description: isEdit ? 'היישוב עודכן בהצלחה' : 'היישוב נוסף בהצלחה',
          variant: 'default',
        });

        // Refresh the settlements list
        await fetchSettlements();
      } else {
        throw new Error(
          result.error ||
            (isEdit ? 'שגיאה בעדכון היישוב' : 'שגיאה בהוספת היישוב')
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה בביצוע הפעולה',
        variant: 'destructive',
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSettlement) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/settlements/${deletingSettlement.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('שגיאה במחיקת היישוב');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה',
          description: 'היישוב נמחק בהצלחה',
          variant: 'default',
        });

        // Refresh the settlements list
        await fetchSettlements();
        setDeleteModalOpen(false);
        setDeletingSettlement(null);
      } else {
        throw new Error(result.error || 'שגיאה במחיקת היישוב');
      }
    } catch (error) {
      console.error('Error deleting settlement:', error);
      toast({
        title: 'שגיאה',
        description:
          error instanceof Error ? error.message : 'שגיאה במחיקת היישוב',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הגדרות', href: '/settings' },
            { label: 'יישובים', isActive: true },
          ]}
        />

        <div className="flex items-center space-x-3 space-x-reverse">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              ניהול יישובים
            </h1>
            <p className="text-text-secondary">
              נהל יישובים, אנשי קשר ופרטי התקשרות
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {!loading && settlements.length === 0 && !searchTerm && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            אין יישובים במערכת
          </h3>
          <p className="text-text-secondary mb-4">
            התחל על ידי הוספת היישוב הראשון למערכת
          </p>
        </div>
      )}

      {/* Settlements Table */}
      <SettlementsTable
        settlements={settlements}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Form Modal */}
      <SettlementFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        settlement={editingSettlement}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        variant="destructive"
        itemName={deletingSettlement?.name}
        title="מחיקת יישוב"
        description={`האם אתה בטוח שברצונך למחוק את היישוב "${deletingSettlement?.name}"? פעולה זו תמחק גם את כל הדוחות הקשורים ליישוב זה.`}
      />
    </div>
  );
}
