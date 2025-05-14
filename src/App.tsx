
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MessengerLayout from "./components/messenger/MessengerLayout";
import LoginPage from "./components/messenger/LoginPage";
import AdminPanel from "./components/messenger/AdminPanel";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoadingScreen from "./components/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Защищенные маршруты */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<MessengerLayout />} />
            </Route>
            
            {/* Маршруты только для админа */}
            <Route element={<PrivateRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            
            {/* Редирект на главную */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* Страница 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
