
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-6 bg-muted">
            <Icon name="FileQuestion" className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Страница не найдена
        </p>
        <p className="text-muted-foreground mb-8">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link to="/">
          <Button>
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
