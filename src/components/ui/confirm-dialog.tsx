import * as React from 'react';
import { cn } from '@/lib/utils';
import { HebrewModal } from './hebrew-modal';
import { Button } from './button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  itemName?: string;
  rtl?: boolean;
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = 'ביטול',
  variant = 'destructive',
  loading = false,
  itemName,
  rtl = true,
}: ConfirmDialogProps) => {
  // Default titles and descriptions based on variant
  const defaultTexts = {
    destructive: {
      title: itemName ? `מחיקת ${itemName}` : 'אישור מחיקה',
      description: itemName
        ? `האם אתה בטוח שברצונך למחוק את ${itemName}? פעולה זו אינה הפיכה.`
        : 'האם אתה בטוח שברצונך למחוק פריט זה? פעולה זו אינה הפיכה.',
      confirmText: 'מחק',
    },
    default: {
      title: 'אישור פעולה',
      description: 'האם אתה בטוח שברצונך לבצע פעולה זו?',
      confirmText: 'אישור',
    },
  };

  const texts = defaultTexts[variant];

  const handleConfirm = () => {
    onConfirm();
    // Don't close automatically - let parent component handle it after API call
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <HebrewModal
      open={open}
      onOpenChange={onOpenChange}
      title={title || texts.title}
      description={description || texts.description}
      rtl={rtl}
      size="sm"
      showCloseButton={!loading}
      footer={
        <div
          className={cn(
            'flex gap-2 w-full',
            rtl ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>מבצע...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {variant === 'destructive' ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{confirmText || texts.confirmText}</span>
              </div>
            )}
          </Button>
        </div>
      }
    >
      <div
        className={cn(
          'flex items-center gap-3 py-4',
          rtl && 'flex-row-reverse text-right'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            variant === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-warning/10 text-warning'
          )}
        >
          {variant === 'destructive' ? (
            <Trash2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {variant === 'destructive'
              ? 'פעולה זו תמחק את הנתונים לצמיתות ולא ניתן יהיה לשחזרם.'
              : 'אנא וודא שברצונך לבצע פעולה זו לפני המשך.'}
          </p>
        </div>
      </div>
    </HebrewModal>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ConfirmDialogProps>>({});

  const confirm = React.useCallback(
    (options: Partial<ConfirmDialogProps> = {}) => {
      return new Promise<boolean>((resolve) => {
        setConfig({
          ...options,
          onConfirm: async () => {
            setLoading(true);
            try {
              if (options.onConfirm) {
                await options.onConfirm();
              }
              setIsOpen(false);
              resolve(true);
            } catch (error) {
              resolve(false);
            } finally {
              setLoading(false);
            }
          },
        });
        setIsOpen(true);
      });
    },
    []
  );

  const ConfirmDialogComponent = React.useCallback(
    () => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        loading={loading}
        onConfirm={() => {}}
        {...config}
      />
    ),
    [isOpen, loading, config]
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    loading,
  };
};

ConfirmDialog.displayName = 'ConfirmDialog';

export { ConfirmDialog, type ConfirmDialogProps };
