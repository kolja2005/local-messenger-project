
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { formatLastSeen } from "@/components/messenger/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ChatWindowProps {
  chat: any;
  messages: any[];
  onSendMessage: (text: string) => void;
  currentUser: any;
  userTyping: string | null;
}

const ChatWindow = ({ chat, messages, onSendMessage, currentUser, userTyping }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChatInfo, setShowChatInfo] = useState(false);

  const otherParticipant = (chat.participants || chat.members || []).find((p: any) => p.id !== currentUser.id);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText("");
    }
  };

  const getStatusText = () => {
    if (chat.is_group) {
      const onlineCount = (chat.participants || chat.members || [])
        .filter((p: any) => p.isOnline && p.id !== currentUser.id).length;
      return `${(chat.participants || chat.members || []).length} участников, ${onlineCount} в сети`;
    } else {
      if (otherParticipant?.isOnline) {
        return "В сети";
      } else {
        return formatLastSeen(otherParticipant?.last_seen);
      }
    }
  };

  const getTypingUserName = () => {
    if (!userTyping) return null;
    const typingUser = (chat.participants || chat.members || []).find((p: any) => p.id === userTyping);
    return typingUser?.display_name || "Кто-то";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Заголовок чата */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={chat.is_group ? null : chat.avatar_path || otherParticipant?.avatar_path} />
            <AvatarFallback>
              {chat.is_group 
                ? "G" 
                : (otherParticipant?.display_name?.[0] || "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{chat.name}</div>
            <div className="text-xs text-muted-foreground">
              {userTyping ? (
                <span className="flex items-center gap-1">
                  <span className="text-primary">{getTypingUserName()} печатает</span>
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
                  <AvatarImage src={chat.is_group ? null : chat.avatar_path || otherParticipant?.avatar_path} />
                  <AvatarFallback className="text-xl">
                    {chat.is_group 
                      ? "G" 
                      : (otherParticipant?.display_name?.[0] || "?")}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center">
                <h3 className="font-medium text-lg">{chat.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Участники ({(chat.participants || chat.members || []).length})</h4>
                <div className="space-y-2">
                  {(chat.participants || chat.members || []).map((participant: any) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar_path} />
                        <AvatarFallback>{participant.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{participant.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.isOnline ? "В сети" : formatLastSeen(participant.last_seen)}
                        </div>
                      </div>
                      {participant.id === currentUser.id && (
                        <span className="text-xs text-muted-foreground">(вы)</span>
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
        {messages.map((message) => {
          const isMine = message.user_id === currentUser.id;
          const sender = (chat.participants || chat.members || []).find((p: any) => p.id === message.user_id);
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMine ? 'bg-primary text-primary-foreground' : 'bg-white border'
                }`}
              >
                {!isMine && chat.is_group && (
                  <div className="text-xs font-medium mb-1">{sender?.display_name}</div>
                )}
                <div>{message.content}</div>
                <div 
                  className={`text-xs mt-1 text-right ${isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {userTyping && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg p-3 max-w-[70%]">
              <div className="text-xs font-medium mb-1">{getTypingUserName()}</div>
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
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 items-center">
        <Input
          placeholder="Введите сообщение..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
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
