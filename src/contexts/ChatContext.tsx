
import React, { createContext, useState, useEffect, useContext } from 'react';
import chatService, { Chat, Message, MessagePage } from '../api/chatService';
import socketService from '../api/socketService';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  userTyping: { userId: string; chatId: string } | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (text: string) => Promise<void>;
  createChat: (memberIds: string[], name?: string) => Promise<Chat>;
  loadMoreMessages: () => Promise<boolean>;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userTyping, setUserTyping] = useState<{ userId: string; chatId: string } | null>(null);

  // Загрузка списка чатов при инициализации
  useEffect(() => {
    if (user) {
      refreshChats();
      connectToSocket();
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (activeChat) {
      loadChatMessages(activeChat.id);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const connectToSocket = async () => {
    try {
      await socketService.connect();
      
      // Обработчики событий сокета
      socketService.on('message', handleNewMessage);
      socketService.on('typing', handleUserTyping);
      socketService.on('status', handleUserStatus);
    } catch (error) {
      console.error('Ошибка при подключении к WebSocket:', error);
    }
  };

  const refreshChats = async () => {
    setIsLoading(true);
    try {
      const chatList = await chatService.getChats();
      setChats(chatList);
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список чатов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const result = await chatService.getMessages(chatId, 1, 20);
      setMessages(result.messages);
      setCurrentPage(1);
      setTotalPages(result.pages);
      
      // Обновляем счетчик непрочитанных сообщений в чате
      setChats(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread_count: 0 } 
            : chat
        )
      );
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async (): Promise<boolean> => {
    if (!activeChat || currentPage >= totalPages) {
      return false;
    }
    
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await chatService.getMessages(activeChat.id, nextPage, 20);
      
      // Добавляем сообщения в начало списка (более старые сообщения)
      setMessages(prev => [...result.messages, ...prev]);
      setCurrentPage(nextPage);
      
      return result.messages.length > 0;
    } catch (error) {
      console.error('Ошибка при загрузке дополнительных сообщений:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string): Promise<void> => {
    if (!activeChat || !text.trim()) return;
    
    try {
      const message = await chatService.sendMessage(activeChat.id, text);
      setMessages(prev => [...prev, message]);
      
      // Обновляем последнее сообщение в чате и перемещаем чат в начало списка
      updateChatWithNewMessage(message);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const createChat = async (memberIds: string[], name?: string): Promise<Chat> => {
    setIsLoading(true);
    try {
      const newChat = await chatService.createChat({
        member_ids: memberIds,
        name
      });
      
      // Добавляем новый чат в список и делаем его активным
      setChats(prev => [newChat, ...prev]);
      
      return newChat;
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать чат",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики событий WebSocket
  const handleNewMessage = (message: Message) => {
    // Добавляем сообщение в историю, если это активный чат
    if (activeChat && message.chat_id === activeChat.id) {
      setMessages(prev => [...prev, message]);
      
      // Отмечаем сообщение как прочитанное
      chatService.markAsRead(message.id);
    }
    
    // Обновляем информацию о последнем сообщении в чате
    updateChatWithNewMessage(message);
  };

  const handleUserTyping = (data: { user_id: string; chat_id: string; is_typing: boolean }) => {
    if (data.user_id !== user?.id) {
      if (data.is_typing) {
        setUserTyping({ userId: data.user_id, chatId: data.chat_id });
        
        // Сбрасываем статус печати через 3 секунды, если не придет новое событие
        setTimeout(() => {
          setUserTyping(prev => {
            if (prev && prev.userId === data.user_id && prev.chatId === data.chat_id) {
              return null;
            }
            return prev;
          });
        }, 3000);
      } else {
        setUserTyping(prev => {
          if (prev && prev.userId === data.user_id && prev.chatId === data.chat_id) {
            return null;
          }
          return prev;
        });
      }
    }
  };

  const handleUserStatus = (status: { user_id: string; status: 'online' | 'offline'; last_seen: string }) => {
    // Обновляем статус пользователя во всех чатах
    setChats(prev => {
      return prev.map(chat => {
        const updatedMembers = chat.members.map(member => {
          if (member.id === status.user_id) {
            return {
              ...member,
              isOnline: status.status === 'online',
              last_seen: status.last_seen
            };
          }
          return member;
        });
        
        return {
          ...chat,
          members: updatedMembers
        };
      });
    });
  };

  // Вспомогательная функция для обновления чата при получении нового сообщения
  const updateChatWithNewMessage = (message: Message) => {
    setChats(prev => {
      const chatIndex = prev.findIndex(c => c.id === message.chat_id);
      
      if (chatIndex === -1) return prev;
      
      const updatedChats = [...prev];
      const chat = updatedChats[chatIndex];
      
      // Определяем, нужно ли увеличивать счетчик непрочитанных сообщений
      const incrementUnread = message.user_id !== user?.id && 
        (!activeChat || activeChat.id !== message.chat_id);
      
      const updatedChat = {
        ...chat,
        last_message: message,
        unread_count: incrementUnread ? chat.unread_count + 1 : chat.unread_count
      };
      
      // Удаляем чат из текущей позиции
      updatedChats.splice(chatIndex, 1);
      
      // Добавляем обновленный чат в начало списка
      return [updatedChat, ...updatedChats];
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        isLoading,
        userTyping,
        setActiveChat,
        sendMessage,
        createChat,
        loadMoreMessages,
        refreshChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
