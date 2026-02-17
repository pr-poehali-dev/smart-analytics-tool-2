import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {user ? <Chat user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </TooltipProvider>
  );
};

export default App;
