
import api from './axiosInstance';
import { User } from './authService';

export interface Chat {
  id: string;
  name: string;
  is_group: boolean;
  created_at: string;
  created_by_id: string;
  members: User[];
  last_message?: Message;
  unread_count: number;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  chat_id: string;
  user_id: string;
  author?: User;
}

export interface MessagePage {
  messages: Message[];
  total: number;
  pages: number;
  page: number;
}

const chatService = {
  // Получение списка чатов
  async getChats(): Promise<Chat[]> {
    const response = await api.get<Chat[]>('/chats');
    return response.data;
  },
  
  // Создание нового чата (личного или группового)
  async createChat(data: {
    member_ids: string[];
    name?: string;
  }): Promise<Chat> {
    const response = await api.post<Chat>('/chats', data);
    return response.data;
  },
  
  // Получение информации о конкретном чате
  async getChat(chatId: string): Promise<Chat> {
    const response = await api.get<Chat>(`/chats/${chatId}`);
    return response.data;
  },
  
  // Обновление информации о чате (например, название группового чата)
  async updateChat(chatId: string, data: {
    name?: string;
  }): Promise<Chat> {
    const response = await api.put<Chat>(`/chats/${chatId}`, data);
    return response.data;
  },
  
  // Добавление пользователей в чат
  async addMembers(chatId: string, memberIds: string[]): Promise<Chat> {
    const response = await api.post<Chat>(`/chats/${chatId}/members`, {
      member_ids: memberIds
    });
    return response.data;
  },
  
  // Удаление пользователя из чата
  async removeMember(chatId: string, memberId: string): Promise<Chat> {
    const response = await api.delete<Chat>(`/chats/${chatId}/members/${memberId}`);
    return response.data;
  },
  
  // Получение сообщений чата с пагинацией
  async getMessages(chatId: string, page: number = 1, perPage: number = 50): Promise<MessagePage> {
    const response = await api.get<MessagePage>(`/chats/${chatId}/messages`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },
  
  // Отправка сообщения
  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await api.post<Message>(`/chats/${chatId}/messages`, {
      content
    });
    return response.data;
  },
  
  // Отправка файла
  async sendFile(chatId: string, file: File): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<Message>(`/chats/${chatId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Отметка сообщения как прочитанного
  async markAsRead(messageId: string): Promise<void> {
    await api.put(`/messages/${messageId}/read`);
  },
  
  // Удаление сообщения
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  }
};

export default chatService;
