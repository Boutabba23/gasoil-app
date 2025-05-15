// client/src/components/AuthCallback.tsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Your authentication context hook
import { toast } from "sonner"; // Correct import for Sonner's trigger function
import { Loader2 } from 'lucide-react'; // Optional: for a loading spinner

import{successToastClasses, destructiveToastClasses} from '@/lib/toastStyles';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // The login function from your AuthContext

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token'); // Token passed from backend after successful OAuth
    const error = params.get('error');   // Error message passed from backend if OAuth failed

    if (error) {
      console.error("Google Authentication Error (from backend callback):", error);
      toast.error("Erreur d'Authentification", {
        description: "La connexion avec Google a échoué. Veuillez réessayer ou contacter le support si le problème persiste.",
        className: destructiveToastClasses, // Apply destructive styles
      });
      navigate('/login'); // Redirect back to the login page (or home)
      return;
    }

    if (token) {
      // Attempt to log in the user with the received token
      login(token)
        .then(() => {
          // Login function in AuthContext usually handles setting the token and fetching user data
          toast.success("Connexion Réussie", {
            description: "Vous êtes maintenant connecté et allez être redirigé.",
            className: successToastClasses, // Apply success styles
          });
          navigate('/dashboard'); // Redirect to the main application dashboard
        })
        .catch(err => {
          // This catch block handles errors from your AuthContext's login function
          // (e.g., if /api/auth/me fails after setting the token)
          console.error("Login process failed after token reception:", err);
          toast.error("Finalisation de la Connexion Échouée", {
            description: "Une erreur est survenue lors de la vérification de votre session. Veuillez réessayer.",
            className: destructiveToastClasses, // Apply destructive styles
          });
          navigate('/login'); // Redirect back to login
        });
    } else {
      // This case should ideally not happen if the backend always provides a token or an error
      console.error("AuthCallback: No token or error found in URL parameters.");
      toast.error("Problème d'Authentification", {
        description: "Les informations de connexion nécessaires sont manquantes. Redirection...",
        className: destructiveToastClasses, // Apply destructive styles
      });
      navigate('/login'); // Redirect back to login
    }
    // login function is a dependency for this effect if its identity can change.
  }, [location, navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-6 text-center">
      <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-6" />
      <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
        Authentification en cours...
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Veuillez patienter pendant que nous vérifions votre session.
      </p>
      {/* The Sonner <Toaster /> component should be in your App.tsx or a root layout */}
    </div>
  );
};

export default AuthCallback;