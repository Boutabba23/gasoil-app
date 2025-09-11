import { useState, useEffect } from 'react';
import { supabase, signInWithGoogleProxy } from '../lib/supabaseProxy';

interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function useAuthSimple() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const getUser = async () => {
      try {
        console.log('useAuthSimple: Tentative de récupération de l'utilisateur...');

        // Méthode alternative pour récupérer l'utilisateur
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error fetching user:', error);
          setError(error.message);
        } else {
          console.log('useAuthSimple: Utilisateur récupéré:', user);
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
        console.log('useAuthSimple: État d'authentification changé:', event);
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
      console.log('useAuthSimple: Tentative de connexion...');

      // Utiliser notre fonction proxy
      await signInWithGoogleProxy();

      console.log('useAuthSimple: Connexion initiée avec succès');
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
