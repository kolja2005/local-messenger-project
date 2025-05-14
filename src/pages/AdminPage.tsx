
import React from "react";
import AdminPanel from "@/components/messenger/AdminPanel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Панель администратора</h1>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline">Мессенджер</Button>
          </Link>
          <Button variant="ghost" onClick={logout}>Выйти</Button>
        </div>
      </div>
      <AdminPanel />
    </div>
  );
};

export default AdminPage;
