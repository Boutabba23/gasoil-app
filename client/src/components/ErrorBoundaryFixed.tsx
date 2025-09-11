import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Une erreur est survenue
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'Une erreur inattendue s'est produite dans l'application.'}
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left mb-6 max-h-60 overflow-auto">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Détails de l'erreur:</p>
              <pre className="text-xs text-red-500 dark:text-red-400 whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={this.handleReload} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
