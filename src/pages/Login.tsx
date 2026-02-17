import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { login } from "@/lib/api";

interface LoginProps {
  onLogin: (user: { id: number; username: string; display_name: string; avatar_color: string }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await login(username.trim().toLowerCase(), displayName.trim());
      if (data.id) {
        localStorage.setItem("user", JSON.stringify(data));
        onLogin(data);
      } else {
        setError("Ошибка входа. Попробуйте снова.");
      }
    } catch {
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="MessageCircle" size={40} className="text-[#00b4d8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Коннект</h1>
          <p className="text-white/80 text-sm">Общение без границ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Имя пользователя</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ivan_petrov"
              className="h-12 rounded-xl border-gray-200 focus:border-[#00b4d8] focus:ring-[#00b4d8]"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Отображаемое имя</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Иван Петров"
              className="h-12 rounded-xl border-gray-200 focus:border-[#00b4d8] focus:ring-[#00b4d8]"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !username.trim() || !displayName.trim()}
            className="w-full h-12 bg-[#00b4d8] hover:bg-[#0096c7] text-white rounded-xl text-base font-medium"
          >
            {loading ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              <>
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-white/60 text-xs mt-4">
          Аккаунт создастся автоматически при первом входе
        </p>
      </div>
    </div>
  );
};

export default Login;
