import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Booking, fetchBookings, updateBooking } from "@/lib/api";
import { 
  formatDate, 
  getBookingStatusClass, 
  getStatusTranslation, 
  canManageBooking, 
  canCreateBooking, 
  canApproveBooking 
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookingForm } from "@/components/BookingForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus } from "lucide-react";

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  
  // Fetcha le prenotazioni
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    staleTime: 1000 * 60, 
  });
  
  // Fetcha le aule in base al filtro
  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
    staleTime: 1000 * 60 * 5, 
  });
  
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "approved" | "rejected" }) => {
      await updateBooking(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Prenotazione aggiornata",
        description: "Lo stato della prenotazione è stato aggiornato con successo.",
      });
    },
    onError: (error) => {
      console.error("Update booking error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della prenotazione.",
        variant: "destructive"
      });
    }
  });
  
  const handleApprove = (id: number) => {
    setSelectedBookingId(id);
    setApproveDialogOpen(true);
  };
  
  const handleReject = (id: number) => {
    setSelectedBookingId(id);
    setRejectDialogOpen(true);
  };
  
  const confirmApprove = () => {
    if (selectedBookingId) {
      updateBookingMutation.mutate({ id: selectedBookingId, status: "approved" });
      setApproveDialogOpen(false);
    }
  };
  
  const confirmReject = () => {
    if (selectedBookingId) {
      updateBookingMutation.mutate({ id: selectedBookingId, status: "rejected" });
      setRejectDialogOpen(false);
    }
  };
  
  const applyFilters = (booking: Booking) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    
    if (dateFilter && booking.date !== dateFilter) {
      return false;
    }
    
    if (roomFilter !== "all" && booking.room?.id.toString() !== roomFilter) {
      return false;
    }
    
    if (user?.role !== "admin") {
      if (user?.role === "docente") {
        return booking.userId === user.id || booking.status === "pending";
      } else {
        return booking.userId === user.id;
      }
    }
    
    return true;
  };
  
  const filteredBookings = bookings.filter(applyFilters);
  
  const handleShowNewBookingForm = () => {
    setShowBookingForm(true);
  };
  
  const canCreate = user && canCreateBooking(user.role);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Prenotazioni</h1>
        {canCreate && (
          <Button 
            className="inline-flex items-center gap-1"
            onClick={handleShowNewBookingForm}
          >
            <Plus className="h-4 w-4" />
            Nuova Prenotazione
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-800">Filtri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Stato
            </label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="pending">In attesa</SelectItem>
                <SelectItem value="approved">Approvato</SelectItem>
                <SelectItem value="rejected">Rifiutato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="room-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Aula
            </label>
            <Select 
              value={roomFilter} 
              onValueChange={(value) => setRoomFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutte le aule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le aule</SelectItem>
                {rooms.map((room: any) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline"
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("");
              setRoomFilter("all");
            }}
          >
            Reimposta Filtri
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Nessuna prenotazione trovata.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data & Ora</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivazione</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.room?.name || `Aula ID: ${booking.roomId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(booking.date)}</div>
                      <div>{`${booking.startTime} - ${booking.endTime}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.user?.email || `Utente ID: ${booking.userId}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {booking.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`status-badge ${getBookingStatusClass(booking.status)}`}>
                        {getStatusTranslation(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user && booking.status === "pending" && canApproveBooking(user.role) && (
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                            onClick={() => handleApprove(booking.id)}
                          >
                            Approva
                          </button>
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                            onClick={() => handleReject(booking.id)}
                          >
                            Rifiuta
                          </button>
                        </div>
                      )}
                      {(user && (booking.status !== "pending" || !canApproveBooking(user.role))) && (
                        <button 
                          className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                          onClick={() => toast({
                            title: "Dettagli prenotazione",
                            description: `Aula: ${booking.room?.name}, Data: ${formatDate(booking.date)}, Orario: ${booking.startTime} - ${booking.endTime}, Stato: ${getStatusTranslation(booking.status)}`
                          })}
                        >
                          Dettagli
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookingForm 
        isOpen={showBookingForm} 
        onClose={() => setShowBookingForm(false)} 
      />

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700">Conferma approvazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler approvare questa prenotazione? L'approvazione renderà l'aula non disponibile per altre prenotazioni in questo orario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateBookingMutation.isPending ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                "Approva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Conferma rifiuto</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler rifiutare questa prenotazione? Questo renderà l'aula disponibile per altre prenotazioni nello stesso orario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              {updateBookingMutation.isPending ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                "Rifiuta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
