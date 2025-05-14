
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import UserSettings from "@/components/messenger/UserSettings";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateChatDialog from "@/components/messenger/CreateChatDialog";
import { useAuth } from "@/contexts/AuthContext";
import chatService from "@/api/chatService";
import socketService from "@/api/socketService";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const MessengerLayout = () => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTyping, setUserTyping] = useState<{
    userId: string;
    chatId: string;
  } | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const chatList = await chatService.getChats();
        setChats(chatList);
      } catch (error) {
        console.error("Ошибка при загрузке чатов:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список чатов",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    socketService.connect().catch((error) => {
      console.error("Ошибка подключения WebSocket:", error);
    });

    const handleNewMessage = (message: any) => {
      if (activeChat && message.chat_id === activeChat.id) {
        setMessages((prev) => [...prev, message]);
      }
      setChats((prev) => {
        const updatedChats = [...prev];
        const chatIndex = updatedChats.findIndex(
          (c) => c.id === message.chat_id,
        );
        if (chatIndex !== -1) {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            last_message: message,
            unread_count:
              activeChat?.id === message.chat_id
                ? 0
                : (updatedChats[chatIndex].unread_count || 0) + 1,
          };
          const updatedChat = updatedChats.splice(chatIndex, 1)[0];
          updatedChats.unshift(updatedChat);
        }
        return updatedChats;
      });
    };

    const handleTyping = (data: any) => {
      if (data.user_id !== user?.id) {
        setUserTyping(
          data.is_typing
            ? { userId: data.user_id, chatId: data.chat_id }
            : null,
        );
      }
    };

    const handleUserStatus = (status: any) => {
      setChats((prev) => {
        return prev.map((chat) => {
          const updatedParticipants = chat.members.map((member: any) => {
            if (member.id === status.user_id) {
              return {
                ...member,
                isOnline: status.status === "online",
                last_seen: status.last_seen,
              };
            }
            return member;
          });
          return {
            ...chat,
            members: updatedParticipants,
          };
        });
      });
    };

    socketService.on("message", handleNewMessage);
    socketService.on("typing", handleTyping);
    socketService.on("status", handleUserStatus);

    return () => {
      socketService.off("message", handleNewMessage);
      socketService.off("typing", handleTyping);
      socketService.off("status", handleUserStatus);
      socketService.disconnect();
    };
  }, [activeChat, user?.id]);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const result = await chatService.getMessages(activeChat.id);
          setMessages(result.messages.reverse());
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat.id ? { ...chat, unread_count: 0 } : chat,
            ),
          );
        } catch (error) {
          console.error("Ошибка при загрузке сообщений:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить сообщения",
            variant: "destructive",
          });
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  const handleSendMessage = async (text: string) => {
    if (!activeChat || !text.trim()) return;
    try {
      const message = await chatService.sendMessage(activeChat.id, text);
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleCreateChat = async (selectedUsers: string[]) => {
    try {
      const newChat = await chatService.createChat({
        member_ids: selectedUsers,
      });
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      toast({ title: "Успешно", description: "Чат успешно создан" });
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать чат",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (updatedUser: any) => {
    try {
      setShowSettings(false);
      toast({ title: "Успешно", description: "Профиль успешно обновлен" });
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <div className="w-80 flex flex-col border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_path} />
              <AvatarFallback>{user.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{user.display_name}</div>
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
            <Button variant="ghost" size="icon" onClick={logout} title="Выйти">
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
                  currentUser={user}
                  onCreateChat={handleCreateChat}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mb-3">
            <Icon
              name="Search"
              className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Поиск чатов"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChatList
              chats={filteredChats}
              activeChat={activeChat}
              onSelectChat={setActiveChat}
              currentUserId={user.id}
            />
          )}
        </div>
      </div>

      {activeChat ? (
        <ChatWindow
          chat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={user}
          userTyping={
            userTyping && userTyping.chatId === activeChat.id
              ? userTyping.userId
              : null
          }
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Icon
                name="MessageSquare"
                className="h-12 w-12 text-primary opacity-20"
              />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Выберите чат
            </h3>
            <p className="text-muted-foreground max-w-md">
              Выберите существующий чат из списка слева или создайте новый,
              нажав на иконку "+" вверху списка чатов
            </p>
          </div>
        </div>
      )}

      {showSettings && (
        <UserSettings
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default MessengerLayout;
