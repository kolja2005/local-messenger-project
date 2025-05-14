
import api from './axiosInstance';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './config';

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

const authService = {
  // Вход в систему
  async login(username: string, password: string): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      // Сохраняем токены и информацию о пользователе
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  // Выход из системы
  async logout(): Promise<void> {
    try {
      // Отправляем запрос на сервер для инвалидации токена
      await api.post('/auth/logout');
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
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return user;
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
