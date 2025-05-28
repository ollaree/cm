import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Loader2, Minus, Download } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { canViewReports, getRoleTranslation } from "@/lib/utils";

export default function ReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Check if user has permission to view reports
  if (user && !canViewReports(user.role)) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Accesso negato</h2>
        <p className="text-gray-600">
          Non hai i permessi necessari per visualizzare i report. Contatta un amministratore.
        </p>
      </div>
    );
  }
  
  // Fetch stats data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Handle export
  const handleExport = (type: string) => {
    toast({
      title: "Esportazione iniziata",
      description: `Il file ${type.toUpperCase()} verrà scaricato a breve.`
    });
  };
  
  // Get trend icon based on value
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="h-4 w-4 mr-1 text-green-600" />;
    } else if (value < 0) {
      return <ArrowDown className="h-4 w-4 mr-1 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 mr-1 text-yellow-600" />;
    }
  };
  
  // Get trend text based on value
  const getTrendText = (value: number) => {
    if (value === 0) return "Stabile rispetto al mese scorso";
    return `${value > 0 ? "+" : ""}${value}% rispetto al mese scorso`;
  };
  
  // Prepare pie chart data
  const getPieChartData = () => {
    if (!data) return [];
    
    return [
      { name: "In attesa", value: data.pending, color: "#eab308" },
      { name: "Approvate", value: data.approved, color: "#22c55e" },
      { name: "Rifiutate", value: data.rejected, color: "#ef4444" }
    ];
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Report e Statistiche</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => handleExport("pdf")}
          >
            <Download className="h-5 w-5" />
            Esporta PDF
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => handleExport("csv")}
          >
            <Download className="h-5 w-5" />
            Esporta CSV
          </Button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-800">Periodo di Analisi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">Da</label>
            <Input 
              type="date" 
              id="date-from" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">A</label>
            <Input 
              type="date" 
              id="date-to" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => refetch()}>
            Aggiorna Report
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Totale Prenotazioni</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.total}</p>
              <div className={`text-sm mt-1 flex items-center ${
                data.trends.total > 0 ? "text-green-600" : 
                data.trends.total < 0 ? "text-red-600" : "text-yellow-600"
              }`}>
                {getTrendIcon(data.trends.total)}
                {getTrendText(data.trends.total)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Prenotazioni Approvate</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.approved}</p>
              <div className={`text-sm mt-1 flex items-center ${
                data.trends.approved > 0 ? "text-green-600" : 
                data.trends.approved < 0 ? "text-red-600" : "text-yellow-600"
              }`}>
                {getTrendIcon(data.trends.approved)}
                {getTrendText(data.trends.approved)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Prenotazioni In Attesa</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.pending}</p>
              <div className="text-sm text-yellow-600 mt-1 flex items-center">
                <Minus className="h-4 w-4 mr-1" />
                Stabile rispetto al mese scorso
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Prenotazioni Rifiutate</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.rejected}</p>
              <div className={`text-sm mt-1 flex items-center ${
                data.trends.rejected > 0 ? "text-green-600" : 
                data.trends.rejected < 0 ? "text-red-600" : "text-yellow-600"
              }`}>
                {getTrendIcon(data.trends.rejected)}
                {getTrendText(data.trends.rejected)}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Prenotazioni per Stato</h3>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPieChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Prenotazioni per Aula</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.bookingsByRoom}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <XAxis dataKey="roomName" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Prenotazioni" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="text-lg font-medium text-gray-800 p-4 border-b">Utenti Più Attivi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prenotazioni</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approvate</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rifiutate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRoleTranslation(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.totalBookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.approved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.rejected}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-500">Nessun dato disponibile. Prova ad aggiornare il report.</p>
        </div>
      )}
    </div>
  );
}
