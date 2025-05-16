import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// 👇 UPDATED IMPORT PATH
import { useAuth } from '../contexts/AuthContext'; 

const ProtectedRoute: React.FC = () => {
  const { user, isLoading, token } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: isLoading=", isLoading, "user=", !!user, "token=", !!token);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement de la session utilisateur...
        </div>
      </div>
    );
  }

  if (!user && !token) {
    console.log("ProtectedRoute: No user and no token, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!user && token) {
    console.log("ProtectedRoute: Token exists but no user, redirecting to login (likely invalid token).");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute: User authenticated, rendering Outlet.");
  return <Outlet />;
};

export default ProtectedRoute;