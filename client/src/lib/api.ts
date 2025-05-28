import { apiRequest } from "./queryClient";

export interface Room {
  id: number;
  name: string;
  capacity: number;
  building: string;
  floor: number;
}

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  room?: Room;
  user?: User;
}

export interface CreateBookingData {
  roomId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface UpdateBookingData {
  status: "pending" | "approved" | "rejected";
}

export interface RoomStats {
  roomName: string;
  count: number;
}

export interface UserStats {
  id: number;
  email: string;
  role: string;
  totalBookings: number;
  approved: number;
  rejected: number;
}

export interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  bookingsByRoom: RoomStats[];
  topUsers: UserStats[];
  trends: {
    total: number;
    approved: number;
    rejected: number;
  };
}

// Metodi API
export const fetchRooms = async (): Promise<Room[]> => {
  const response = await apiRequest("GET", "/api/rooms");
  return response.json();
};

export const fetchBookings = async (filters?: {
  userId?: number;
  roomId?: number;
  date?: string;
  status?: string;
}): Promise<Booking[]> => {
  let url = "/api/bookings";
  
  if (filters) {
    const queryParams = [];
    if (filters.userId) queryParams.push(`userId=${filters.userId}`);
    if (filters.roomId) queryParams.push(`roomId=${filters.roomId}`);
    if (filters.date) queryParams.push(`date=${filters.date}`);
    if (filters.status) queryParams.push(`status=${filters.status}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
  }
  
  const response = await apiRequest("GET", url);
  return response.json();
};

export const fetchBooking = async (id: number): Promise<Booking> => {
  const response = await apiRequest("GET", `/api/bookings/${id}`);
  return response.json();
};

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  const response = await apiRequest("POST", "/api/bookings", data);
  return response.json();
};

export const updateBooking = async (id: number, data: UpdateBookingData): Promise<Booking> => {
  const response = await apiRequest("PATCH", `/api/bookings/${id}`, data);
  return response.json();
};

export const fetchStats = async (): Promise<StatsData> => {
  const response = await apiRequest("GET", "/api/stats");
  return response.json();
};
