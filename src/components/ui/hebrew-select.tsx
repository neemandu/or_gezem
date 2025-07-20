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
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
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
