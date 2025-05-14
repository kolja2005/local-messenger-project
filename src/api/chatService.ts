
import api from './axiosInstance';
import { User } from './authService';
import { USE_MOCK_DATA } from './config';

export interface Chat {
  id: string;
  name: string;
  is_group: boolean;
  created_at: string;
  created_by_id: string;
  members: User[];
  last_message?: Message;
  unread_count: number;
  avatar_path?: string;
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

// Мок-данные для разработки
const getCurrentUser = () => {
  const userData = localStorage.getItem('lokalchat_user');
  if (!userData) return null;
  return JSON.parse(userData);
};

const currentUser = getCurrentUser();

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
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    isOnline: false
  }
];

let MOCK_CHATS: Chat[] = [
  {
    id: "chat1",
    name: "Елена Смирнова",
    is_group: false,
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    created_by_id: currentUser?.id || "admin1",
    members: [currentUser || MOCK_USERS[0], MOCK_USERS[2]],
    last_message: {
      id: "msg1",
      content: "Привет! Как дела с проектом?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      is_read: true,
      chat_id: "chat1",
      user_id: "user2",
    },
    unread_count: 0,
    avatar_path: MOCK_USERS[2].avatar_path
  },
  {
    id: "chat2",
    name: "Алексей Иванов",
    is_group: false,
    created_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    created_by_id: "user3",
    members: [currentUser || MOCK_USERS[0], MOCK_USERS[3]],
    last_message: {
      id: "msg2",
      content: "Спасибо за информацию!",
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      is_read: true,
      chat_id: "chat2",
      user_id: "user3",
    },
    unread_count: 0,
    avatar_path: MOCK_USERS[3].avatar_path
  },
  {
    id: "chat3",
    name: "Рабочая группа",
    is_group: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    created_by_id: currentUser?.id || "admin1",
    members: [currentUser || MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[3]],
    last_message: {
      id: "msg3",
      content: "Встреча в 15:00 в конференц-зале",
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      is_read: false,
      chat_id: "chat3",
      user_id: currentUser?.id || "admin1",
    },
    unread_count: 2,
    avatar_path: undefined
  }
];

// Генерация истории сообщений для чата
let MOCK_MESSAGES: Record<string, Message[]> = {
  "chat1": Array.from({ length: 15 }, (_, i) => ({
    id: `chat1-msg${i}`,
    content: i % 3 === 0 ? "Привет! Как дела с проектом?" : 
            i % 3 === 1 ? "Всё идёт по плану, завтра закончим первую версию." : 
            "Отлично, жду результатов!",
    timestamp: new Date(Date.now() - (15 - i) * 3600000).toISOString(),
    is_read: true,
    chat_id: "chat1",
    user_id: i % 2 === 0 ? "user2" : (currentUser?.id || "admin1"),
  })),
  "chat2": Array.from({ length: 10 }, (_, i) => ({
    id: `chat2-msg${i}`,
    content: i % 3 === 0 ? "Добрый день! Вы получили мои документы?" : 
            i % 3 === 1 ? "Да, всё получил. Проверю и свяжусь с вами." : 
            "Спасибо за информацию!",
    timestamp: new Date(Date.now() - (10 - i) * 7200000).toISOString(),
    is_read: true,
    chat_id: "chat2",
    user_id: i % 2 === 0 ? "user3" : (currentUser?.id || "admin1"),
  })),
  "chat3": Array.from({ length: 20 }, (_, i) => {
    const randomUserId = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].id;
    return {
      id: `chat3-msg${i}`,
      content: i % 5 === 0 ? "Всем привет! Есть обновления по проекту." : 
              i % 5 === 1 ? "Когда планируется следующая встреча?" : 
              i % 5 === 2 ? "Встреча в 15:00 в конференц-зале" :
              i % 5 === 3 ? "Я подготовил отчет, отправлю сегодня вечером." :
              "Спасибо за информацию!",
      timestamp: new Date(Date.now() - (20 - i) * 5400000).toISOString(),
      is_read: i < 18,
      chat_id: "chat3",
      user_id: randomUserId,
    };
  })
};

