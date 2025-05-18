import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Path to your AuthContext
import { Toaster } from "@/components/ui/sonner"; // Sonner for notifications
import VotreLogoSociete from '@/assets/tank.svg'; // Logo for the app

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For User display in Sidebar
import {
  SidebarProvider,
  Sidebar as ShadcnAppSidebar, // Assuming you aliased it
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'; // The ShadCN generated Sidebar
import {
  SlidersHorizontal, // Icon for Conversion
  History,           // Icon for Historique
  LogOut,            // Icon for Logout
  Fuel,              // Icon for App Logo
  MenuIcon           // Icon for Mobile Sidebar Trigger
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const logoContainerSizeClasses = "w-[50px] h-[50px] md:w-[50px] md:h-[50px] my-auto";
  const logoImageSizeClasses = "w-10 h-10 md:w-10 md:h-10 item-center";
  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  const navItems = [
    { href: '/dashboard/conversion', label: 'Conversion Jauge', icon: SlidersHorizontal },
    { href: '/dashboard/historique', label: 'Historique', icon: History },
    // Add more main navigation items for the dashboard here if needed
  ];

  // Determine current page title for the header
  let currentPageTitle = "Tableau de Bord";
  const activeNavItem = navItems.find(item => location.pathname.startsWith(item.href));
  if (activeNavItem) {
    currentPageTitle = activeNavItem.label;
  }

  return (
    <SidebarProvider defaultOpen={true}> {/* Sidebar open by default on desktop */}
      <div className="flex min-h-screen  dark:bg-slate-950"> {/* Overall page background */}
        
        <ShadcnAppSidebar 
          collapsible="icon" // Sidebar collapses to icons
          // You can experiment with variant="inset" or "floating" for different looks
        >
          <SidebarHeader className="h-[60px] border-b bg-[#fcf0b7] justify-center dark:border-slate-800 flex items-center px-3">
            <Link to="/dashboard/conversion" className="flex items-center gap-2.5 font-semibold whitespace-nowrap"> {/* Increased gap */}
              <div 
            className={`
              ${logoContainerSizeClasses} 
              mx-auto rounded-full bg-[#ffea83] shadow-lg 
              flex items-center justify-center overflow-hidden
            `}
          >
            <img 
              src={VotreLogoSociete} 
              alt="Logo Société - Citerne Gasoil" 
              className={`${logoImageSizeClasses} object-contain`}
            />
          </div>
             
              <span className="text-2xl font-bold text-[#FE5D26] group-[[data-state=collapsed]]:hidden">Gestion Gasoil</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-1"> {/* flex-1 ensures it takes available space */}
            <SidebarMenu>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.label}
                      size="default"
                      className={cn( // Custom active styles if needed beyond variant="secondary"
                        isActive && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                      )}
                    >
                      <Link to={item.href}> 
                        <IconComponent className="size-5 shrink-0 group-[[data-state=collapsed]]:mr-0 mr-2.5" /> {/* Slightly larger icon */}
                        <span className="truncate group-[[data-state=collapsed]]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t dark:border-slate-800 space-y-2"> {/* Added space-y-2 */}
            {user && (
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-md", // Removed hover to make it static info
                "group-[[data-state=collapsed]]:justify-center group-[[data-state=collapsed]]:p-1 group-[[data-state=collapsed]]:size-10"
              )}>
                <Avatar className={cn(
                    "h-9 w-9 border",
                    "group-[[data-state=collapsed]]:h-8 group-[[data-state=collapsed]]:w-8"
                )}>
                  <AvatarImage src={user.profilePicture} alt={user.displayName || 'Avatar'} />
                  <AvatarFallback>{user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-col items-start truncate group-[[data-state=collapsed]]:hidden">
                  <span className="block text-sm font-medium text-foreground truncate"> {/* Use block for new line */}
                    {user.displayName || "Utilisateur"}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate"> {/* Use block for new line */}
                    {user.email || "email non disponible"}
                  </span>
                </div>
                </div>
              
            )}
            <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="Déconnexion" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                // ShadCN destructive button style more closely
            >
              <LogOut className="size-5 shrink-0 group-[[data-state=collapsed]]:mr-0 mr-2.5" />
              <span className="truncate group-[[data-state=collapsed]]:hidden">Déconnexion</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </ShadcnAppSidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 overflow-y-auto bg-[#fffcf1] dark:bg-slate-900">
           {/* Header within the main content area */}
           <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b bg-[#fcf0b7] dark:border-slate-800 dark:bg-slate-900 px-4 sm:px-6 shrink-0">
            <SidebarTrigger className="md:hidden text-foreground dark:text-slate-200 p-2 rounded-md hover:bg-muted"> {/* Mobile trigger */}
                <MenuIcon className="size-5"/>
            </SidebarTrigger>
            {/* Optional: Desktop trigger for icon sidebar, if sidebar itself doesn't have one prominently */}
             <SidebarTrigger className="hidden md:flex text-foreground dark:text-slate-200 p-2 rounded-md hover:bg-muted" />
            
            <h1 className="text-xl font-semibold text-foreground dark:text-slate-100">
                {currentPageTitle}
            </h1>
            {/* Future: Add more elements to header like global search, notifications, user dropdown if sidebar doesn't handle all */}
           </header>
           {/* Page content rendered by <Outlet /> */}
          <main className="flex-1 p-4 py-6 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <Toaster richColors position="bottom-right" expand={false} />
    </SidebarProvider>
  );
};

export default DashboardLayout;