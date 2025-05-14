import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { formatLastSeen } from "@/components/messenger/utils";
import userService from "@/api/userService";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateChatDialogProps {
  currentUser: any;
  onCreateChat: (selectedUsers: string[], groupName?: string) => void;
  onCancel: () => void;
}

const CreateChatDialog = ({
  currentUser,
  onCreateChat,
  onCancel,
}: CreateChatDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const usersData = await userService.getUsers();
        setUsers(usersData.filter((user: any) => user.id !== currentUser?.id));
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список пользователей",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.id]);

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одного пользователя",
        variant: "destructive",
      });
      return;
    }

    const isGroup = selectedUsers.length > 1;

    if (isGroup && !groupName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название группового чата",
        variant: "destructive",
      });
      return;
    }

    onCreateChat(selectedUsers, isGroup ? groupName : undefined);
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const isGroup = selectedUsers.length > 1;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Создать {isGroup ? "групповой чат" : "диалог"}
        </DialogTitle>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        <div className="relative">
          <Icon
            name="Search"
            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Поиск пользователей"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isGroup && (
          <div className="grid gap-2">
            <Label htmlFor="groupName">Название группы</Label>
            <Input
              id="groupName"
              placeholder="Введите название группы"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div>
            <Label className="mb-2 block">
              Выбрано: {selectedUsers.length}
            </Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedUsers.map((userId) => {
                const user = users.find((u) => u.id === userId);
                if (!user) return null;

                return (
                  <div
                    key={user.id}
                    className="bg-secondary text-secondary-foreground rounded-full pl-1 pr-2 py-1 flex items-center gap-1 text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar_path} />
                      <AvatarFallback className="text-[10px]">
                        {user.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.display_name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleUser(user.id)}
                      className="ml-1 hover:text-muted-foreground"
                    >
                      <Icon name="X" className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border rounded-md h-60 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                    className="mr-3"
                  />
                  <Label
                    htmlFor={`user-${user.id}`}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_path} />
                      <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.isOnline
                          ? "Онлайн"
                          : formatLastSeen(user.last_seen)}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Пользователи не найдены
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={
              selectedUsers.length === 0 || (isGroup && !groupName.trim())
            }
            onClick={handleCreateChat}
          >
            Создать {isGroup ? "групповой чат" : "диалог"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateChatDialog;
