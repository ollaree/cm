import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Errore nel recupero dell'utente:", error);
    throw error;
  }
}

export function logout(): void {
  // Rimuovi tutti i dati di autenticazione dal localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}
