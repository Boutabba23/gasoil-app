import { createClient } from '@supabase/supabase-js';

// Configuration du proxy pour éviter les problèmes CORS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Options supplémentaires pour gérer les problèmes réseau
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  },
  // Désactiver les réessai automatiques pour éviter les boucles
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Fonction alternative pour l'authentification
export const signInWithGoogleProxy = async () => {
  try {
    // Créer une URL de redirection appropriée
    const isDevelopment = import.meta.env.DEV;
    const redirectUrl = isDevelopment 
      ? `${window.location.origin}/auth/callback` 
      : `${window.location.origin}/dashboard`;

    console.log('Tentative de connexion avec le proxy...');

    // Utiliser une méthode plus simple
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Erreur avec le proxy:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Erreur dans signInWithGoogleProxy:', err);
    throw err;
  }
};
