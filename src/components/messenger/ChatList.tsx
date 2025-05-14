
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatLastSeen } from "@/components/messenger/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatListProps {
  chats: any[];
  activeChat: any;
  onSelectChat: (chat: any) => void;
  currentUserId: string;
}

const ChatList = ({ chats, activeChat, onSelectChat, currentUserId }: ChatListProps) => {
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Нет доступных чатов
      </div>
    );
  }

  return (
    <div className="divide-y">
      {chats.map((chat) => {
        const otherParticipant = chat.participants.find(
          (p: any) => p.id !== currentUserId
        );
        
        const isActive = activeChat?.id === chat.id;
        const hasUnread = chat.unreadCount > 0;
        
        return (
          <div
            key={chat.id}
            className={cn(
              "flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-50",
              isActive && "bg-gray-100 hover:bg-gray-100"
            )}
            onClick={() => onSelectChat(chat)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.isGroup ? null : chat.avatar || otherParticipant?.avatar} />
              <AvatarFallback>
                {chat.isGroup 
                  ? "G" 
                  : (otherParticipant?.displayName?.[0] || "?")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium truncate">
                  {chat.name}
                </div>
                {chat.lastMessage && (
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage 
                    ? chat.lastMessage.text
                    : chat.isGroup 
                      ? `${chat.participants.length} участников`
                      : otherParticipant?.isOnline 
                        ? "В сети" 
                        : formatLastSeen(otherParticipant?.lastSeen)}
                </div>
                
                {hasUnread && (
                  <Badge variant="default" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
