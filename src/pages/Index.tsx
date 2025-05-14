
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginPage from "@/components/messenger/LoginPage";
import MessengerLayout from "@/components/messenger/MessengerLayout";
import AdminPanel from "@/components/messenger/AdminPanel";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const handleLogin = (username: string, password: string) => {
    // Имитация авторизации
    if (username === "admin" && password === "admin") {
      setIsAdmin(true);
      setCurrentUser({
        id: "admin1",
        username: "admin",
        displayName: "Администратор",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      });
      setIsLoggedIn(true);
    } else if (username && password) {
      setIsAdmin(false);
      setCurrentUser({
        id: "user1",
        username: username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        <Tabs defaultValue="messenger" className="w-full">
          <div className="border-b px-4 py-2 flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="messenger">Мессенджер</TabsTrigger>
              <TabsTrigger value="admin">Админ-панель</TabsTrigger>
            </TabsList>
            <Button variant="ghost" onClick={handleLogout}>Выйти</Button>
          </div>
          <TabsContent value="messenger" className="m-0">
            <MessengerLayout currentUser={currentUser} onLogout={handleLogout} />
          </TabsContent>
          <TabsContent value="admin" className="m-0">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <MessengerLayout currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
