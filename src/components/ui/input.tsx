import * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
  rtl?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, helperText, rtl = true, ...props },
    ref
  ) => {
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
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-hebrew',
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
Input.displayName = 'Input';

export { Input, type InputProps };
