import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Gauge,
  History,
  BarChart3,
  Wrench,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Conversion',
    href: '/dashboard/conversion',
    icon: <Gauge className="h-5 w-5" />,
  },
  {
    title: 'Historique',
    href: '/dashboard/historique',
    icon: <History className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    title: 'Alertes',
    href: '/dashboard/alerts',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

const DashboardNav: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.href);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = isActive(item.href);

    return (
      <div key={item.href}>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            level > 0 ? 'ml-4' : '',
            active
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={() => hasSubItems && toggleExpanded(item.href)}
        >
          <span className={cn('flex-shrink-0', active && 'text-primary-foreground')}>
            {item.icon}
          </span>
          <span className={cn('truncate', active && 'text-primary-foreground')}>
            {item.title}
          </span>
          {hasSubItems && (
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </Link>

        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems?.map(subItem => renderNavItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-1">
      {navItems.map(item => renderNavItem(item))}
    </nav>
  );
};

export default DashboardNav;
