// client/src/components/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// 👇 UPDATED IMPORT PATH
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

// ... (rest of AuthCallback.tsx from previous message, ensure useAuth import is updated) ...
//const successSonnerToastClasses = "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth(); // isLoading might be useful here too

  console.log("AuthCallback mounted. Location:", location);

  useEffect(() => {
    console.log("AuthCallback useEffect triggered. isLoading:", isLoading);
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    console.log("AuthCallback: Token from URL:", token);
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

    if (token) {
      console.log("AuthCallback: Attempting login with token...");
      login(token)
        .then(() => {
          console.log("AuthCallback: AuthContext login process finished, navigating to dashboard.");
          // Toast can be shown here or upon successful user fetch in AuthContext, depending on UX preference
          // toast.success("Connexion Réussie", { description: "Redirection...", className: successSonnerToastClasses });
          navigate('/dashboard');
        })
        .catch(err => {
          console.error("AuthCallback: AuthContext login function promise rejected:", err);
          toast.error("Finalisation de la Connexion Échouée", {
            description: "Une erreur est survenue. Veuillez réessayer.",
            className: destructiveSonnerToastClasses,
          });
          navigate('/login');
        });
    } else {
      // Only navigate if not already in an auth loading state (e.g. from a previous attempt)
      // and if this component isn't just quickly unmounting due to successful login
      if (!isLoading && !error) { // If no token, no error, and not already loading
        console.warn("AuthCallback: No token and no error in URL parameters, navigating to login.");
        toast.error("Problème d'authentification", {
            description: "Informations de connexion manquantes.",
            className: destructiveSonnerToastClasses,
        });
        navigate('/login');
      } else if (isLoading) {
          console.log("AuthCallback: isLoading is true, likely auth in progress, waiting.")
      }
    }
    // Removed login from dependency array to avoid re-triggering if login function identity changes unnecessarily.
    // The effect should run based on location changes.
  }, [location, navigate, isLoading]); // Add isLoading to prevent premature navigation if auth is slow.

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