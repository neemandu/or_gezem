'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TanksTable } from '@/components/tanks-table';
import { TankFormModal } from '@/components/tank-form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { ContainerType } from '@/types/api';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface TanksPageProps {}

export default function TanksPage({}: TanksPageProps) {
  const [tanks, setTanks] = useState<ContainerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<ContainerType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTank, setDeletingTank] = useState<ContainerType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // Fetch tanks
  const fetchTanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tanks');
      if (!response.ok) throw new Error('Failed to fetch tanks');
      const result = await response.json();
      setTanks(result.data || []);
    } catch (error) {
      console.error('Error fetching tanks:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את רשימת המכלים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  // Handle add tank
  const handleAdd = () => {
    setEditingTank(null);
    setIsModalOpen(true);
  };

  // Handle edit tank
  const handleEdit = (tank: ContainerType) => {
    setEditingTank(tank);
    setIsModalOpen(true);
  };

  // Handle delete tank - now opens confirmation dialog
  const handleDelete = (tank: ContainerType) => {
    setDeletingTank(tank);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingTank) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/tanks/${deletingTank.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tank');

      toast({
        title: 'הצלחה',
        description: 'המכל נמחק בהצלחה',
      });

      await fetchTanks();
      setDeleteModalOpen(false);
      setDeletingTank(null);
    } catch (error) {
      console.error('Error deleting tank:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המכל',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingTank ? `/api/tanks/${editingTank.id}` : '/api/tanks';
      const method = editingTank ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save tank');
      toast({
        title: 'הצלחה',
        description: editingTank ? 'המכל עודכן בהצלחה' : 'המכל נוסף בהצלחה',
      });

      setIsModalOpen(false);
      fetchTanks();
    } catch (error) {
      console.error('Error saving tank:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את פרטי המכל',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6" dir="rtl">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/dashboard' },
            { label: 'הגדרות', href: '/settings' },
            { label: 'מכלים', isActive: true },
          ]}
        />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          ניהול מכלי פסולת
        </h1>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="חיפוש מכלים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          הוספת מכל
        </Button>
      </div>

      {/* Tanks Table */}
      <TanksTable
        tanks={tanks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Tank Form Modal */}
      <TankFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        tank={editingTank}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        variant="destructive"
        itemName={deletingTank?.name}
        title="מחיקת מכל"
        description={`האם אתה בטוח שברצונך למחוק את המכל "${deletingTank?.name}"? פעולה זו תמחק גם את כל הדוחות הקשורים למכל זה.`}
      />
    </div>
  );
}
