import { toast } from '@/hooks/use-toast';

export interface HebrewToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

// Success messages in Hebrew
export const showSuccessToast = ({
  title = 'הצלחה!',
  description,
  duration = 3000,
}: HebrewToastOptions = {}) => {
  return toast({
    title,
    description,
    duration,
    className: 'font-hebrew text-right dir-rtl border-success bg-success/10',
  });
};

// Error messages in Hebrew
export const showErrorToast = ({
  title = 'שגיאה!',
  description,
  duration = 5000,
}: HebrewToastOptions = {}) => {
  return toast({
    title,
    description,
    duration,
    variant: 'destructive',
    className: 'font-hebrew text-right dir-rtl',
  });
};

// Warning messages in Hebrew
export const showWarningToast = ({
  title = 'אזהרה!',
  description,
  duration = 4000,
}: HebrewToastOptions = {}) => {
  return toast({
    title,
    description,
    duration,
    className: 'font-hebrew text-right dir-rtl border-warning bg-warning/10',
  });
};

// Info messages in Hebrew
export const showInfoToast = ({
  title = 'מידע',
  description,
  duration = 3000,
}: HebrewToastOptions = {}) => {
  return toast({
    title,
    description,
    duration,
    className: 'font-hebrew text-right dir-rtl border-primary bg-primary/10',
  });
};

// Specific action toasts
export const showSaveSuccessToast = (itemName?: string) => {
  return showSuccessToast({
    title: 'נשמר בהצלחה!',
    description: itemName ? `${itemName} נשמר במערכת` : undefined,
  });
};

export const showDeleteSuccessToast = (itemName?: string) => {
  return showSuccessToast({
    title: 'נמחק בהצלחה!',
    description: itemName ? `${itemName} נמחק מהמערכת` : undefined,
  });
};

export const showUpdateSuccessToast = (itemName?: string) => {
  return showSuccessToast({
    title: 'עודכן בהצלחה!',
    description: itemName ? `${itemName} עודכן במערכת` : undefined,
  });
};

export const showLoadingErrorToast = () => {
  return showErrorToast({
    title: 'שגיאה בטעינת הנתונים',
    description: 'אנא נסה שוב מאוחר יותר',
  });
};

export const showSaveErrorToast = () => {
  return showErrorToast({
    title: 'שגיאה בשמירה',
    description: 'לא ניתן לשמור את הנתונים, אנא נסה שוב',
  });
};

export const showDeleteErrorToast = () => {
  return showErrorToast({
    title: 'שגיאה במחיקה',
    description: 'לא ניתן למחוק את הפריט, אנא נסה שוב',
  });
};

export const showValidationErrorToast = () => {
  return showErrorToast({
    title: 'שגיאת תקינות',
    description: 'אנא בדוק את הנתונים שהוזנו ונסה שוב',
  });
};

export const showNetworkErrorToast = () => {
  return showErrorToast({
    title: 'בעיית רשת',
    description: 'בדוק את חיבור האינטרנט ונסה שוב',
  });
};

// Utility function for API responses
export const handleApiResponse = (
  success: boolean,
  message?: string,
  itemName?: string
) => {
  if (success) {
    showSuccessToast({
      title: 'הצלחה!',
      description:
        message || (itemName ? `${itemName} בוצע בהצלחה` : undefined),
    });
  } else {
    showErrorToast({
      title: 'שגיאה!',
      description: message || 'הפעולה נכשלה, אנא נסה שוב',
    });
  }
};
