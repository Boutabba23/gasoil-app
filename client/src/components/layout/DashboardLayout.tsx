// client/src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar as ShadcnAppSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'; 

import {
  SlidersHorizontal,
  History,
  LogOut,
  Fuel,
  MenuIcon,
  type LucideIcon, // Import the LucideIcon type for better typing
} from 'lucide-react'; // Ensure LucideIcon type is imported if available, or use React.ElementType
import { cn } from '@/lib/utils';

// Define an interface for your navigation items
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon; // Use LucideIcon type, or React.ElementType as a fallback
  // icon: React.ElementType; // A more generic type if LucideIcon is not available/suitable
}

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log("DashboardLayout: Rendering with SHADCN UI Sidebar components.");

  const handleLogout = async () => {
   console.log("DashboardLayout: handleLogout initiated.");
    await logout(); // Calls the logout from AuthContext
    console.log("DashboardLayout: Navigating to /login after logout.");
    navigate('/login'); // Or '/'
  };

  // 👇 Strongly type your navItems array
  const navItems: NavItem[] = [
    { href: '/dashboard/conversion', label: 'Conversion Jauge', icon: SlidersHorizontal },
    { href: '/dashboard/historique', label: 'Historique', icon: History },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-muted/40 dark:bg-slate-950">
        <ShadcnAppSidebar collapsible="icon">
          <SidebarHeader className="h-[60px] border-b dark:border-slate-800 flex items-center px-3">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold whitespace-nowrap">
              <div className="p-1.5 bg-primary rounded-md">
                <Fuel size={20} className="text-primary-foreground" />
              </div>
              <span className="text-lg text-foreground group-[[data-state=collapsed]]:hidden">Gasoil App</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-1">
            <SidebarMenu>
              {navItems.map((item) => {
                // 👇 Here, explicitly tell TypeScript that item.icon is a component
                // TypeScript can usually infer this, but being explicit can help
                const IconComponent = item.icon; 
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.label}
                      size="default"
                    >
                      <Link to={item.href}> 
                        {/* Render the IconComponent correctly */}
                        <IconComponent className="size-4 shrink-0 group-[[data-state=collapsed]]:mr-0 mr-2" />
                        <span className="truncate group-[[data-state=collapsed]]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t dark:border-slate-800">
            {user && (
              <div className={cn("flex items-center gap-3 p-2 mb-1 rounded-md hover:bg-muted dark:hover:bg-slate-700/50", "group-[[data-state=collapsed]]:justify-center group-[[data-state=collapsed]]:p-0 group-[[data-state=collapsed]]:size-10 group-[[data-state=collapsed]]:mb-0")}>
                <Avatar className={cn("h-9 w-9 border", "group-[[data-state=collapsed]]:h-8 group-[[data-state=collapsed]]:w-8")}>
                  <AvatarImage src={user.profilePicture} alt={user.displayName || 'Avatar'} />
                  <AvatarFallback>{user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-col items-start truncate group-[[data-state=collapsed]]:hidden">
                  <span className="text-sm font-medium text-foreground truncate">{user.displayName || "Utilisateur"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email || ""}</span>
                </div>
              </div>
            )}
            <SidebarMenuButton onClick={handleLogout} tooltip="Déconnexion" className="w-full text-red-600 hover:text-red-600 hover:bg-red-500/10 dark:text-red-500 dark:hover:text-red-500 dark:hover:bg-red-400/10">
              <LogOut className="size-4 shrink-0 group-[[data-state=collapsed]]:mr-0 mr-2" />
              <span className="truncate group-[[data-state=collapsed]]:hidden">Déconnexion</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </ShadcnAppSidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-background dark:bg-slate-900">
           <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b bg-background dark:border-slate-800 dark:bg-slate-900 px-4 sm:px-6 shrink-0">
            <SidebarTrigger className="md:hidden text-foreground dark:text-slate-200">
                <MenuIcon className="size-5"/>
            </SidebarTrigger>
            <h1 className="text-xl font-semibold text-foreground dark:text-slate-100 grow">
                {navItems.find(item => location.pathname.startsWith(item.href))?.label || "Tableau de bord"}
            </h1>
           </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>

      </div>
      <Toaster richColors position="bottom-right" expand={false} />
    </SidebarProvider>
  );
};

export default DashboardLayout;