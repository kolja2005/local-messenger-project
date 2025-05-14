
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService, { User } from '../api/authService';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке приложения
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        if (authService.isAuthenticated()) {
          // Получаем данные текущего пользователя из локального хранилища
          const userData = authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Если данные некорректны, очищаем токены
            await authService.logout();
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        // В случае ошибки сбрасываем состояние аутентификации
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при входе';
      toast({
        title: "Ошибка авторизации",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    authService.updateUserData(updatedUser as User);
  };

  const isAdmin = user?.is_admin || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
