import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Déterminer si nous sommes en environnement de développement ou de production
      const isDevelopment = import.meta.env.DEV;
      const redirectUrl = isDevelopment 
        ? `${window.location.origin}/auth/callback` 
        : `${window.location.origin}/dashboard`;
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        alert(`Erreur de connexion: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      alert(`Une erreur est survenue lors de la tentative de connexion.`);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, signInWithGoogle, signOut };
}
