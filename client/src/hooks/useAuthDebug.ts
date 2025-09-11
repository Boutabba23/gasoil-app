import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function useAuthDebug() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const getUser = async () => {
      try {
        console.log('useAuthDebug: Tentative de récupération de l'utilisateur...');
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error fetching user:', error);
          setError(error.message);
        } else {
          console.log('useAuthDebug: Utilisateur récupéré:', user);
          setUser(user);
        }
      } catch (err: any) {
        console.error('Error in getUser:', err);
        setError(err.message || 'Erreur lors de la récupération des informations utilisateur');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuthDebug: État d'authentification changé:', event, session);
        setUser(session?.user || null);
        if (event === 'SIGNED_IN') {
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Déterminer si nous sommes en environnement de développement ou de production
      const isDevelopment = import.meta.env.DEV;
      const redirectUrl = isDevelopment 
        ? `${window.location.origin}/auth/callback` 
        : `${window.location.origin}/dashboard`;

      // Configuration supplémentaire pour gérer les problèmes réseau
      const options = {
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      };

      console.log('useAuthDebug: Tentative de connexion avec les options:', options);

      // Essayer avec une configuration plus simple
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        setError(error.message);
        alert(`Erreur de connexion: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Error in signInWithGoogle:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors de la tentative de connexion.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Error in signOut:', err);
      setError(err.message || 'Une erreur est survenue lors de la déconnexion.');
    }
  };

  return { user, loading, error, signInWithGoogle, signOut };
}
