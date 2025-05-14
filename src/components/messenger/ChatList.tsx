import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatLastSeen } from "@/components/messenger/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListProps {
  chats: any[];
  activeChat: any;
  onSelectChat: (chat: any) => void;
  currentUserId: string;
  isLoading: boolean;
}

const ChatList = ({
  chats,
  activeChat,
  onSelectChat,
  currentUserId,
  isLoading,
}: ChatListProps) => {
  // Обработка состояния загрузки
  if (isLoading) {
    return (
      <div className="p-1 space-y-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Если нет чатов
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
        const otherParticipant = chat.members?.find(
          (p: any) => p.id !== currentUserId,
        );

        const isActive = activeChat?.id === chat.id;
        const hasUnread = chat.unread_count > 0;

        return (
          <div
            key={chat.id}
            className={cn(
              "flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-50",
              isActive && "bg-gray-100 hover:bg-gray-100",
            )}
            onClick={() => onSelectChat(chat)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={chat.is_group ? null : otherParticipant?.avatar_path}
              />
              <AvatarFallback>
                {chat.is_group
                  ? (chat.name?.[0] ?? "G")
                  : otherParticipant?.display_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium truncate">
                  {chat.is_group ? chat.name : otherParticipant?.display_name}
                </div>
                {chat.last_message && (
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.last_message.timestamp).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground truncate">
                  {chat.last_message
                    ? chat.last_message.content
                    : chat.is_group
                      ? `${chat.members?.length || 0} участников`
                      : otherParticipant?.isOnline
                        ? "В сети"
                        : formatLastSeen(otherParticipant?.last_seen)}
                </div>

                {hasUnread && (
                  <Badge
                    variant="default"
                    className="rounded-full h-5 min-w-5 flex items-center justify-center"
                  >
                    {chat.unread_count}
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
