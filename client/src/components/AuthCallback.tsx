// client/src/components/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  console.log("AuthCallback mounted. Location:", location);

  useEffect(() => {
    console.log("AuthCallback useEffect triggered. isLoading:", isLoading);
    const params = new URLSearchParams(location.search);
    const error = params.get('error');

    console.log("AuthCallback: Error from URL:", error);

    if (error) {
      console.error("Google Auth Error (from URL):", error);
      toast.error("Erreur d'authentification", {
        description: "La connexion avec Google a échoué. Veuillez réessayer.",
        className: destructiveSonnerToastClasses,
      });
      navigate('/login');
      return;
    }

    // Avec Supabase, la connexion est gérée automatiquement via le callback OAuth
    // On n'a pas besoin de passer un token manuellement
    if (!isLoading) {
      console.log("AuthCallback: Auth process completed, navigating to dashboard.");
      navigate('/dashboard');
    }
  }, [location, navigate, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-6 text-center">
      <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-6" />
      <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
        Authentification en cours...
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Veuillez patienter pendant que nous vérifions votre session.
      </p>
    </div>
  );
};

export default AuthCallback;