# Hebrew RTL UI Components

This directory contains reusable UI components built with shadcn/ui and enhanced for Hebrew text with RTL (Right-to-Left) support.

## Form Components

### Input

Enhanced input component with Hebrew label support and RTL text direction.

```tsx
import { Input } from '@/components/ui/input';

<Input
  label="שם המשתמש"
  placeholder="הכנס שם משתמש"
  error="שדה חובה"
  helperText="מינימום 3 תווים"
  rtl={true} // default
/>;
```

### Textarea

Textarea component with Hebrew support and RTL direction.

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  label="הערות"
  placeholder="הכנס הערות נוספות..."
  error="טקסט ארוך מדי"
  rtl={true} // default
/>;
```

### HebrewSelect

Select dropdown with Hebrew options and RTL support.

```tsx
import { HebrewSelect } from '@/components/ui/hebrew-select';

<HebrewSelect
  label="בחר יישוב"
  placeholder="בחר אפשרות..."
  options={[
    { value: '1', label: 'ירושלים' },
    { value: '2', label: 'תל אביב' },
  ]}
  onValueChange={(value) => console.log(value)}
  error="יש לבחור יישוב"
/>;
```

## Data Components

### DataTable

Simple data table with Hebrew headers and RTL support.

```tsx
import { DataTable } from '@/components/ui/data-table'

const columns = [
  { key: 'name', header: 'שם', render: (value) => <strong>{value}</strong> },
  { key: 'phone', header: 'טלפון' },
  { key: 'active', header: 'פעיל', render: (value) => value ? 'כן' : 'לא' },
]

<DataTable
  data={settlements}
  columns={columns}
  loading={false}
  emptyMessage="אין יישובים להצגה"
  onRowClick={(row) => console.log(row)}
/>
```

### HebrewModal

Modal dialog with Hebrew content and RTL support.

```tsx
import { HebrewModal } from '@/components/ui/hebrew-modal';
import { Button } from '@/components/ui/button';

<HebrewModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="עריכת נהג"
  description="ערוך את פרטי הנהג"
  size="md"
  footer={
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        ביטול
      </Button>
      <Button onClick={handleSave}>שמור</Button>
    </div>
  }
>
  {/* Modal content */}
</HebrewModal>;
```

## Notification Components

### Hebrew Toast

Pre-configured toast notifications in Hebrew.

```tsx
import {
  showSuccessToast,
  showErrorToast,
  showSaveSuccessToast,
  showDeleteErrorToast,
} from '@/components/ui/hebrew-toast';

// Show success message
showSuccessToast({
  title: 'הצלחה!',
  description: 'הפעולה הושלמה בהצלחה',
});

// Predefined messages
showSaveSuccessToast('נהג');
showDeleteErrorToast();
```

## Utility Components

### Loading

Loading spinner with Hebrew text support.

```tsx
import { Loading, LoadingOverlay, Skeleton } from '@/components/ui/loading'

// Simple loading spinner
<Loading size="md" text="טוען נתונים..." />

// Full screen loading
<Loading fullScreen text="אנא המתן..." />

// Loading overlay
<LoadingOverlay loading={isLoading}>
  <YourComponent />
</LoadingOverlay>

// Skeleton placeholders
<Skeleton className="h-4 w-[250px]" />
```

### ConfirmDialog

Confirmation dialog for delete operations with Hebrew text.

```tsx
import {
  ConfirmDialog,
  useConfirmDialog,
} from '@/components/ui/confirm-dialog';

// Using the hook
const { confirm, ConfirmDialog } = useConfirmDialog();

const handleDelete = async () => {
  const confirmed = await confirm({
    itemName: 'נהג זה',
    variant: 'destructive',
  });

  if (confirmed) {
    // Perform delete
  }
};

// Render the dialog
<ConfirmDialog />;
```

### ErrorBoundary

Error boundary with Hebrew error messages.

```tsx
import {
  ErrorBoundary,
  SimpleErrorFallback,
} from '@/components/ui/error-boundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Component error:', error);
  }}
  fallback={SimpleErrorFallback}
>
  <YourComponent />
</ErrorBoundary>;
```

## RTL Support

All components include RTL support by default:

- Text alignment: `text-right`
- Direction: `dir="rtl"`
- Layout direction: `flex-row-reverse` for button groups
- Font family: `font-hebrew` (defined in tailwind.config.ts)

## Styling

Components use the design system defined in:

- `tailwind.config.ts` - Contains Hebrew font family and RTL utilities
- CSS variables for colors and spacing
- shadcn/ui base styles with Hebrew enhancements

## Usage Tips

1. **Consistent RTL**: All components default to RTL mode
2. **Hebrew Fonts**: Use `font-hebrew` class for Hebrew text
3. **Validation**: Use Zod schemas from `@/lib/validations` for form validation
4. **Error Handling**: Components include built-in error states and Hebrew messages
5. **Accessibility**: Components maintain keyboard navigation and screen reader support
