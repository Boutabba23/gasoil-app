import   { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api'; // Votre client axios configuré

interface User {
  _id: string;
  googleId: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user, token might be invalid", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          api.defaults.headers.common['Authorization'] = '';
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setIsLoading(true); // Active le chargement pendant la récupération de l'utilisateur
    // fetchUser sera appelé par le useEffect ci-dessus
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    api.defaults.headers.common['Authorization'] = '';
    // Optionnel: appeler une route de logout backend pour invalider le token (si blacklist JWT)
    // await api.post('/auth/logout');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};