import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat";
import DigitalTwin from "./pages/DigitalTwin";
import CrisisPage from "./pages/CrisisPage";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  if (!state.onboarded) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { state } = useApp();
  return (
    <Routes>
      <Route path="/" element={state.onboarded ? <Navigate to="/chat" replace /> : <Onboarding />} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/twin" element={<ProtectedRoute><DigitalTwin /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/crisis" element={<ProtectedRoute><CrisisPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
