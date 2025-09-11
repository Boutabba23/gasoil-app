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
    // Check if user is already logged in
    const getUser = async () => {
      try {
        console.log('useAuthSimple: Attempting to retrieve user...');

        // Alternative method to get user
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error fetching user:', error);
          setError(error.message);
        } else {
          console.log('useAuthSimple: User retrieved:', user);
          setUser(user);
        }
      } catch (err: any) {
        console.error('Error in getUser:', err);
        setError(err.message || 'Error retrieving user information');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuthSimple: Auth state changed:', event);
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
      console.log('useAuthSimple: Attempting login...');

      // Use our proxy function
      await signInWithGoogleProxy();

      console.log('useAuthSimple: Login initiated successfully');
    } catch (err: any) {
      console.error('Error in signInWithGoogle:', err);
      const errorMessage = err.message || 'An error occurred during login attempt.';
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
      setError(err.message || 'An error occurred during logout.');
    }
  };

  return { user, loading, error, signInWithGoogle, signOut };
}