const chatService = {
  // Получение списка чатов
  async getChats(): Promise<Chat[]> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Добавление информации об авторе сообщений
      return MOCK_CHATS.map(chat => {
        if (chat.last_message) {
          const author = MOCK_USERS.find(user => user.id === chat.last_message?.user_id);
          return {
            ...chat,
            last_message: {
              ...chat.last_message,
              author
            }
          };
        }
        return chat;
      });
    } else {
      const response = await api.get<Chat[]>('/chats');
      return response.data;
    }
  },
  
  // Создание нового чата (личного или группового)
  async createChat(data: {
    member_ids: string[];
    name?: string;
  }): Promise<Chat> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const members = data.member_ids.map(id => 
        MOCK_USERS.find(user => user.id === id)
      ).filter(Boolean) as User[];
      
      // Добавляем текущего пользователя, если его нет в списке
      if (currentUser && !members.some(member => member.id === currentUser.id)) {
        members.unshift(currentUser);
      }
      
      const isGroup = members.length > 2;
      let chatName = data.name;
      let avatar_path;
      
      // Если это личный чат, используем имя собеседника
      if (!isGroup && !chatName) {
        const otherUser = members.find(member => member.id !== (currentUser?.id || 'admin1'));
        if (otherUser) {
          chatName = otherUser.display_name;
          avatar_path = otherUser.avatar_path;
        }
      }
      
      const newChat: Chat = {
        id: `chat${Date.now()}`,
        name: chatName || "Новый чат",
        is_group: isGroup,
        created_at: new Date().toISOString(),
        created_by_id: currentUser?.id || "admin1",
        members,
        unread_count: 0,
        avatar_path
      };
      
      MOCK_CHATS.push(newChat);
      MOCK_MESSAGES[newChat.id] = [];
      
      return newChat;
    } else {
      const response = await api.post<Chat>('/chats', data);
      return response.data;
    }
  },
  
  // Получение информации о конкретном чате
  async getChat(chatId: string): Promise<Chat> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chat = MOCK_CHATS.find(chat => chat.id === chatId);
      if (!chat) throw new Error('Чат не найден');
      
      return chat;
    } else {
      const response = await api.get<Chat>(`/chats/${chatId}`);
      return response.data;
    }
  },
  
  // Получение сообщений чата с пагинацией
  async getMessages(chatId: string, page: number = 1, perPage: number = 50): Promise<MessagePage> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const messages = MOCK_MESSAGES[chatId] || [];
      
      // Сортировка сообщений по времени (от старых к новым)
      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Пагинация
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedMessages = messages.slice(startIndex, endIndex);
      
      // Добавление информации об авторах сообщений
      const messagesWithAuthors = paginatedMessages.map(message => {
        const author = MOCK_USERS.find(user => user.id === message.user_id);
        return { ...message, author };
      });
      
      // Отметка всех сообщений как прочитанных
      MOCK_MESSAGES[chatId] = messages.map(msg => ({ ...msg, is_read: true }));
      
      // Обновление счетчика непрочитанных сообщений
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        MOCK_CHATS[chatIndex] = { ...MOCK_CHATS[chatIndex], unread_count: 0 };
      }
      
      return {
        messages: messagesWithAuthors,
        total: messages.length,
        pages: Math.ceil(messages.length / perPage),
        page
      };
    } else {
      const response = await api.get<MessagePage>(`/chats/${chatId}/messages`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    }
  },
  
  // Отправка сообщения
  async sendMessage(chatId: string, content: string): Promise<Message> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        is_read: false,
        chat_id: chatId,
        user_id: currentUser?.id || "admin1",
        author: currentUser || MOCK_USERS[0]
      };
      
      // Добавление сообщения в историю
      if (!MOCK_MESSAGES[chatId]) {
        MOCK_MESSAGES[chatId] = [];
      }
      MOCK_MESSAGES[chatId].push(newMessage);
      
      // Обновление последнего сообщения в чате
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        MOCK_CHATS[chatIndex] = {
          ...MOCK_CHATS[chatIndex],
          last_message: newMessage
        };
        
        // Перемещение чата в начало списка
        const chat = MOCK_CHATS.splice(chatIndex, 1)[0];
        MOCK_CHATS.unshift(chat);
      }
      
      return newMessage;
    } else {
      const response = await api.post<Message>(`/chats/${chatId}/messages`, {
        content
      });
      return response.data;
    }
  },
  
  // Отправка файла
  async sendFile(chatId: string, file: File): Promise<Message> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileUrl = URL.createObjectURL(file);
      const content = `[Файл: ${file.name}](${fileUrl})`;
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        is_read: false,
        chat_id: chatId,
        user_id: currentUser?.id || "admin1",
        author: currentUser || MOCK_USERS[0]
      };
      
      // Добавление сообщения в историю
      if (!MOCK_MESSAGES[chatId]) {
        MOCK_MESSAGES[chatId] = [];
      }
      MOCK_MESSAGES[chatId].push(newMessage);
      
      // Обновление последнего сообщения в чате
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        MOCK_CHATS[chatIndex] = {
          ...MOCK_CHATS[chatIndex],
          last_message: newMessage
        };
      }
      
      return newMessage;
    } else {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<Message>(`/chats/${chatId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    }
  },
  
  // Отметка сообщения как прочитанного
  async markAsRead(messageId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Поиск сообщения по ID
      for (const chatId in MOCK_MESSAGES) {
        const messageIndex = MOCK_MESSAGES[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          MOCK_MESSAGES[chatId][messageIndex].is_read = true;
          break;
        }
      }
    } else {
      await api.put(`/messages/${messageId}/read`);
    }
  },
  
  // Удаление сообщения
  async deleteMessage(messageId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Поиск и удаление сообщения
      for (const chatId in MOCK_MESSAGES) {
        const messageIndex = MOCK_MESSAGES[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          MOCK_MESSAGES[chatId].splice(messageIndex, 1);
          
          // Обновление последнего сообщения в чате, если удалено последнее
          const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
          if (chatIndex !== -1 && MOCK_CHATS[chatIndex].last_message?.id === messageId) {
            const lastMessage = MOCK_MESSAGES[chatId].length > 0 ? 
              MOCK_MESSAGES[chatId][MOCK_MESSAGES[chatId].length - 1] : undefined;
            
            MOCK_CHATS[chatIndex] = {
              ...MOCK_CHATS[chatIndex],
              last_message: lastMessage
            };
          }
          
          break;
        }
      }
    } else {
      await api.delete(`/messages/${messageId}`);
    }
  },
  
  // Добавление участников в групповой чат
  async addMembers(chatId: string, memberIds: string[]): Promise<Chat> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex === -1) throw new Error('Чат не найден');
      
      // Если это не групповой чат, преобразуем его в групповой
      if (!MOCK_CHATS[chatIndex].is_group) {
        MOCK_CHATS[chatIndex].is_group = true;
      }
      
      // Добавление новых участников
      const newMembers = memberIds
        .filter(id => !MOCK_CHATS[chatIndex].members.some(member => member.id === id))
        .map(id => MOCK_USERS.find(user => user.id === id))
        .filter(Boolean) as User[];
      
      MOCK_CHATS[chatIndex].members = [...MOCK_CHATS[chatIndex].members, ...newMembers];
      
      return MOCK_CHATS[chatIndex];
    } else {
      const response = await api.post<Chat>(`/chats/${chatId}/members`, {
        member_ids: memberIds
      });
      return response.data;
    }
  },
  
  // Удаление участника из чата
  async removeMember(chatId: string, memberId: string): Promise<Chat> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex === -1) throw new Error('Чат не найден');
      
      // Удаление участника
      MOCK_CHATS[chatIndex].members = MOCK_CHATS[chatIndex].members.filter(
        member => member.id !== memberId
      );
      
      return MOCK_CHATS[chatIndex];
    } else {
      const response = await api.delete<Chat>(`/chats/${chatId}/members/${memberId}`);
      return response.data;
    }
  },
  
  // Обновление информации о чате
  async updateChat(chatId: string, data: { name?: string }): Promise<Chat> {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const chatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (chatIndex === -1) throw new Error('Чат не найден');
      
      // Обновление информации
      MOCK_CHATS[chatIndex] = {
        ...MOCK_CHATS[chatIndex],
        ...data
      };
      
      return MOCK_CHATS[chatIndex];
    } else {
      const response = await api.put<Chat>(`/chats/${chatId}`, data);
      return response.data;
    }
  }
};

export default chatService;
