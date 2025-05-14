
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockedUsers } from "@/components/messenger/mockData";
import { formatLastSeen } from "@/components/messenger/utils";

const AdminPanel = () => {
  const [users, setUsers] = useState(mockedUsers);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Панель администратора</CardTitle>
          <CardDescription>
            Управление пользователями и настройками мессенджера
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="chats">Чаты</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <Icon name="Search" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск пользователей"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить пользователя</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input id="username" placeholder="username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Отображаемое имя</Label>
                    <Input id="displayName" placeholder="Иван Иванов" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline">Отмена</Button>
                    <Button type="submit">Создать</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 border-b font-medium">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Пользователь</div>
                  <div className="col-span-2">Имя</div>
                  <div className="col-span-2">Статус</div>
                  <div className="col-span-2">Последний вход</div>
                  <div className="col-span-2 text-right">Действия</div>
                </div>
                
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <div key={user.id} className="grid grid-cols-12 p-4 items-center border-b">
                      <div className="col-span-1">{index + 1}</div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                      <div className="col-span-2">{user.displayName}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isOnline 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isOnline ? 'Онлайн' : 'Офлайн'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {user.isOnline ? 'Сейчас' : formatLastSeen(user.lastSeen)}
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Пользователи не найдены
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Управление чатами</CardTitle>
              <CardDescription>
                Создание и модерация групповых чатов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 text-muted-foreground">
                <Icon name="MessageSquare" className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>Управление чатами недоступно в демо-версии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки системы</CardTitle>
              <CardDescription>
                Основные настройки мессенджера
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="appName">Название приложения</Label>
                <Input id="appName" defaultValue="ЛокалЧат" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maxFileSize">Максимальный размер файла (МБ)</Label>
                <Input id="maxFileSize" type="number" defaultValue="10" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" />
              </div>
              
              <div className="flex justify-end">
                <Button>Сохранить настройки</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
