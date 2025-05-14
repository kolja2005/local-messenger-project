
import api from './axiosInstance';
import { User } from './authService';
import { USE_MOCK_DATA } from './config';

interface UserUpdateData {
  display_name?: string;
  password?: string;
  avatar_path?: string;
}

interface AdminUserUpdateData extends UserUpdateData {
  is_admin?: boolean;
  is_active?: boolean;
}

// Мок-данные для разработки
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
    isOnline: false
  },
  {
    id: "user2",
    username: "elena",
    display_name: "Елена Смирнова",
    avatar_path: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    is_admin: false,
    is_active: true, 
    last_seen: new Date().toISOString(),
    isOnline: true
  },
  {
    id: "user3",
    username: "alexey", 
    display_name: "Алексей Иванов",
    avatar_path: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    is_admin: false,
    is_active: true,
    last_seen: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
    isOnline: false
  }
];

const userService = {
  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Получение текущего пользователя из localStorage
      const userData = localStorage.getItem('lokalchat_user');
      if (!userData) throw new Error('Пользователь не найден');
      
      return JSON.parse(userData);
    } else {
      const response = await api.get<User>('/users/me');
      return response.data;
    }
  },
  
  // Обновление профиля текущего пользователя
  async updateProfile(data: UserUpdateData): Promise<User> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Получение текущего пользователя из localStorage
      const userData = localStorage.getItem('lokalchat_user');
      if (!userData) throw new Error('Пользователь не найден');
      
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...data };
      
      // Обновление пользователя в localStorage
      localStorage.setItem('lokalchat_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } else {
      const response = await api.put<User>('/users/me', data);
      return response.data;
    }
  },
  
  // Загрузка аватара
  async uploadAvatar(file: File): Promise<string> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Генерация случайного URL аватара
      return URL.createObjectURL(file);
    } else {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{url: string}>('/files/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.url;
    }
  },
  
  // Поиск пользователей (для добавления в чат)
  async searchUsers(query: string): Promise<User[]> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Фильтрация пользователей по запросу
      return MOCK_USERS.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.display_name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      const response = await api.get<User[]>('/users/search', {
        params: { query }
      });
      return response.data;
    }
  },
  
  // Методы для администратора
  admin: {
    // Получение всех пользователей
    async getAllUsers(): Promise<User[]> {
      if (USE_MOCK_DATA) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return MOCK_USERS;
      } else {
        const response = await api.get<User[]>('/admin/users');
        return response.data;
      }
    },
    
    // Создание нового пользователя
    async createUser(userData: {
      username: string;
      password: string;
      display_name: string;
      is_admin?: boolean;
    }): Promise<User> {
      if (USE_MOCK_DATA) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const newUser: User = {
          id: `user${Math.floor(Math.random() * 10000)}`,
          username: userData.username,
          display_name: userData.display_name,
          avatar_path: "",
          is_admin: userData.is_admin || false,
          is_active: true,
          last_seen: new Date().toISOString(),
          isOnline: false
        };
        
        MOCK_USERS.push(newUser);
        
        return newUser;
      } else {
        const response = await api.post<User>('/admin/users', userData);
        return response.data;
      }
    },
    
    // Обновление пользователя
    async updateUser(userId: string, userData: AdminUserUpdateData): Promise<User> {
      if (USE_MOCK_DATA) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userIndex = MOCK_USERS.findIndex(user => user.id === userId);
        if (userIndex === -1) throw new Error('Пользователь не найден');
        
        const updatedUser = { ...MOCK_USERS[userIndex], ...userData };
        MOCK_USERS[userIndex] = updatedUser;
        
        return updatedUser;
      } else {
        const response = await api.put<User>(`/admin/users/${userId}`, userData);
        return response.data;
      }
    },
    
    // Удаление пользователя
    async deleteUser(userId: string): Promise<void> {
      if (USE_MOCK_DATA) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const userIndex = MOCK_USERS.findIndex(user => user.id === userId);
        if (userIndex === -1) throw new Error('Пользователь не найден');
        
        MOCK_USERS.splice(userIndex, 1);
      } else {
        await api.delete(`/admin/users/${userId}`);
      }
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
      if (USE_MOCK_DATA) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 600));
        
        return {
          total_users: MOCK_USERS.length,
          active_users: MOCK_USERS.filter(user => user.is_active).length,
          online_users: MOCK_USERS.filter(user => user.isOnline).length,
          total_chats: 15,
          total_messages: 256,
          timestamp: new Date().toISOString()
        };
      } else {
        const response = await api.get('/admin/stats');
        return response.data;
      }
    }
  }
};

export default userService;
