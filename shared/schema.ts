import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// utente
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "docente", "studente"] }).notNull().default("studente"),
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  name: true,
});

// aule
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  capacity: integer("capacity").notNull(),
  building: text("building").notNull(),
  floor: integer("floor").notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  name: true,
  capacity: true,
  building: true,
  floor: true,
});

// Prenotazioni
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD 
  startTime: text("start_time").notNull(), // HH:MM 
  endTime: text("end_time").notNull(), // HH:MM 
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  roomId: true,
  userId: true,
  date: true,
  startTime: true,
  endTime: true,
  reason: true,
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

// tipi di utente
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;

// prenotazioni con le aule e le relative info
export type BookingWithDetails = Booking & {
  room: Room;
  user: User;
};
