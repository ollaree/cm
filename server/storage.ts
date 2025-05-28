import { 
  users, type User, type InsertUser, 
  rooms, type Room, type InsertRoom,
  bookings, type Booking, type InsertBooking, type UpdateBooking, type BookingWithDetails
} from "@shared/schema";

export interface IStorage {
  // metodi per gli utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // metodi per le aule
  getRoom(id: number): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  
  // metodi per le prenotazioni
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingWithDetails(id: number): Promise<BookingWithDetails | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getAllBookingsWithDetails(): Promise<BookingWithDetails[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByUserWithDetails(userId: number): Promise<BookingWithDetails[]>;
  getBookingsByRoom(roomId: number): Promise<Booking[]>;
  getBookingsByRoomWithDetails(roomId: number): Promise<BookingWithDetails[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  getBookingsByDateWithDetails(date: string): Promise<BookingWithDetails[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  getBookingsByStatusWithDetails(status: string): Promise<BookingWithDetails[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private roomsData: Map<number, Room>;
  private bookingsData: Map<number, Booking>;
  private userCurrentId: number;
  private roomCurrentId: number;
  private bookingCurrentId: number;

  constructor() {
    this.usersData = new Map();
    this.roomsData = new Map();
    this.bookingsData = new Map();
    
    this.userCurrentId = 1;
    this.roomCurrentId = 1;
    this.bookingCurrentId = 1;
    
    // inizializza i dati predefiniti
    this.initDefaultData();
  }

  private initDefaultData() {
    // aggiunge utenti di default
    const defaultUsers = [
      { id: this.userCurrentId++, email: "admin@example.com", password: "admin123", role: "admin", name: "Admin User" },
      { id: this.userCurrentId++, email: "docente@example.com", password: "docente123", role: "docente", name: "Docente User" },
      { id: this.userCurrentId++, email: "studente@example.com", password: "studente123", role: "studente", name: "Studente User" }
    ];
    
    defaultUsers.forEach(user => {
      this.usersData.set(user.id, user as User);
    });
    
    // aggiunge di default le stanze
    const defaultRooms = [
      { id: this.roomCurrentId++, name: "A101", capacity: 30, building: "A", floor: 1 },
      { id: this.roomCurrentId++, name: "A102", capacity: 25, building: "A", floor: 1 },
      { id: this.roomCurrentId++, name: "B201", capacity: 40, building: "B", floor: 2 },
      { id: this.roomCurrentId++, name: "C301", capacity: 50, building: "C", floor: 3 }
    ];
    
    defaultRooms.forEach(room => {
      this.roomsData.set(room.id, room as Room);
    });
    
    // aggiunge di default delle prenotazioni
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
        createdAt: new Date()
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
        createdAt: new Date()
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
        createdAt: new Date()
      }
    ];
    
    defaultBookings.forEach(booking => {
      this.bookingsData.set(booking.id, booking as Booking);
    });
  }

  // metodi per user
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.usersData.set(id, user);
    return user;
  }

  // metodi per le stanze
  async getRoom(id: number): Promise<Room | undefined> {
    return this.roomsData.get(id);
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.roomsData.values());
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.roomCurrentId++;
    const room: Room = { ...insertRoom, id };
    this.roomsData.set(id, room);
    return room;
  }

  // metodi per le prenotazioni
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsData.get(id);
  }

  async getBookingWithDetails(id: number): Promise<BookingWithDetails | undefined> {
    const booking = this.bookingsData.get(id);
    if (!booking) return undefined;
    
    const room = this.roomsData.get(booking.roomId);
    const user = this.usersData.get(booking.userId);
    
    if (!room || !user) return undefined;
    
    return {
      ...booking,
      room,
      user
    };
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookingsData.values());
  }

  async getAllBookingsWithDetails(): Promise<BookingWithDetails[]> {
    const bookings = Array.from(this.bookingsData.values());
    return Promise.all(
      bookings.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details as BookingWithDetails;
      })
    );
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getBookingsByUserWithDetails(userId: number): Promise<BookingWithDetails[]> {
    const bookings = await this.getBookingsByUser(userId);
    return Promise.all(
      bookings.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details as BookingWithDetails;
      })
    );
  }

  async getBookingsByRoom(roomId: number): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.roomId === roomId
    );
  }

  async getBookingsByRoomWithDetails(roomId: number): Promise<BookingWithDetails[]> {
    const bookings = await this.getBookingsByRoom(roomId);
    return Promise.all(
      bookings.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details as BookingWithDetails;
      })
    );
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.date === date
    );
  }

  async getBookingsByDateWithDetails(date: string): Promise<BookingWithDetails[]> {
    const bookings = await this.getBookingsByDate(date);
    return Promise.all(
      bookings.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details as BookingWithDetails;
      })
    );
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.status === status
    );
  }

  async getBookingsByStatusWithDetails(status: string): Promise<BookingWithDetails[]> {
    const bookings = await this.getBookingsByStatus(status);
    return Promise.all(
      bookings.map(async (booking) => {
        const details = await this.getBookingWithDetails(booking.id);
        return details as BookingWithDetails;
      })
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.bookingsData.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, status: "pending" | "approved" | "rejected"): Promise<Booking | undefined> {
    const booking = this.bookingsData.get(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = { ...booking, status };
    this.bookingsData.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();
