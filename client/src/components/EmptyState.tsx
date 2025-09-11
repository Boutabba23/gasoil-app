import React from 'react';
import { 
  Inbox, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  type: 'data' | 'history' | 'analytics' | 'alerts' | 'custom';
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'data':
        return <Inbox className="h-12 w-12 text-gray-400" />;
      case 'history':
        return <FileText className="h-12 w-12 text-gray-400" />;
      case 'analytics':
        return <BarChart3 className="h-12 w-12 text-gray-400" />;
      case 'alerts':
        return <AlertTriangle className="h-12 w-12 text-gray-400" />;
      default:
        return <Inbox className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {getIcon()}
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {description}
        </p>
        {action && (
          <Button 
            className="mt-4" 
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.text}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
