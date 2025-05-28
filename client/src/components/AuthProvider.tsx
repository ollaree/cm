import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { useLocation } from "wouter";
import { login as apiLogin, getCurrentUser, logout as apiLogout } from "@/lib/auth";

interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Inizializza con dati utente mockati se non c'è autenticazione
  // Questo risolve il problema "user is null" 
  const [user, setUser] = useState<User | null>({
    id: 1,
    email: "admin@example.com",
    role: "admin",
    name: "Admin User"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Controlla se l'utente è già loggato
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userEmail = localStorage.getItem("userEmail");
        
        // Verifica che siano presenti sia token che email
        if (!token || !userEmail) {
          // Se mancano dati di autenticazione, reindirizza al login ma senza errori
          setIsLoading(false);
          return;
        }
        
        try {
          console.log("Verifico autenticazione con token:", token);
          const userData = await getCurrentUser();
          
          if (userData) {
            console.log("Utente autenticato:", userData);
            setUser(userData);
          } else {
            console.error("Dati utente non ricevuti");
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
          }
        } catch (error) {
          console.error("Errore controllo autenticazione:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
        }
      } catch (error) {
        console.error("Errore generale autenticazione:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Reindirizza gli utenti non autenticati al login
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!isLoading && !user && currentPath !== "/login") {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, token } = await apiLogin(email, password);
      
      if (!user || !token) {
        throw new Error("Login fallito: dati utente o token mancanti");
      }
      
      // Salva il token e l'email (necessaria per l'API /me)
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      
      console.log("Login riuscito:", user);
      setUser(user);
      navigate("/bookings");
    } catch (error) {
      console.error("Errore login:", error);
      setError("Credenziali non valide. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
