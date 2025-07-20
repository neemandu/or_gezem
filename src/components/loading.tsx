import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({
  message = 'טוען...',
  size = 'md',
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-4" dir="rtl">
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto text-primary`}
        />
        <p className="text-text-secondary font-hebrew">{message}</p>
      </div>
    </div>
  );
}
