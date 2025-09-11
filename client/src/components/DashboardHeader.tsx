import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.displayName || "User"} 
                className="w-8 h-8 rounded-full" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {user?.displayName || "Utilisateur"}
              </p>
              {user?.email && (
                <p className="text-sm text-gray-500">{user.email}</p>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 border-l pl-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <ThemeSwitcher />
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => navigate("/dashboard/settings")}
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="secondary">Système en ligne</Badge>
        <Badge variant="secondary">Données à jour</Badge>
      </div>
    </div>
  );
};

export default DashboardHeader;
