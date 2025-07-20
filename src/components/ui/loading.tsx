import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  rtl?: boolean;
  className?: string;
  fullScreen?: boolean;
}

const Loading = ({
  size = 'md',
  text = 'טוען...',
  rtl = true,
  className,
  fullScreen = false,
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-3',
        rtl && 'flex-row-reverse text-right',
        className
      )}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <span
          className={cn(
            'font-hebrew text-muted-foreground',
            textSizeClasses[size]
          )}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-center">{content}</div>
      </div>
    );
  }

  return content;
};

// Skeleton loading component for placeholders
interface SkeletonProps {
  className?: string;
  rtl?: boolean;
}

const Skeleton = ({ className, rtl = true, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        rtl && 'dir-rtl',
        className
      )}
      {...props}
    />
  );
};

// Loading overlay for specific components
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  rtl?: boolean;
}

const LoadingOverlay = ({
  loading,
  children,
  text = 'טוען...',
  rtl = true,
}: LoadingOverlayProps) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm">
          <div className="flex h-full items-center justify-center">
            <Loading text={text} rtl={rtl} />
          </div>
        </div>
      )}
    </div>
  );
};

Loading.displayName = 'Loading';
Skeleton.displayName = 'Skeleton';
LoadingOverlay.displayName = 'LoadingOverlay';

export { Loading, Skeleton, LoadingOverlay, type LoadingProps };
