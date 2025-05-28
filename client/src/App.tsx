import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import BookingsPage from "@/pages/BookingsPage";
import CalendarPage from "@/pages/CalendarPage";
import ReportPage from "@/pages/ReportPage";
import { AuthProvider } from "@/components/AuthProvider";
import Layout from "@/components/Layout";

function ProtectedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={BookingsPage} />
        <Route path="/bookings" component={BookingsPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/report" component={ReportPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/*">
        <ProtectedRoutes />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
