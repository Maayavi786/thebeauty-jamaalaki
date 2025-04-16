import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error }: { error: Error | null }) => {
  const { isLtr } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-16">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {isLtr ? "Something went wrong" : "حدث خطأ ما"}
        </AlertTitle>
        <AlertDescription>
          {isLtr 
            ? "We're sorry, but something went wrong. Please try refreshing the page."
            : "نعتذر، ولكن حدث خطأ ما. يرجى تحديث الصفحة."
          }
        </AlertDescription>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            {isLtr ? "Refresh Page" : "تحديث الصفحة"}
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default ErrorBoundary; 