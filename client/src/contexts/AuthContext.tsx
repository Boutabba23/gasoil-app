import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import api from "../lib/api"; // Your configured axios instance

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
  isAdmin: boolean; // New flag for deleting history previlege
  isLoading: boolean; // To track auth state loading, especially initial load
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>; // Logout can also be async if it needs to do cleanup
}

// Context is created but not exported; useAuth hook is the public interface
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Initialize token from localStorage on component mount
    const storedToken = localStorage.getItem("authToken");
    console.log("AuthContext: Initial token from localStorage:", storedToken);
    return storedToken;
  });
  // isLoading is true initially until we determine auth status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // New state for admin status

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      console.log("AuthContext useEffect: Current token state:", token);
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          console.log("AuthContext useEffect: Fetching /api/auth/me");
          const response = await api.get("/auth/me");
          const fetchedUser: User = response.data;
          console.log(
            "AuthContext useEffect: User fetched successfully:",
            response.data
          );
          setUser(response.data);
          if (
            fetchedUser &&
            fetchedUser.googleId === import.meta.env.VITE_ADMIN_GOOGLE_ID
          ) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error: any) {
          console.error(
            "AuthContext useEffect: Failed to fetch user, clearing token.",
            error.response?.data || error.message
          );
          localStorage.removeItem("authToken");
          setUser(null);
          setToken(null); // This change to token will re-trigger the useEffect.
          delete api.defaults.headers.common["Authorization"];
          setIsAdmin(false);

          // setIsLoading(false) will be handled by the subsequent run of this useEffect when token becomes null
          return; // Important to return here so isLoading isn't set to false prematurely
        } finally {
          setIsLoading(false);
        }
      } else {
        // No token exists (or was cleared)
        console.log(
          "AuthContext useEffect: No token. Clearing user and API auth header."
        );
        setUser(null);
        delete api.defaults.headers.common["Authorization"];
        setIsAdmin(false); // No user, not admin
        setIsLoading(false);
      }
      console.log("AuthContext useEffect: Setting isLoading to false.");
      setIsLoading(false); // Set loading to false after attempting to fetch or if no token
    };

    verifyTokenAndFetchUser();
  }, [token]); // This effect depends only on the token state

  const login = async (newToken: string): Promise<void> => {
    console.log("AuthContext: login function called.");
    localStorage.setItem("authToken", newToken);
    // Set isLoading to true BEFORE setting the token
    // This ensures ProtectedRoute shows loading while the useEffect processes the new token
    setIsLoading(true);
    setToken(newToken); // This will trigger the useEffect above
    setIsAdmin(false);
  };

  const logout = async (): Promise<void> => {
    console.log("AuthContext: logout function called.");
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
    // Set isLoading to true BEFORE setting the token to null
    setIsLoading(true);
    setToken(null); // This will trigger the useEffect, which then sets user to null and isLoading to false
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
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
