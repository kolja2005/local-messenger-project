
import api from './axiosInstance';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, USE_MOCK_DATA } from './config';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_path?: string;
  is_admin: boolean;
  is_active: boolean;
  last_seen?: string;
  isOnline?: boolean;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Мок данные для разработки
const MOCK_USERS = [
  {
    id: "admin1",
    username: "admin",
    display_name: "Администратор",
    avatar_path: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
    is_admin: true,
    is_active: true,
    last_seen: new Date().toISOString(),
    isOnline: true
  },
  {
    id: "user1",
    username: "user",
    display_name: "Пользователь",
    avatar_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    is_admin: false,
    is_active: true,
    last_seen: new Date().toISOString(),
    isOnline: true
  }
];

const authService = {
  // Вход в систему
  async login(username: string, password: string): Promise<User> {
    try {
      if (USE_MOCK_DATA) {
        // Имитация входа с мок-данными
        const user = MOCK_USERS.find(u => u.username === username);
        if (!user || password !== 'password') {
          throw new Error('Неверное имя пользователя или пароль');
        }
        
        const mockResponse = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user
        };
        
        localStorage.setItem(ACCESS_TOKEN_KEY, mockResponse.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, mockResponse.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return mockResponse.user;
      } else {
        // Реальный API запрос
        const response = await api.post<AuthResponse>('/auth/login', {
          username,
          password
        });
        
        const { access_token, refresh_token, user } = response.data;
        
        localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return user;
      }
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      
      // Пользовательское сообщение об ошибке для мок-данных
      if (USE_MOCK_DATA) {
        toast({
          title: "Ошибка входа",
          description: "Неверное имя пользователя или пароль. Попробуйте admin/password или user/password",
          variant: "destructive",
        });
      }
      
      throw error;
    }
  },
  
  // Выход из системы
  async logout(): Promise<void> {
    try {
      if (!USE_MOCK_DATA) {
        // Отправляем запрос на сервер для инвалидации токена
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Удаляем токены и данные пользователя из хранилища
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  
  // Регистрация нового пользователя
  async register(userData: {
    username: string;
    password: string;
    display_name: string;
  }): Promise<User> {
    if (USE_MOCK_DATA) {
      // Имитация регистрации
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: `user${MOCK_USERS.length + 1}`,
        username: userData.username,
        display_name: userData.display_name,
        avatar_path: "",
        is_admin: false,
        is_active: true,
        last_seen: new Date().toISOString(),
        isOnline: true
      };
      
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: newUser
      };
      
      localStorage.setItem(ACCESS_TOKEN_KEY, mockResponse.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, mockResponse.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
      
      return mockResponse.user;
    } else {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    }
  },
  
  // Проверка, авторизован ли пользователь
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },
  
  // Получение информации о текущем пользователе
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Ошибка при разборе данных пользователя:', error);
      return null;
    }
  },
  
  // Обновление данных пользователя в локальном хранилище
  updateUserData(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export default authService;
