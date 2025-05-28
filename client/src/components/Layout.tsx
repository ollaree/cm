import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthProvider";
import { LogOut, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo.",
    });
  };

  const getNavItemClasses = (path: string) => {
    const isActive = location === path;
    return `px-3 py-2 rounded transition ${
      isActive
        ? "font-medium text-blue-700 hover:bg-blue-50"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  // Determina il messaggio di benvenuto specifico per il ruolo
  const getRoleMessage = () => {
    if (!user) return "";
    
    switch (user.role) {
      case "admin":
        return "Hai accesso completo alla gestione delle prenotazioni, approvazioni e report del sistema.";
      case "docente":
        return "Puoi gestire le tue prenotazioni e approvare le richieste degli studenti.";
      case "studente":
        return "Puoi richiedere la prenotazione delle aule e visualizzare lo stato delle tue richieste.";
      default:
        return "";
    }
  };

  // Determina se l'utente dovrebbe vedere la scheda Report (solo admin)
  const showReportTab = user && user.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/bookings" className="text-2xl font-bold text-blue-700">
            ClassroomBooker
          </Link>

          <nav>
            <ul className="flex space-x-4 items-center">
              <li>
                <Link href="/bookings" className={getNavItemClasses("/bookings")}>
                  Prenotazioni
                </Link>
              </li>
              <li>
                <Link href="/calendar" className={getNavItemClasses("/calendar")}>
                  Calendario
                </Link>
              </li>
              {showReportTab && (
                <li>
                  <Link href="/report" className={getNavItemClasses("/report")}>
                    Report
                  </Link>
                </li>
              )}
              <li>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {/* Messaggio di benvenuto specifico per il ruolo */}
        {user && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Benvenuto, {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{getRoleMessage()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
