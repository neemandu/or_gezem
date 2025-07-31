import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface Option {
  value: string;
  label: string;
}

interface HebrewSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  rtl?: boolean;
  className?: string;
  disabled?: boolean;
}

const HebrewSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  HebrewSelectProps
>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'בחר אפשרות...',
      label,
      error,
      helperText,
      rtl = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Add state to track if component is mounted
    const [isMounted, setIsMounted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // Ensure component is mounted before rendering
    React.useEffect(() => {
      setIsMounted(true);
      return () => {
        // Cleanup function to handle unmounting
        setIsMounted(false);
        setOpen(false);
        setHasError(false);
      };
    }, []);

    // Additional cleanup effect to ensure dropdown is closed on unmount
    React.useEffect(() => {
      return () => {
        // Force close dropdown when component unmounts
        setOpen(false);
      };
    }, []);

    // Handle value change with error boundary
    const handleValueChange = React.useCallback(
      (newValue: string) => {
        try {
          setHasError(false);
          onValueChange?.(newValue);
        } catch (error) {
          console.error('Error in HebrewSelect value change:', error);
          setHasError(true);
        }
      },
      [onValueChange]
    );

    // Handle open state change with better error handling
    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        try {
          // Only allow opening if component is still mounted
          if (!isMounted) return;

          // If closing, do it immediately to prevent portal issues
          if (!newOpen) {
            setOpen(false);
            return;
          }

          setOpen(newOpen);
          setHasError(false);
        } catch (error) {
          console.error('Error in HebrewSelect open change:', error);
          setHasError(true);
          setOpen(false);
        }
      },
      [isMounted]
    );

    // Reset error state when options change
    React.useEffect(() => {
      setHasError(false);
    }, [options]);

    // Don't render until mounted to prevent hydration issues
    if (!isMounted) {
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
          <div
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive',
              className
            )}
          >
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        </div>
      );
    }

    // If there's an error, show a fallback
    if (hasError) {
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
          <div
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-destructive bg-background px-3 py-2 text-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          >
            <span className="text-muted-foreground">שגיאה בטעינת הבחירה</span>
          </div>
          <button
            onClick={() => setHasError(false)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
          >
            נסה שוב
          </button>
        </div>
      );
    }

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
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          open={open}
          onOpenChange={handleOpenChange}
        >
          <SelectTrigger
            ref={ref}
            className={cn(
              'font-hebrew',
              rtl && 'text-right dir-rtl',
              error && 'border-destructive',
              className
            )}
            dir={rtl ? 'rtl' : 'ltr'}
            {...props}
          >
            <SelectValue
              placeholder={placeholder}
              className={cn(rtl && 'text-right')}
            />
          </SelectTrigger>
          <SelectContent
            className={cn('font-hebrew', rtl && 'text-right')}
            dir={rtl ? 'rtl' : 'ltr'}
            onCloseAutoFocus={(event) => {
              // Prevent focus issues that can cause DOM errors
              event.preventDefault();
            }}
            onEscapeKeyDown={(event: KeyboardEvent) => {
              // Handle escape key to prevent portal issues
              event.preventDefault();
              setOpen(false);
            }}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  rtl &&
                    'text-right pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                )}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

HebrewSelect.displayName = 'HebrewSelect';

export { HebrewSelect, type HebrewSelectProps, type Option };
