import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { 
  formatDate, 
  formatDateLong, 
  getDayOfWeek, 
  getBookingStatusClass, 
  getStatusTranslation 
} from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // formatta la data selezionata
  const formattedDate = selectedDate.toISOString().split('T')[0];
  
  // Fetcha le presentazioni alla data selezionata
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings', { date: formattedDate }],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Naviga ad una data precendente
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    
    if (viewType === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    
    setSelectedDate(newDate);
  };
  
  // Naviga alla data successiva
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    
    if (viewType === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setSelectedDate(newDate);
  };
  
  // Fasce orarie per il calendario
  const timeSlots = [
    { id: 1, code: "01", startTime: "08:00", endTime: "08:50" },
    { id: 2, code: "02", startTime: "08:50", endTime: "09:40" },
    { id: 3, code: "03", startTime: "09:50", endTime: "10:50" },
    { id: 4, code: "04", startTime: "10:50", endTime: "11:45" },
    { id: 5, code: "05", startTime: "12:00", endTime: "12:50" },
    { id: 6, code: "06", startTime: "12:50", endTime: "13:40" },
    { id: 7, code: "07", startTime: "13:40", endTime: "14:30" }
  ];
  
  // Ottieni le prenotazioni per una fascia oraria specifica
  const getBookingsForTimeSlot = (timeSlot: { startTime: string, endTime: string }) => {
    return bookings.filter((booking: any) => {
      // Converti i tempi in minuti per un confronto più semplice
      const bookingStartMinutes = convertTimeToMinutes(booking.startTime);
      const bookingEndMinutes = convertTimeToMinutes(booking.endTime);
      const slotStartMinutes = convertTimeToMinutes(timeSlot.startTime);
      const slotEndMinutes = convertTimeToMinutes(timeSlot.endTime);
      
      // Controlla se c'è una sovrapposizione
      return (bookingStartMinutes < slotEndMinutes && bookingEndMinutes > slotStartMinutes);
    });
  };
  
  // Funzione per convertire il tempo in formato HH:MM in minuti dall'inizio della giornata
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Filtra bookings in base a ruolo
  const filterBookingsByRole = (bookingsToFilter: any[]) => {
    if (!user) return [];
    
    if (user.role === "admin") {
      return bookingsToFilter;
    } else if (user.role === "docente") {
      return bookingsToFilter.filter(
        booking => booking.userId === user.id || booking.status === "pending"
      );
    } else {
      return bookingsToFilter.filter(booking => booking.userId === user.id);
    }
  };
  
  // Formatta il range delle date
  const getDateRangeDisplay = () => {
    if (viewType === "day") {
      return formatDateLong(formattedDate);
    } else if (viewType === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); 
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); 
      
      return `${formatDate(startOfWeek.toISOString().split('T')[0])} - ${formatDate(endOfWeek.toISOString().split('T')[0])}`;
    } else {
      return new Date(selectedDate).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calendario Prenotazioni</h1>
        <div className="flex space-x-2">
          <Button
            variant={viewType === "day" ? "default" : "outline"}
            onClick={() => setViewType("day")}
            className="h-9 px-3"
          >
            Giorno
          </Button>
          <Button
            variant={viewType === "week" ? "default" : "outline"}
            onClick={() => setViewType("week")}
            className="h-9 px-3"
          >
            Settimana
          </Button>
          <Button
            variant={viewType === "month" ? "default" : "outline"}
            onClick={() => setViewType("month")}
            className="h-9 px-3"
          >
            Mese
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          className="flex items-center"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Precedente
        </Button>
        <h2 className="text-xl font-medium text-gray-900">{getDateRangeDisplay()}</h2>
        <Button
          variant="outline"
          onClick={goToNext}
          className="flex items-center"
        >
          Successivo
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {viewType === "day" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[100px_1fr] border-b">
            <div className="py-2 px-4 text-xs font-medium text-gray-500 bg-gray-50 border-r">Ora</div>
            <div className="grid grid-cols-1 divide-x">
              <div className="py-2 px-4 text-xs font-medium text-gray-900 text-center">
                {getDayOfWeek(formattedDate)}, {formatDate(formattedDate)}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            timeSlots.map((timeSlot) => {
              const slotBookings = filterBookingsByRole(getBookingsForTimeSlot(timeSlot));
              
              return (
                <div key={timeSlot.id} className="grid grid-cols-[100px_1fr] border-b">
                  <div className="py-4 px-4 text-xs font-medium text-gray-500 bg-gray-50 border-r">
                    {timeSlot.code}: {timeSlot.startTime} - {timeSlot.endTime}
                  </div>
                  <div className="min-h-[60px]">
                    {slotBookings.map((booking: any) => (
                      <div 
                        key={booking.id} 
                        className={`mx-1 my-1 px-2 py-1 rounded ${
                          booking.status === "pending" 
                            ? "bg-yellow-100 border-l-4 border-yellow-500" 
                            : booking.status === "approved" 
                              ? "bg-green-100 border-l-4 border-green-500" 
                              : "bg-red-100 border-l-4 border-red-500"
                        } text-xs`}
                      >
                        <div className="font-medium">
                          {booking.room?.name || `Aula ID: ${booking.roomId}`} - {booking.reason}
                        </div>
                        <div className="text-xs text-gray-600">
                          {booking.startTime} - {booking.endTime}
                        </div>
                        {booking.status === "pending" && (
                          <div className="text-xs text-yellow-700">In attesa di approvazione</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewType === "week" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="text-center p-8">
            <p className="text-gray-500">Implementazione vista settimanale in arrivo...</p>
          </div>
        </div>
      )}

      {viewType === "month" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="text-center p-8">
            <p className="text-gray-500">Implementazione vista mensile in arrivo...</p>
          </div>
        </div>
      )}
    </div>
  );
}
