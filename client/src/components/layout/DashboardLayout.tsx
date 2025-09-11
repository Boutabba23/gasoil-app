import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Path to your AuthContext
import { Toaster } from "@/components/ui/sonner"; // Sonner for notifications
import VotreLogoSociete from "@/assets/tank.svg"; // Logo for the app

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
  useSidebar, // Import useSidebar to get collapsed state
} from "@/components/ui/sidebar"; // The ShadCN generated Sidebar
import {
  SlidersHorizontal, // Icon for Conversion
  History, // Icon for Historique
  LogOut, // Icon for Logout
  type LucideIcon,
  // Icon for App Logo
  MenuIcon, // Icon for Mobile Sidebar Trigger
  UserCircle,
  Settings, // Icon for Settings
  BarChart3, // Icon for Analytics
  Bell, // Icon for Alerts
  Wrench, // Icon for Maintenance
} from "lucide-react";
import { cn } from "@/lib/utils";
interface NavItemType {
  href: string;
  label: string;
  icon: LucideIcon; // Use the specific LucideIcon type
}

const dashboardNavItems: NavItemType[] = [
  {
    href: "/dashboard/conversion",
    label: "Conversion Jauge",
    icon: SlidersHorizontal,
  },
  { href: "/dashboard/historique", label: "Historique", icon: History },
  { href: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/alerts", label: "Alertes", icon: Bell },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

const MobileAwareNavLink: React.FC<{
  to: string;
  label: string;
  icon: LucideIcon;
}> = ({ to, label, icon: IconComponent }) => {
  const location = useLocation();
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar(); // Get mobile state and setter

  const isActive = location.pathname.startsWith(to);

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false); // Close mobile sidebar on click
    }
    // Navigation will happen via the Link component
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild // Allows Link to take on Button styling and behavior
        isActive={isActive}
        tooltip={label} // Shows when desktop sidebar is collapsed to icons
        size="default"
        className="group-[[data-state=collapsed]]:justify-center"
        // We need to add onClick to the Link or have SidebarMenuButton pass it through.
        // Since `asChild` is used, the `Link` gets the `onClick`.
      >
        <Link to={to} onClick={handleClick}>
          <IconComponent className="size-5 shrink-0" />
          <span
            className={cn(
              "truncate ml-2",
              sidebarState === "collapsed" && !isMobile && "hidden" // More robust hiding for desktop collapsed
            )}
          >
            {label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const logoContainerSizeClasses =
    "w-[50px] h-[50px] md:w-[50px] md:h-[50px] my-auto";
  const logoImageSizeClasses = "w-10 h-10 md:w-10 md:h-10 item-center";
  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <SidebarProvider defaultOpen={true}>
      {" "}
      {/* Sidebar open by default on desktop */}
      <div className="flex min-h-screen w-full dark:bg-slate-950">
        {" "}
        {/* Overall page background */}
        <ShadcnAppSidebar
          collapsible="icon" // Sidebar collapses to icons
          // You can experiment with variant="inset" or "floating" for different looks
        >
          <SidebarHeader className=" h-[60px] border-b bg-[#fcf0b7]/85 backdrop-blur-lg shadow-sm justify-center dark:border-slate-800 flex items-center px-3">
            <Link
              to="/dashboard/conversion"
              className="flex items-center gap-2.5 font-semibold whitespace-nowrap"
            >
              {" "}
              {/* Increased gap */}
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
              <span className="text-2xl font-bold text-[#FE5D26] group-[[data-state=collapsed]]:hidden">
                Gestion Gasoil
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-1 group-[[data-state=collapsed]]:grid group-[[data-state=collapsed]]:justify-center">
            {" "}
            {/* flex-1 ensures it takes available space */}
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <MobileAwareNavLink
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t dark:border-slate-800 items-center space-y-2">
            {" "}
            {/* Added space-y-2 */}
            {user && (
              <div
                className={cn(
                  "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm", // Base classes like SidebarMenuButton
                  "group-[[data-state=collapsed]]:justify-center group-[[data-state=collapsed]]:p-0 group-[[data-state=collapsed]]:aspect-square group-[[data-state=collapsed]]:w-[calc(var(--sidebar-width-icon)-theme(spacing.4))]" // Match collapsed size roughly
                )}
                // The p-2 for expanded comes from SidebarMenuButton default padding
                // For collapsed, aspect-square and a calculated width to hold just the avatar can work
              >
                <Avatar
                  className={cn(
                    "h-9 w-9 border",
                    "group-[[data-state=collapsed]]:h-8 group-[[data-state=collapsed]]:w-8" // Avatar size when collapsed
                  )}
                >
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.displayName || "Avatar"}
                  />
                  <AvatarFallback>
                    {user.displayName ? (
                      user.displayName.substring(0, 1).toUpperCase()
                    ) : (
                      <UserCircle size={20} />
                    )}
                  </AvatarFallback>
                </Avatar>
                {/* Text part - already hidden correctly when collapsed */}
                <div className="flex-col items-start truncate group-[[data-state=collapsed]]:hidden">
                  <span className="text-sm font-medium text-foreground truncate block">
                    {" "}
                    {/* Added block */}
                    {user.displayName || "Utilisateur"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate block">
                    {" "}
                    {/* Added block */}
                    {user.email || ""}
                  </span>
                </div>
              </div>
            )}
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Déconnexion"
              className="w-full text-destructive hover:text-destructive hover:cursor-pointer hover:bg-destructive/10 dark:hover:bg-destructive/20 group-[[data-state=collapsed]]:justify-center"
              // ShadCN destructive button style more closely
            >
              <LogOut className="size-5 shrink-0 group-[[data-state=collapsed]]:mr-0 mr-2.5" />
              <span className="truncate group-[[data-state=collapsed]]:hidden">
                Déconnexion
              </span>
            </SidebarMenuButton>
          </SidebarFooter>
        </ShadcnAppSidebar>
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-[#fffcf1] dark:bg-slate-900">
          {/* Header within the main content area */}

          {/* Page content rendered by <Outlet /> */}
          <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 overflow-auto pt-[60px] sm:pt-[calc(60px+theme(spacing.4))]">
            <Outlet />
          </main>
        </SidebarInset>
        <DashboardLayoutContent navItems={dashboardNavItems} />
      </div>
      <Toaster richColors position="bottom-right" expand={false} />
    </SidebarProvider>
  );
};

// New component to easily access useSidebar context
const DashboardLayoutContent: React.FC<{ navItems: NavItemType[] }> = ({
  navItems,
}) => {
  const { state: sidebarState, isMobile } = useSidebar(); // Get 'expanded' or 'collapsed' state and isMobile
  const location = useLocation();

  // Determine the left offset for the fixed header
  // These should match your --sidebar-width and --sidebar-width-icon from globals.css
  const sidebarExpandedWidth = "16rem"; // 256px, should match --sidebar-width
  const sidebarCollapsedWidth = "4rem"; // 48px, should match --sidebar-width-icon
  // If you changed --sidebar-width-icon to 4.5rem, use that here
  // const sidebarCollapsedWidth = "4.5rem";

  // On mobile, the sidebar is a sheet, so header has no left offset (left-0)
  // On desktop, header's left position depends on sidebar state
  const headerLeftOffset = isMobile
    ? "0px"
    : sidebarState === "expanded"
    ? sidebarExpandedWidth
    : sidebarCollapsedWidth;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 flex h-[60px] items-center gap-3 border-b",
        "bg-[#fcf0b7]/85 backdrop-blur-lg shadow-sm dark:border-slate-800 dark:bg-slate-900", // Your custom background
        "px-4 sm:px-6 shrink-0 transition-all duration-200 ease-linear" // Added transition
      )}
      // 👇 Dynamically set the 'left' style and calculate 'width'
      //    or use margin-left if your Sidebar component uses fixed positioning with a gap element
      style={{
        left: headerLeftOffset,
        width: `calc(100% - ${headerLeftOffset})`,
      }}
    >
      <SidebarTrigger
        className={cn(
          "text-foreground dark:text-slate-200",
          isMobile ? "flex" : "md:hidden" // Show on mobile, hide on desktop if sidebar trigger is also for collapse
        )}
      >
        <MenuIcon className="size-5" />
      </SidebarTrigger>

      {/* Optional: Desktop collapse trigger if your sidebar collapsible="icon" and you want an explicit button */}
      {!isMobile && (
        <SidebarTrigger className="text-foreground dark:text-slate-200">
          <MenuIcon className="size-5" />{" "}
          {/* Or PanelLeftClose, PanelLeftOpen */}
        </SidebarTrigger>
      )}

      <h1 className="text-xl font-semibold text-foreground dark:text-slate-100 grow">
        {navItems.find((item) => location.pathname.startsWith(item.href))
          ?.label || "Tableau de bord"}
      </h1>
      {/* Other header elements */}
    </header>
  );
};

export default DashboardLayout;
