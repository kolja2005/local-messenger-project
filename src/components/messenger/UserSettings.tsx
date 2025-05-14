import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

interface UserSettingsProps {
  user: any;
  onClose: () => void;
  onUpdate: (user: any) => void;
}

const UserSettings = ({ user, onClose, onUpdate }: UserSettingsProps) => {
  const [form, setForm] = useState({
    displayName: user.displayName,
    avatar: user.avatar,
  });

  const [tempAvatar, setTempAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const predefinedAvatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...user,
      ...form,
      avatar: tempAvatar,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (максимум 5МБ)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5МБ",
        variant: "destructive",
      });
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Файл должен быть изображением",
        variant: "destructive",
      });
      return;
    }

    // Создание URL для превью изображения
    const imageUrl = URL.createObjectURL(file);
    setTempAvatar(imageUrl);

    // В реальном приложении здесь был бы код для загрузки на сервер
    toast({
      title: "Аватар загружен",
      description: "Нажмите 'Сохранить', чтобы применить изменения",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">
              Профиль
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex-1">
              Аватар
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              Уведомления
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName">Отображаемое имя</Label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Имя пользователя</Label>
                <div className="flex gap-2 items-center">
                  <Input value={user.username} disabled />
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    disabled
                    title="Невозможно изменить имя пользователя"
                  >
                    <Icon name="Lock" className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Имя пользователя нельзя изменить
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-4 mt-4">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={tempAvatar} />
                <AvatarFallback className="text-2xl">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Загрузить свое изображение</h3>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="Upload" className="mr-2 h-4 w-4" />
                    Выбрать файл
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Поддерживаются JPG, PNG. Максимальный размер: 5МБ
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Или укажите URL изображения</h3>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customAvatarUrl) {
                        setTempAvatar(customAvatarUrl);
                        toast({
                          title: "Аватар обновлен",
                          description:
                            "Нажмите 'Сохранить', чтобы применить изменения",
                        });
                      }
                    }}
                  >
                    <Icon name="Check" className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Или выберите из галереи</h3>
                <div className="grid grid-cols-3 gap-3">
                  {predefinedAvatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      className={`relative rounded-lg overflow-hidden border-2 p-1 ${
                        tempAvatar === avatar
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setTempAvatar(avatar)}
                    >
                      <img
                        src={avatar}
                        alt="Аватар"
                        className="w-full aspect-square object-cover rounded"
                      />
                      {tempAvatar === avatar && (
                        <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Icon name="Check" className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setForm({ ...form, avatar: tempAvatar });
                  onUpdate({
                    ...user,
                    avatar: tempAvatar,
                  });
                }}
              >
                Сохранить
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Настройки уведомлений недоступны в демо-версии приложения.
              </p>

              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Закрыть
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
