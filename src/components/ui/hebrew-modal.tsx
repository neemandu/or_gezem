import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { X } from 'lucide-react';

interface HebrewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  rtl?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const HebrewModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  rtl = true,
  className,
  size = 'md',
  showCloseButton = true,
}: HebrewModalProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'font-hebrew',
          rtl && 'text-right dir-rtl',
          sizeClasses[size],
          className
        )}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {showCloseButton && (
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'absolute top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
              rtl ? 'left-4' : 'right-4'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </button>
        )}

        {(title || description) && (
          <DialogHeader className={cn(rtl && 'text-right')}>
            {title && (
              <DialogTitle className={cn(rtl && 'text-right')}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className={cn(rtl && 'text-right')}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className={cn('py-4', rtl && 'text-right')}>{children}</div>

        {footer && (
          <DialogFooter
            className={cn('flex gap-2', rtl ? 'flex-row-reverse' : 'flex-row')}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

HebrewModal.displayName = 'HebrewModal';

export { HebrewModal, type HebrewModalProps };
