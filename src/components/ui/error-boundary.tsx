'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  rtl?: boolean;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  rtl?: boolean;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          rtl={this.props.rtl}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component with Hebrew text
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  rtl = true,
}) => {
  const goHome = () => {
    window.location.href = '/';
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-background flex items-center justify-center p-4',
        rtl && 'text-right dir-rtl font-hebrew'
      )}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            אופס! משהו השתבש
          </h1>
          <p className="text-muted-foreground">
            אירעה שגיאה בלתי צפויה. אנו מתנצלים על התקלה.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div
            className={cn(
              'bg-muted p-4 rounded-md text-left overflow-auto max-h-32',
              rtl && 'text-left dir-ltr'
            )}
          >
            <code className="text-sm text-muted-foreground">
              {error.message}
            </code>
          </div>
        )}

        <div
          className={cn('flex gap-3 justify-center', rtl && 'flex-row-reverse')}
        >
          <Button
            onClick={resetError}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            נסה שוב
          </Button>
          <Button
            onClick={reloadPage}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            רענן דף
          </Button>
          <Button
            onClick={goHome}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            דף הבית
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          אם הבעיה נמשכת, אנא פנה לתמיכה הטכנית
        </p>
      </div>
    </div>
  );
};

// Simple error fallback for smaller components
const SimpleErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  rtl = true,
}) => {
  return (
    <div
      className={cn(
        'bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center',
        rtl && 'text-right dir-rtl font-hebrew'
      )}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          שגיאה בטעינת הרכיב
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        אירעה שגיאה בטעינת התוכן
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={resetError}
        className="text-xs"
      >
        נסה שוב
      </Button>
    </div>
  );
};

// Hook for handling async errors in components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
};

// Wrapper component for easier usage
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

ErrorBoundary.displayName = 'ErrorBoundary';

export {
  ErrorBoundaryClass,
  DefaultErrorFallback,
  SimpleErrorFallback,
  type ErrorBoundaryProps,
  type ErrorFallbackProps,
};
