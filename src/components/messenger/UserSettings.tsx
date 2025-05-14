
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";

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
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">Профиль</TabsTrigger>
            <TabsTrigger value="avatar" className="flex-1">Аватар</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Уведомления</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName">Отображаемое имя</Label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <Label>Имя пользователя</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={user.username}
                    disabled
                  />
                  <Button variant="outline" size="icon" type="button" disabled title="Невозможно изменить имя пользователя">
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
                <Button type="submit">
                  Сохранить
                </Button>
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
            
            <h3 className="font-medium">Выберите аватар</h3>
            <div className="grid grid-cols-3 gap-3">
              {predefinedAvatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`relative rounded-lg overflow-hidden border-2 p-1 ${
                    tempAvatar === avatar ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setTempAvatar(avatar)}
                >
                  <img src={avatar} alt="Аватар" className="w-full aspect-square object-cover rounded" />
                  {tempAvatar === avatar && (
                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Icon name="Check" className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
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
