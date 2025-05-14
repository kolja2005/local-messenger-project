
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import LoginForm from "@/components/messenger/LoginPage";

const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Если пользователь уже авторизован, перенаправляем его
  if (isAuthenticated) {
    // Админов направляем в админ-панель, обычных пользователей - в мессенджер
    if (user?.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
