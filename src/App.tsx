
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import LoginPage from './pages/LoginPage';
import MessengerPage from './pages/MessengerPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TooltipProvider>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Защищенные маршруты */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MessengerPage />} />
        </Route>
        
        {/* Маршруты только для админа */}
        <Route element={<PrivateRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        
        {/* Редиректы */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        {/* Страница 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
