import * as React from 'react';

import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  error?: string;
  helperText?: string;
  rtl?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, rtl = true, ...props }, ref) => {
    return (
      <div className={cn('w-full', rtl && 'text-right')}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-foreground mb-2',
              rtl && 'text-right'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-hebrew resize-vertical',
            rtl && 'text-right dir-rtl',
            error && 'border-destructive',
            className
          )}
          dir={rtl ? 'rtl' : 'ltr'}
          ref={ref}
          {...props}
        />
        {error && (
          <p
            className={cn('text-sm text-destructive mt-1', rtl && 'text-right')}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className={cn(
              'text-sm text-muted-foreground mt-1',
              rtl && 'text-right'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
