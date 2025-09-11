import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean; // New flag for deleting history previlege
  isLoading: boolean; // To track auth state loading, especially initial load
  login: () => Promise<void>;
  logout: () => Promise<void>; // Logout can also be async if it needs to do cleanup
}

// Context is created but not exported; useAuth hook is the public interface
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // isLoading is true initially until we determine auth status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // New state for admin status

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
        }
        setUser(user);
        
        // Vérifier si l'utilisateur est administrateur
        if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in AuthContext:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
    
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          const user = session?.user;
          setUser(user);
          
          // Vérifier si l'utilisateur est administrateur
          if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const login = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Error in login function:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in logout function:', error);
    }
  };

  console.log(
    "AuthContext rendering. isLoading:",
    isLoading,
    "Token:",
    token ? "Exists" : "None",
    "User:",
    user ? user.displayName : "None"
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Check your App.tsx component tree."
    );
  }
  return context;
};
