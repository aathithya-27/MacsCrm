import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md mb-6 w-full max-w-lg text-left overflow-auto text-xs font-mono text-red-600 dark:text-red-400">
             {this.state.error?.message}
          </div>
          <Button onClick={() => window.location.reload()} variant="primary">
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}