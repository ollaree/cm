import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/AuthProvider";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  roomId: z.string().min(1, { message: "Seleziona un'aula" }),
  date: z.string().min(1, { message: "Seleziona una data" }),
  startTime: z.string().min(1, { message: "Seleziona l'ora di inizio" }),
  endTime: z.string().min(1, { message: "Seleziona l'ora di fine" }),
  reason: z.string().min(5, { message: "Inserisci una motivazione (minimo 5 caratteri)" }),
});

type FormValues = z.infer<typeof formSchema>;

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: "",
      date: new Date().toISOString().split('T')[0], 
      startTime: "08:00",
      endTime: "10:00",
      reason: "",
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
    staleTime: 1000 * 60 * 5, 
  });

  const createBooking = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const payload = {
        roomId: parseInt(data.roomId),
        userId: user.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason
      };
      
      const res = await apiRequest("POST", "/api/bookings", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Prenotazione creata",
        description: "La tua richiesta di prenotazione è stata inviata con successo.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error("Booking creation error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della prenotazione. Riprova.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createBooking.mutate(data);
  };

  // Fasce orarie per il calendario
  const timeSlots = [
    { id: 1, code: "01", label: "08:00 - 08:50", value: "08:00" },
    { id: 2, code: "02", label: "08:50 - 09:40", value: "08:50" },
    { id: 3, code: "03", label: "09:50 - 10:50", value: "09:50" },
    { id: 4, code: "04", label: "10:50 - 11:45", value: "10:50" },
    { id: 5, code: "05", label: "12:00 - 12:50", value: "12:00" },
    { id: 6, code: "06", label: "12:50 - 13:40", value: "12:50" },
    { id: 7, code: "07", label: "13:40 - 14:30", value: "13:40" }
  ];
  
  const endTimeSlots = [
    { id: 2, code: "02", label: "08:50 - 09:40", value: "08:50" },
    { id: 3, code: "03", label: "09:50 - 10:50", value: "09:50" },
    { id: 4, code: "04", label: "10:50 - 11:45", value: "10:50" },
    { id: 5, code: "05", label: "12:00 - 12:50", value: "12:00" },
    { id: 6, code: "06", label: "12:50 - 13:40", value: "12:50" },
    { id: 7, code: "07", label: "13:40 - 14:30", value: "13:40" },
    { id: 8, code: "08", label: "14:30 - 15:20", value: "14:30" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Nuova Prenotazione</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un'aula" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room: any) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora Inizio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona ora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time.id} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora Fine</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona ora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {endTimeSlots.map((time) => (
                          <SelectItem key={time.id} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivazione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci il motivo della prenotazione"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Invio in corso..." : "Prenota"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
