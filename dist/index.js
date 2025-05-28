// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  usersData;
  roomsData;
  bookingsData;
  userCurrentId;
  roomCurrentId;
  bookingCurrentId;
  constructor() {
    this.usersData = /* @__PURE__ */ new Map();
    this.roomsData = /* @__PURE__ */ new Map();
    this.bookingsData = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.roomCurrentId = 1;
    this.bookingCurrentId = 1;
    this.initDefaultData();
  }
  initDefaultData() {
    const defaultUsers = [
      { id: this.userCurrentId++, email: "admin@example.com", password: "admin123", role: "admin", name: "Admin User" },
      { id: this.userCurrentId++, email: "docente@example.com", password: "docente123", role: "docente", name: "Docente User" },
      { id: this.userCurrentId++, email: "studente@example.com", password: "studente123", role: "studente", name: "Studente User" }
    ];
    defaultUsers.forEach((user) => {
      this.usersData.set(user.id, user);
    });
    const defaultRooms = [
      { id: this.roomCurrentId++, name: "A101", capacity: 30, building: "A", floor: 1 },
      { id: this.roomCurrentId++, name: "A102", capacity: 25, building: "A", floor: 1 },
      { id: this.roomCurrentId++, name: "B201", capacity: 40, building: "B", floor: 2 },
      { id: this.roomCurrentId++, name: "C301", capacity: 50, building: "C", floor: 3 }
    ];
    defaultRooms.forEach((room) => {
      this.roomsData.set(room.id, room);
    });
    const today = /* @__PURE__ */ new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const defaultBookings = [
      {
        id: this.bookingCurrentId++,
        roomId: 1,
        userId: 3,
        date: formatDate(today),
        startTime: "14:00",
        endTime: "16:00",
        reason: "Lezione di Informatica",
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: this.bookingCurrentId++,
        roomId: 3,
        userId: 2,
        date: formatDate(tomorrow),
        startTime: "10:00",
        endTime: "12:00",
        reason: "Riunione docenti",
        status: "approved",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: this.bookingCurrentId++,
        roomId: 4,
        userId: 3,
        date: formatDate(dayAfterTomorrow),
        startTime: "09:00",
        endTime: "11:00",
        reason: "Studio di gruppo",
        status: "rejected",
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    defaultBookings.forEach((booking) => {
      this.bookingsData.set(booking.id, booking);
    });
  }
  // metodi per user
  async getUser(id) {
    return this.usersData.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.usersData.set(id, user);
    return user;
  }
  // metodi per le stanze
  async getRoom(id) {
    return this.roomsData.get(id);
  }
  async getAllRooms() {
    return Array.from(this.roomsData.values());
  }
  async createRoom(insertRoom) {
    const id = this.roomCurrentId++;
    const room = { ...insertRoom, id };
    this.roomsData.set(id, room);
    return room;
  }
  // metodi per le prenotazioni
  async getBooking(id) {
    return this.bookingsData.get(id);
  }
  async getBookingWithDetails(id) {
    const booking = this.bookingsData.get(id);
    if (!booking) return void 0;
    const room = this.roomsData.get(booking.roomId);
    const user = this.usersData.get(booking.userId);
    if (!room || !user) return void 0;
    return {
      ...booking,
      room,
      user
    };
  }
  async getAllBookings() {
    return Array.from(this.bookingsData.values());
  }
  async getAllBookingsWithDetails() {
    const bookings2 = Array.from(this.bookingsData.values());
    return Promise.all(
      bookings2.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details;
      })
    );
  }
  async getBookingsByUser(userId) {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  async getBookingsByUserWithDetails(userId) {
    const bookings2 = await this.getBookingsByUser(userId);
    return Promise.all(
      bookings2.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details;
      })
    );
  }
  async getBookingsByRoom(roomId) {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.roomId === roomId
    );
  }
  async getBookingsByRoomWithDetails(roomId) {
    const bookings2 = await this.getBookingsByRoom(roomId);
    return Promise.all(
      bookings2.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details;
      })
    );
  }
  async getBookingsByDate(date) {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.date === date
    );
  }
  async getBookingsByDateWithDetails(date) {
    const bookings2 = await this.getBookingsByDate(date);
    return Promise.all(
      bookings2.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details;
      })
    );
  }
  async getBookingsByStatus(status) {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.status === status
    );
  }
  async getBookingsByStatusWithDetails(status) {
    const bookings2 = await this.getBookingsByStatus(status);
    return Promise.all(
      bookings2.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details;
      })
    );
  }
  async createBooking(insertBooking) {
    const id = this.bookingCurrentId++;
    const booking = {
      ...insertBooking,
      id,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.bookingsData.set(id, booking);
    return booking;
  }
  async updateBooking(id, status) {
    const booking = this.bookingsData.get(id);
    if (!booking) return void 0;
    const updatedBooking = { ...booking, status };
    this.bookingsData.set(id, updatedBooking);
    return updatedBooking;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "docente", "studente"] }).notNull().default("studente"),
  name: text("name").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  name: true
});
var rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  capacity: integer("capacity").notNull(),
  building: text("building").notNull(),
  floor: integer("floor").notNull()
});
var insertRoomSchema = createInsertSchema(rooms).pick({
  name: true,
  capacity: true,
  building: true,
  floor: true
});
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD 
  startTime: text("start_time").notNull(),
  // HH:MM 
  endTime: text("end_time").notNull(),
  // HH:MM 
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertBookingSchema = createInsertSchema(bookings).pick({
  roomId: true,
  userId: true,
  date: true,
  startTime: true,
  endTime: true,
  reason: true
});
var updateBookingSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"])
});

