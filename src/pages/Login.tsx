import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { login } from "@/lib/api";

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
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
      const user = data.user;
      if (user && user.id) {
        localStorage.setItem("user", JSON.stringify(user));
        onLogin(user);
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
    <div className="min-h-screen bg-gradient-to-br from-[#00b4d8] via-[#0096c7] to-[#0077b6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/10">
            <Icon name="MessageCircle" size={40} className="text-[#00b4d8]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Коннект</h1>
          <p className="text-white/70 text-sm mt-1">Общение без границ</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
              Имя пользователя
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ivan_petrov"
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00b4d8] focus:ring-[#00b4d8]/20 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
              Отображаемое имя
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Иван Петров"
              className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00b4d8] focus:ring-[#00b4d8]/20 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2.5">
              <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !username.trim() || !displayName.trim()}
            className="w-full h-12 bg-[#00b4d8] hover:bg-[#0096c7] active:bg-[#0077b6] text-white rounded-xl text-base font-semibold shadow-md shadow-[#00b4d8]/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              "Войти"
            )}
          </Button>
        </form>

        <p className="text-center text-white/50 text-xs mt-6">
          Аккаунт создастся автоматически при первом входе
        </p>
      </div>
    </div>
  );
};

export default Login;
