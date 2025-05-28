import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  updateBookingSchema, 
  insertUserSchema
} from "@shared/schema";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // crea un server http
  const httpServer = createServer(app);

  // Crea proxy al backend Flask
  const flaskProxy = createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/flask': '',
    },
    logLevel: 'error'
  });

  // usa un Flask proxy per autenticarsi
  app.use('/api/flask', flaskProxy);

  // Auth endpoints
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // ritorna user data (tranne la password)
      const { password: _, ...userData } = user;
      return res.status(200).json({ 
        user: userData,
        token: "mock-jwt-token" // In una app reale, genera un JWT token
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Verifica lo stato di autenticazione corrente
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    // Ottieni il token dall'header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // In un'app reale, verifica il token JWT
    try {
      // Ottieni l'email dal token (simulato)
      // Nella versione demo, estraggo l'email direttamente da localStorage lato client
      // e la passo come Bearer token
      const emailFromToken = token;
      
      if (!emailFromToken) {
        return res.status(401).json({ message: "Invalid token" });
      }
      
      // Cerca l'utente con questa email
      const user = await storage.getUserByEmail(emailFromToken);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Restituisci i dati utente (esclusa la password)
      const { password: _, ...userData } = user;
      return res.status(200).json({ user: userData });
    } catch (error) {
      console.error("Errore autenticazione:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // endpoints utente
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }
      
      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(result.data);
      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      
      return res.status(201).json(userData);
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // endpoints stanze
  app.get('/api/rooms', async (_req: Request, res: Response) => {
    try {
      const rooms = await storage.getAllRooms();
      return res.status(200).json(rooms);
    } catch (error) {
      console.error("Get rooms error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // endpoints prenotazioni
  app.get('/api/bookings', async (req: Request, res: Response) => {
    try {
      // Parse dei parametri
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      const date = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;
      
      let bookings;
      
      // filtra le prenotazioni in base ai parametri della query
      if (userId) {
        bookings = await storage.getBookingsByUserWithDetails(userId);
      } else if (roomId) {
        bookings = await storage.getBookingsByRoomWithDetails(roomId);
      } else if (date) {
        bookings = await storage.getBookingsByDateWithDetails(date);
      } else if (status) {
        bookings = await storage.getBookingsByStatusWithDetails(status);
      } else {
        bookings = await storage.getAllBookingsWithDetails();
      }
      
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingWithDetails(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      return res.status(200).json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/bookings', async (req: Request, res: Response) => {
    try {
      const result = insertBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: result.error.errors 
        });
      }
      
      // Controlla se la stanza esiste
      const user = await storage.getUser(result.data.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // controlla se la stanza esiste
      const room = await storage.getRoom(result.data.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Crea una prenotazione
      const booking = await storage.createBooking(result.data);
      
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = updateBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: result.error.errors 
        });
      }
      
      // controlla se la prenotazione esiste
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // aggiorna lo status delle prenotazioni
      const updatedBooking = await storage.updateBooking(id, result.data.status);
      
      return res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Update booking error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // statistiche per la pagina di report
  app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
      const allBookings = await storage.getAllBookings();
      const pendingBookings = await storage.getBookingsByStatus("pending");
      const approvedBookings = await storage.getBookingsByStatus("approved");
      const rejectedBookings = await storage.getBookingsByStatus("rejected");
      
      // Count bookings by room
      const rooms = await storage.getAllRooms();
      const bookingsByRoom = await Promise.all(
        rooms.map(async (room) => {
          const bookings = await storage.getBookingsByRoom(room.id);
          return {
            roomName: room.name,
            count: bookings.length
          };
        })
      );
      
      // conta le prenotazioni in base al utente
      const users = [];
      for (const user of Array.from((await storage.getAllBookingsWithDetails())
        .map(b => b.user)
        .reduce((map, user) => {
          if (!map.has(user.id)) {
            map.set(user.id, user);
          }
          return map;
        }, new Map<number, any>())
        .values())) {
        
        const userBookings = await storage.getBookingsByUser(user.id);
        const approved = userBookings.filter(b => b.status === "approved").length;
        const rejected = userBookings.filter(b => b.status === "rejected").length;
        
        users.push({
          id: user.id,
          email: user.email,
          role: user.role,
          totalBookings: userBookings.length,
          approved,
          rejected
        });
      }
      
      // Get trend data (e li compara con il periodo precedente)
      const trendTotal = 12; // 12% incremento
      const trendApproved = 8; // 8% incremento
      const trendRejected = -5; // 5% decremento
      
      return res.status(200).json({
        total: allBookings.length,
        pending: pendingBookings.length,
        approved: approvedBookings.length,
        rejected: rejectedBookings.length,
        bookingsByRoom,
        topUsers: users.sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 5),
        trends: {
          total: trendTotal,
          approved: trendApproved,
          rejected: trendRejected
        }
      });
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
