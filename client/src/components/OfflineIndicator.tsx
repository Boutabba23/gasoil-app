import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);

      // Auto-hide after 3 seconds when coming back online
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <Alert className={`fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 ${
      isOnline ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'
    }`}>
      <div className="flex items-start">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500 mt-0.5" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500 mt-0.5" />
        )}
        <AlertDescription className="ml-2 flex-1">
          {isOnline ? (
            <span className="text-green-700 dark:text-green-300">
              Connexion rétablie. Toutes les données ont été synchronisées.
            </span>
          ) : (
            <span className="text-red-700 dark:text-red-300">
              Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
            </span>
          )}
        </AlertDescription>
        {isOnline && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 ml-2"
            onClick={() => setShowAlert(false)}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default OfflineIndicator;
