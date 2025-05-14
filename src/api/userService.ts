
import api from './axiosInstance';
import { User } from './authService';

interface UserUpdateData {
  display_name?: string;
  password?: string;
  avatar_path?: string;
}

interface AdminUserUpdateData extends UserUpdateData {
  is_admin?: boolean;
  is_active?: boolean;
}

const userService = {
  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  // Обновление профиля текущего пользователя
  async updateProfile(data: UserUpdateData): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },
  
  // Загрузка аватара
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{url: string}>('/files/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.url;
  },
  
  // Поиск пользователей (для добавления в чат)
  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<User[]>('/users/search', {
      params: { query }
    });
    return response.data;
  },
  
  // Методы для администратора
  admin: {
    // Получение всех пользователей
    async getAllUsers(): Promise<User[]> {
      const response = await api.get<User[]>('/admin/users');
      return response.data;
    },
    
    // Создание нового пользователя
    async createUser(userData: {
      username: string;
      password: string;
      display_name: string;
      is_admin?: boolean;
    }): Promise<User> {
      const response = await api.post<User>('/admin/users', userData);
      return response.data;
    },
    
    // Обновление пользователя
    async updateUser(userId: string, userData: AdminUserUpdateData): Promise<User> {
      const response = await api.put<User>(`/admin/users/${userId}`, userData);
      return response.data;
    },
    
    // Удаление пользователя
    async deleteUser(userId: string): Promise<void> {
      await api.delete(`/admin/users/${userId}`);
    },
    
    // Получение статистики (для админ-панели)
    async getStats(): Promise<{
      total_users: number;
      active_users: number;
      online_users: number;
      total_chats: number;
      total_messages: number;
      timestamp: string;
    }> {
      const response = await api.get('/admin/stats');
      return response.data;
    }
  }
};

export default userService;
