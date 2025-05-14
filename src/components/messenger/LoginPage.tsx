
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем, куда перенаправить пользователя после входа
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите имя пользователя и пароль",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const user = await login(username, password);
      
      // Перенаправляем на целевую страницу или на страницу администратора для админов
      if (user.is_admin) {
        navigate("/admin");
      } else {
        navigate(from);
      }
      
      toast({
        title: "Успешный вход",
        description: `Добро пожаловать, ${user.display_name}!`,
      });
    } catch (error) {
      console.error('Ошибка входа:', error);
      // Сообщение об ошибке уже отображается в AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Icon name="MessageSquare" className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold">ЛокалЧат</CardTitle>
          <CardDescription className="text-center">
            Локальный мессенджер для вашей организации
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <div className="relative">
                  <Icon name="User" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Ваше имя пользователя"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ваш пароль"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Вход...
                  </span>
                ) : (
                  "Войти"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            * Для демо-версии используйте: admin / password
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
