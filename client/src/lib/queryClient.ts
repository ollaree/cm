import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Ottieni il token di autenticazione e l'email da localStorage
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    // Prepara gli headers
    const headers: HeadersInit = {};
    
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    // Per l'endpoint /api/auth/me usiamo l'email come token
    if (url === "/api/auth/me" && userEmail) {
      headers["Authorization"] = `Bearer ${userEmail}`;
    } else if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Errore API ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Ottieni il token di autenticazione e l'email da localStorage
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      
      // Prepara gli headers
      const headers: HeadersInit = {};
      
      // Per l'endpoint /api/auth/me usiamo l'email come token
      const url = queryKey[0] as string;
      if (url === "/api/auth/me" && userEmail) {
        headers["Authorization"] = `Bearer ${userEmail}`;
      } else if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      console.log(`Esecuzione query ${url} con token:`, token ? 'presente' : 'assente');
      
      const res = await fetch(url, {
        credentials: "include",
        headers
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.warn(`Query ${url} ha restituito 401 Unauthorized`);
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query ${url} completata con successo:`, data);
      return data;
    } catch (error) {
      console.error("Errore nella query:", error, "per la query:", queryKey);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
