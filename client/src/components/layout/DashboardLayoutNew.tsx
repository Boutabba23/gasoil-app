import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  Gauge, 
  History, 
  BarChart3, 
  Wrench, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import DashboardNav from '../DashboardNav';
import DashboardFooter from '../DashboardFooter';
import DashboardHeader from '../DashboardHeader';

const DashboardLayoutNew: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={toggleMobileSidebar}>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <h1 className="text-xl font-bold">Gestion Gasoil</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DashboardNav />
            </div>
            <DashboardFooter />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden md:flex md:flex-col md:w-[280px] lg:w-[350px] border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-[70px]' : ''
      )}>
        <div className="flex h-16 items-center border-b px-6">
          <div className={cn(
            'flex items-center gap-2',
            sidebarCollapsed ? 'justify-center' : ''
          )}>
            <div className="bg-primary text-primary-foreground rounded-md p-1">
              <Gauge className="h-6 w-6" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold">Gestion Gasoil</h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              'ml-auto',
              sidebarCollapsed ? 'ml-0' : ''
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <DashboardNav />
        </div>

        {!sidebarCollapsed && <DashboardFooter />}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex h-16 items-center border-b bg-background px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="ml-4 text-xl font-bold">Gestion Gasoil</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex h-16 items-center border-b bg-background px-6">
          <DashboardHeader 
            title="Tableau de bord" 
            subtitle="Surveillance et gestion du réservoir de carburant"
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutNew;
