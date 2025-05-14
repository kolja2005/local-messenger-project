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
import userService from "@/api/userService";
import { useAuth } from "@/contexts/AuthContext";

interface UserSettingsProps {
  user: any;
  onClose: () => void;
  onUpdate: (user: any) => void;
}

const UserSettings = ({ user, onClose, onUpdate }: UserSettingsProps) => {
  const [form, setForm] = useState({
    displayName: user.display_name || "",
    avatar: user.avatar_path || "",
  });

  const [tempAvatar, setTempAvatar] = useState(user.avatar_path || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const data: any = {
        display_name: form.displayName,
      };

      if (tempAvatar !== user.avatar_path) {
        data.avatar_path = tempAvatar;
      }

      const updatedUser = await userService.updateProfile(data);

      updateUser({
        ...user,
        display_name: updatedUser.display_name,
        avatar_path: updatedUser.avatar_path || user.avatar_path,
      });

      toast({
        title: "Профиль обновлен",
        description: "Ваши изменения успешно сохранены",
      });

      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5МБ",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Файл должен быть изображением",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      setTempAvatar(imageUrl);

      toast({
        title: "Загрузка...",
        description: "Пожалуйста, подождите",
      });

      const uploadedUrl = await userService.uploadAvatar(file);
      setTempAvatar(uploadedUrl);

      toast({
        title: "Аватар загружен",
        description: "Нажмите 'Сохранить', чтобы применить изменения",
      });
    } catch (error) {
      console.error("Ошибка загрузки аватара:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive",
      });
    }
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
            <TabsTrigger value="password" className="flex-1">
              Пароль
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
                  disabled={isSubmitting}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-4 mt-4">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={tempAvatar} />
                <AvatarFallback className="text-2xl">
                  {user.display_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Загрузить изображение</h3>
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customAvatarUrl) {
                        setTempAvatar(customAvatarUrl);
                      }
                    }}
                    disabled={!customAvatarUrl || isSubmitting}
                  >
                    <Icon name="Check" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setForm({ ...form, avatar: tempAvatar });
                  handleSubmit(new Event("submit") as any);
                }}
                disabled={isSubmitting || tempAvatar === user.avatar_path}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const currentPassword = formData.get(
                  "currentPassword",
                ) as string;
                const newPassword = formData.get("newPassword") as string;
                const confirmPassword = formData.get(
                  "confirmPassword",
                ) as string;

                if (!currentPassword || !newPassword || !confirmPassword) {
                  toast({
                    title: "Ошибка",
                    description: "Заполните все поля",
                    variant: "destructive",
                  });
                  return;
                }

                if (newPassword !== confirmPassword) {
                  toast({
                    title: "Ошибка",
                    description: "Новые пароли не совпадают",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  setIsSubmitting(true);

                  await userService.changePassword({
                    current_password: currentPassword,
                    new_password: newPassword,
                  });

                  toast({
                    title: "Успешно",
                    description: "Пароль успешно изменен",
                  });

                  onClose();
                } catch (error) {
                  console.error("Ошибка смены пароля:", error);
                  toast({
                    title: "Ошибка",
                    description:
                      "Не удалось изменить пароль. Проверьте текущий пароль.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Подтвердите новый пароль
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение..." : "Изменить пароль"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
