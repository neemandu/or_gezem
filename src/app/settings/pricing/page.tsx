'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PricingTable } from '@/components/pricing-table';
import { PricingFormModal } from '@/components/pricing-form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import {
  SettlementTankPricing,
  Settlement,
  ContainerType,
} from '@/types/database';

export default function PricingPage() {
  const [pricing, setPricing] = useState<SettlementTankPricing[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] =
    useState<SettlementTankPricing | null>(null);
  const [deletingPricing, setDeletingPricing] =
    useState<SettlementTankPricing | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricingRes, settlementsRes, containerTypesRes] = await Promise.all(
        [fetch('/api/pricing'), fetch('/api/settlements'), fetch('/api/tanks')]
      );

      if (!pricingRes.ok || !settlementsRes.ok || !containerTypesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [pricingData, settlementsData, containerTypesData] =
        await Promise.all([
          pricingRes.json(),
          settlementsRes.json(),
          containerTypesRes.json(),
        ]);

      setPricing(pricingData.data || []);
      setSettlements(settlementsData.data || []);
      setContainerTypes(containerTypesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את נתוני התמחור',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle add pricing
  const handleAdd = () => {
    setEditingPricing(null);
    setIsModalOpen(true);
  };

  // Handle edit pricing
  const handleEdit = (pricing: SettlementTankPricing) => {
    setEditingPricing(pricing);
    setIsModalOpen(true);
  };

  // Handle delete pricing
  const handleDelete = (pricing: SettlementTankPricing) => {
    setDeletingPricing(pricing);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingPricing) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/pricing/${deletingPricing.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pricing');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה',
          description: 'התמחור נמחק בהצלחה',
        });

        fetchData();
        setDeleteModalOpen(false);
        setDeletingPricing(null);
      } else {
        throw new Error(result.error || 'Failed to delete pricing');
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את התמחור',
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
      const url = editingPricing
        ? `/api/pricing/${editingPricing.id}`
        : '/api/pricing';
      const method = editingPricing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save pricing');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'הצלחה',
          description: editingPricing
            ? 'התמחור עודכן בהצלחה'
            : 'התמחור נוסף בהצלחה',
        });

        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error(result.error || 'Failed to save pricing');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'לא ניתן לשמור את התמחור';
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

  // Get pricing item name for delete confirmation
  const getPricingName = (pricing: SettlementTankPricing) => {
    const settlement = settlements.find((s) => s.id === pricing.settlement_id);
    const containerType = containerTypes.find(
      (ct) => ct.id === pricing.container_type_id
    );
    return `${settlement?.name || 'יישוב לא ידוע'} - ${containerType?.name || 'מכל לא ידוע'}`;
  };

  return (
    <div className="flex flex-col gap-6 p-6" dir="rtl">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הגדרות', href: '/settings' },
            { label: 'תמחור', isActive: true },
          ]}
        />

        <div className="flex items-center space-x-3 space-x-reverse">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              ניהול תמחור
            </h1>
            <p className="text-text-secondary">
              נהל מחירים עבור סוגי מכלים ביישובים שונים
            </p>
          </div>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש תמחור..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          הוספת תמחור
        </Button>
      </div>

      {/* Pricing Table */}
      <PricingTable
        pricing={pricing}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Pricing Form Modal */}
      <PricingFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        pricing={editingPricing}
        settlements={settlements}
        containerTypes={containerTypes}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        variant="destructive"
        itemName={deletingPricing ? getPricingName(deletingPricing) : ''}
        title="מחיקת תמחור"
        description={`האם אתה בטוח שברצונך למחוק את התמחור עבור "${deletingPricing ? getPricingName(deletingPricing) : ''}"?`}
      />
    </div>
  );
}
