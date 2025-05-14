
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import UserSettings from "@/components/messenger/UserSettings";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateChatDialog from "@/components/messenger/CreateChatDialog";
import { mockedUsers, mockedChats, generateMessages } from "@/components/messenger/mockData";

interface MessengerLayoutProps {
  currentUser: any;
  onLogout: () => void;
}

const MessengerLayout = ({ currentUser, onLogout }: MessengerLayoutProps) => {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chats, setChats] = useState(mockedChats);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  useEffect(() => {
    if (activeChat) {
      setMessages(generateMessages(activeChat.id, 15));
      
      // Имитация "печатает..." через 5 секунд
      const typingTimeout = setTimeout(() => {
        setUserTyping(true);
        
        // Прекращение печатания и новое сообщение через 3 секунды
        const messageTimeout = setTimeout(() => {
          setUserTyping(false);
          setMessages(prev => [...prev, {
            id: `auto-${Date.now()}`,
            chatId: activeChat.id,
            senderId: activeChat.participants[0].id,
            text: "Привет! Как дела?",
            timestamp: new Date(),
            isRead: false
          }]);
        }, 3000);
        
        return () => clearTimeout(messageTimeout);
      }, 5000);
      
      return () => clearTimeout(typingTimeout);
    }
  }, [activeChat]);

  const handleSendMessage = (text: string) => {
    if (!activeChat || !text.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCreateChat = (selectedUsers: string[]) => {
    const newChatId = `chat-${Date.now()}`;
    const participants = [
      currentUser,
      ...mockedUsers.filter(user => selectedUsers.includes(user.id))
    ];
    
    const chatName = participants.length > 2 
      ? `Групповой чат (${participants.length})`
      : participants.find(p => p.id !== currentUser.id)?.displayName || "Новый чат";
    
    const newChat = {
      id: newChatId,
      name: chatName,
      participants: participants,
      lastMessage: null,
      isGroup: participants.length > 2,
      unreadCount: 0,
      avatar: participants.length > 2 
        ? null 
        : participants.find(p => p.id !== currentUser.id)?.avatar
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Боковая панель с чатами */}
      <div className="w-80 flex flex-col border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{currentUser.displayName}</div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(true)}
              title="Настройки профиля"
            >
              <Icon name="Settings" className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              title="Выйти"
            >
              <Icon name="LogOut" className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Чаты</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Создать чат">
                  <Icon name="Plus" className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <CreateChatDialog 
                  currentUser={currentUser} 
                  onCreateChat={handleCreateChat} 
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mb-3">
            <Icon name="Search" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск чатов"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ChatList 
            chats={filteredChats} 
            activeChat={activeChat} 
            onSelectChat={setActiveChat} 
            currentUserId={currentUser.id}
          />
        </div>
      </div>
      
      {/* Основное окно чата */}
      {activeChat ? (
        <ChatWindow 
          chat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          userTyping={userTyping}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Icon name="MessageSquare" className="h-12 w-12 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">Выберите чат</h3>
            <p className="text-muted-foreground max-w-md">
              Выберите существующий чат из списка слева или создайте новый, 
              нажав на иконку "+" вверху списка чатов
            </p>
          </div>
        </div>
      )}
      
      {/* Модальное окно настроек */}
      {showSettings && (
        <UserSettings 
          user={currentUser} 
          onClose={() => setShowSettings(false)} 
          onUpdate={(updatedUser) => {
            // Здесь была бы логика обновления пользователя
            // но для демо просто закрываем окно
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
};

export default MessengerLayout;
