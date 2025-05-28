import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formato le date in base al tipo richiesto
 * @param dateStr - Stringa data da formattare 
 * @param type - Tipo di formato (default: 'short')
 */
export function formatDate(dateStr: string, type: 'short' | 'long' | 'day' = 'short'): string {
  const date = parseISO(dateStr);
  const options = { locale: it };
  
  switch (type) {
    case 'long':
      return format(date, "EEEE, d MMMM yyyy", options);
    case 'day':
      return format(date, "EEEE", options);
    default:
      return format(date, "dd/MM/yyyy", options);
  }
}

// Funzioni di alias per compatibilità
export const formatDateLong = (dateStr: string) => formatDate(dateStr, 'long');
export const formatDay = (dateStr: string) => formatDate(dateStr, 'day');
export const getDayOfWeek = formatDay;

// Mapping di stato per classi CSS e traduzioni
const STATUS_MAP = {
  pending: { class: "bg-status-pending", label: "In attesa" },
  approved: { class: "bg-status-approved", label: "Approvato" },
  rejected: { class: "bg-status-rejected", label: "Rifiutato" }
};

// Mapping dei ruoli
const ROLE_MAP = {
  admin: { label: "Amministratore", permissions: ["manage", "create", "approve", "reports"] },
  docente: { label: "Docente", permissions: ["manage", "create", "approve"] },
  studente: { label: "Studente", permissions: ["create"] }
};

export function getBookingStatusClass(status: string): string {
  return STATUS_MAP[status as keyof typeof STATUS_MAP]?.class || "";
}

export function getStatusTranslation(status: string): string {
  return STATUS_MAP[status as keyof typeof STATUS_MAP]?.label || status;
}

export function getRoleTranslation(role: string): string {
  return ROLE_MAP[role as keyof typeof ROLE_MAP]?.label || role;
}

/**
 * Controlla i permessi dell'utente in base al ruolo
 * @param userRole - Ruolo dell'utente 
 * @param permission - Permesso da verificare
 */
export function hasPermission(userRole: string, permission: string): boolean {
  const roleInfo = ROLE_MAP[userRole as keyof typeof ROLE_MAP];
  return roleInfo?.permissions.includes(permission) || false;
}

// Funzioni di autorizzazione
export function canManageBooking(userRole: string, bookingUserId?: number, currentUserId?: number): boolean {
  if (hasPermission(userRole, "manage")) return true;
  
  // Gli utenti possono gestire solo le proprie prenotazioni
  return !!bookingUserId && !!currentUserId && bookingUserId === currentUserId;
}

export function canCreateBooking(userRole: string): boolean {
  return hasPermission(userRole, "create");
}

export function canApproveBooking(userRole: string): boolean {
  return hasPermission(userRole, "approve");
}

export function canViewReports(userRole: string): boolean {
  return hasPermission(userRole, "reports");
}
