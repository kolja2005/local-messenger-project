import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { formatLastSeen } from "@/components/messenger/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import chatService from "@/api/chatService";
import { Skeleton } from "@/components/ui/skeleton";
import socketService from "@/api/socketService";
import { useAuth } from "@/contexts/AuthContext";

interface ChatWindowProps {
  chat: any;
  onSendMessage: (text: string) => Promise<void>;
  currentUser: any;
  onChatInfoUpdated?: (chat: any) => void;
}

const ChatWindow = ({
  chat,
  onSendMessage,
  currentUser,
  onChatInfoUpdated,
}: ChatWindowProps) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [userTyping, setUserTyping] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const otherParticipant = chat.members?.find(
    (p: any) => p.id !== currentUser.id,
  );

  useEffect(() => {
    // Загрузка сообщений при изменении активного чата
    const fetchMessages = async () => {
      if (!chat?.id) return;

      try {
        setIsLoading(true);
        const response = await chatService.getMessages(chat.id);

        // Сообщения приходят в обратном порядке (новые первыми)
        // Переворачиваем для отображения
        setMessages(response.messages.reverse());
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Подписка на события сокета для текущего чата
    const onNewMessage = (message: any) => {
      if (message.chat_id === chat.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onTyping = (data: any) => {
      if (data.chat_id === chat.id && data.user_id !== user?.id) {
        // Найти пользователя, который печатает
        const typingUser = chat.members.find(
          (member: any) => member.id === data.user_id,
        );

        if (data.is_typing) {
          setUserTyping(typingUser);
        } else if (userTyping?.id === data.user_id) {
          setUserTyping(null);
        }
      }
    };

    socketService.on("message", onNewMessage);
    socketService.on("typing", onTyping);

    return () => {
      socketService.off("message", onNewMessage);
      socketService.off("typing", onTyping);
    };
  }, [chat, user?.id]);

  useEffect(() => {
    // Прокрутка к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chat?.id) return;

    try {
      await onSendMessage(messageText);
      setMessageText("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Отправляем событие "печатает" через сокет
    socketService.sendTyping(chat.id, e.target.value.length > 0);
  };

  const getStatusText = () => {
    if (chat.is_group) {
      // Подсчет участников онлайн
      const onlineCount =
        chat.members?.filter((p: any) => p.isOnline && p.id !== currentUser.id)
          .length || 0;
      return `${chat.members?.length || 0} участников, ${onlineCount} в сети`;
    } else if (otherParticipant) {
      if (otherParticipant.isOnline) {
        return "В сети";
      } else {
        return formatLastSeen(otherParticipant.last_seen);
      }
    }
    return "";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Заголовок чата */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={chat.is_group ? null : otherParticipant?.avatar_path}
            />
            <AvatarFallback>
              {chat.is_group
                ? (chat.name?.[0] ?? "G")
                : otherParticipant?.display_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {chat.is_group ? chat.name : otherParticipant?.display_name}
            </div>
            <div className="text-xs text-muted-foreground">
              {userTyping ? (
                <span className="flex items-center gap-1">
                  <span className="text-primary">
                    {userTyping.display_name} печатает
                  </span>
                  <span className="typing-animation">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                </span>
              ) : (
                getStatusText()
              )}
            </div>
          </div>
        </div>

        <Dialog open={showChatInfo} onOpenChange={setShowChatInfo}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icon name="Info" className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Информация о чате</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={chat.is_group ? null : otherParticipant?.avatar_path}
                  />
                  <AvatarFallback className="text-xl">
                    {chat.is_group
                      ? (chat.name?.[0] ?? "G")
                      : otherParticipant?.display_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <h3 className="font-medium text-lg">
                  {chat.is_group ? chat.name : otherParticipant?.display_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">
                  Участники ({chat.members?.length || 0})
                </h4>
                <div className="space-y-2">
                  {chat.members?.map((participant: any) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar_path} />
                        <AvatarFallback>
                          {participant.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">
                          {participant.display_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {participant.isOnline
                            ? "В сети"
                            : formatLastSeen(participant.last_seen)}
                        </div>
                      </div>
                      {participant.id === currentUser.id && (
                        <span className="text-xs text-muted-foreground">
                          (вы)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50 flex flex-col gap-3">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    index % 2 === 0
                      ? "bg-white border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <Skeleton
                    className={`h-4 w-${4 + Math.floor(Math.random() * 5) * 10} mb-1`}
                  />
                  <Skeleton
                    className={`h-3 w-12 mt-1 ${index % 2 === 0 ? "" : "ml-auto"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => {
              const isMine = message.user_id === currentUser.id;
              const sender = chat.members?.find(
                (p: any) => p.id === message.user_id,
              );

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border"
                    }`}
                  >
                    {!isMine && chat.is_group && (
                      <div className="text-xs font-medium mb-1">
                        {sender?.display_name}
                      </div>
                    )}
                    <div>{message.content}</div>
                    <div
                      className={`text-xs mt-1 text-right ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Нет сообщений
          </div>
        )}

        {userTyping && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg p-3 max-w-[70%]">
              <div className="text-xs font-medium mb-1">
                {userTyping.display_name}
              </div>
              <div className="flex gap-1 h-5 items-center">
                <span className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t flex gap-2 items-center"
      >
        <Input
          placeholder="Введите сообщение..."
          value={messageText}
          onChange={handleTyping}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!messageText.trim()}>
          <Icon name="Send" className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