// server/routes.ts
import { createProxyMiddleware } from "http-proxy-middleware";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const flaskProxy = createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/flask": ""
    },
    logLevel: "error"
  });
  app2.use("/api/flask", flaskProxy);
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...userData } = user;
      return res.status(200).json({
        user: userData,
        token: "mock-jwt-token"
        // In una app reale, genera un JWT token
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const emailFromToken = token;
      if (!emailFromToken) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const user = await storage.getUserByEmail(emailFromToken);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const { password: _, ...userData } = user;
      return res.status(200).json({ user: userData });
    } catch (error) {
      console.error("Errore autenticazione:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/users", async (req, res) => {
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
      const { password: _, ...userData } = user;
      return res.status(201).json(userData);
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/rooms", async (_req, res) => {
    try {
      const rooms2 = await storage.getAllRooms();
      return res.status(200).json(rooms2);
    } catch (error) {
      console.error("Get rooms error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/bookings", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const roomId = req.query.roomId ? parseInt(req.query.roomId) : void 0;
      const date = req.query.date;
      const status = req.query.status;
      let bookings2;
      if (userId) {
        bookings2 = await storage.getBookingsByUserWithDetails(userId);
      } else if (roomId) {
        bookings2 = await storage.getBookingsByRoomWithDetails(roomId);
      } else if (date) {
        bookings2 = await storage.getBookingsByDateWithDetails(date);
      } else if (status) {
        bookings2 = await storage.getBookingsByStatusWithDetails(status);
      } else {
        bookings2 = await storage.getAllBookingsWithDetails();
      }
      return res.status(200).json(bookings2);
    } catch (error) {
      console.error("Get bookings error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/bookings/:id", async (req, res) => {
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
  app2.post("/api/bookings", async (req, res) => {
    try {
      const result = insertBookingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid booking data",
          errors: result.error.errors
        });
      }
      const user = await storage.getUser(result.data.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const room = await storage.getRoom(result.data.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const booking = await storage.createBooking(result.data);
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = updateBookingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid booking data",
          errors: result.error.errors
        });
      }
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const updatedBooking = await storage.updateBooking(id, result.data.status);
      return res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Update booking error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/stats", async (_req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const pendingBookings = await storage.getBookingsByStatus("pending");
      const approvedBookings = await storage.getBookingsByStatus("approved");
      const rejectedBookings = await storage.getBookingsByStatus("rejected");
      const rooms2 = await storage.getAllRooms();
      const bookingsByRoom = await Promise.all(
        rooms2.map(async (room) => {
          const bookings2 = await storage.getBookingsByRoom(room.id);
          return {
            roomName: room.name,
            count: bookings2.length
          };
        })
      );
      const users2 = [];
      for (const user of Array.from((await storage.getAllBookingsWithDetails()).map((b) => b.user).reduce((map, user2) => {
        if (!map.has(user2.id)) {
          map.set(user2.id, user2);
        }
        return map;
      }, /* @__PURE__ */ new Map()).values())) {
        const userBookings = await storage.getBookingsByUser(user.id);
        const approved = userBookings.filter((b) => b.status === "approved").length;
        const rejected = userBookings.filter((b) => b.status === "rejected").length;
        users2.push({
          id: user.id,
          email: user.email,
          role: user.role,
          totalBookings: userBookings.length,
          approved,
          rejected
        });
      }
      const trendTotal = 12;
      const trendApproved = 8;
      const trendRejected = -5;
      return res.status(200).json({
        total: allBookings.length,
        pending: pendingBookings.length,
        approved: approvedBookings.length,
        rejected: rejectedBookings.length,
        bookingsByRoom,
        topUsers: users2.sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 5),
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
async function vite_config_default() {
  const plugins = [
    react(),
    runtimeErrorOverlay()
  ];
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }
  return defineConfig({
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets")
      }
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true
    }
  });
}

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
