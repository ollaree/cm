import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleDemoLogin = async (role: string) => {
    let demoEmail = "";
    let demoPassword = "";

    switch (role) {
      case "admin":
        demoEmail = "admin@example.com";
        demoPassword = "admin123";
        break;
      case "docente":
        demoEmail = "docente@example.com";
        demoPassword = "docente123";
        break;
      case "studente":
        demoEmail = "studente@example.com";
        demoPassword = "studente123";
        break;
    }

    await login(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">ClassroomBooker</h1>
          <p className="text-gray-600 mt-2">Sistema di Prenotazione Aule</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Accedi</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali per accedere al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuaemail@esempio.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Attendere...
                  </>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Account di test</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("docente")}
                disabled={isLoading}
              >
                Docente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("studente")}
                disabled={isLoading}
              >
                Studente
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
