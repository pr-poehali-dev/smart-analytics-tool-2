import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { getChats, createChat, getMessages, sendMessage } from "@/lib/api";

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface Contact {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface ChatItem {
  id: number;
  contact: Contact;
  last_message_text: string | null;
  last_message_at: string | null;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string;
  created_at: string;
}

interface ChatProps {
  user: User;
  onLogout: () => void;
}

const Chat = ({ user, onLogout }: ChatProps) => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState("");
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [newChatError, setNewChatError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = window.setInterval(() => {
        loadMessages(activeChat.id);
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await getChats(user.id);
      if (Array.isArray(data)) setChats(data);
    } catch { /* ignore */ }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const data = await getMessages(chatId, user.id);
      if (Array.isArray(data)) setMessages(data);
    } catch { /* ignore */ }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat || sending) return;
    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      await sendMessage(activeChat.id, user.id, text);
      await loadMessages(activeChat.id);
      await loadChats();
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newContactUsername.trim()) return;
    setNewChatError("");

    try {
      const data = await createChat(user.id, newContactUsername.trim().toLowerCase());
      if (data.error) {
        setNewChatError(data.error);
        return;
      }
      if (data.id) {
        setShowNewChat(false);
        setNewContactUsername("");
        await loadChats();
        setActiveChat(data);
        setShowSidebar(false);
      }
    } catch {
      setNewChatError("Не удалось создать чат");
    }
  };

  const selectChat = (chat: ChatItem) => {
    setActiveChat(chat);
    setShowSidebar(false);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 bg-[#00b4d8] flex items-center px-4 gap-3 flex-shrink-0">
        {!showSidebar && activeChat && (
          <Button variant="ghost" className="p-1 text-white hover:bg-white/20" onClick={() => setShowSidebar(true)}>
            <Icon name="ArrowLeft" size={22} />
          </Button>
        )}
        <Icon name="MessageCircle" size={24} className="text-white" />
        <h1 className="text-white font-bold text-lg flex-1">Коннект</h1>
        <span className="text-white/80 text-sm hidden sm:block">{user.display_name}</span>
        <Button variant="ghost" className="p-1 text-white hover:bg-white/20" onClick={onLogout}>
          <Icon name="LogOut" size={20} />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat list */}
        <div className={`${showSidebar ? "flex" : "hidden"} sm:flex flex-col w-full sm:w-80 border-r border-gray-200 bg-white flex-shrink-0`}>
          <div className="p-3 border-b border-gray-100 flex gap-2">
            <Button
              onClick={() => setShowNewChat(true)}
              className="flex-1 h-10 bg-[#00b4d8] hover:bg-[#0096c7] text-white rounded-xl text-sm"
            >
              <Icon name="Plus" size={16} className="mr-1" />
              Новый чат
            </Button>
          </div>

          {showNewChat && (
            <div className="p-3 border-b border-gray-100 bg-blue-50 space-y-2">
              <Input
                value={newContactUsername}
                onChange={(e) => setNewContactUsername(e.target.value)}
                placeholder="Имя пользователя контакта"
                className="h-10 rounded-xl text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
                autoFocus
              />
              {newChatError && <p className="text-red-500 text-xs">{newChatError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleCreateChat} size="sm" className="bg-[#00b4d8] hover:bg-[#0096c7] text-white rounded-lg flex-1">
                  Найти
                </Button>
                <Button onClick={() => { setShowNewChat(false); setNewChatError(""); }} size="sm" variant="outline" className="rounded-lg">
                  Отмена
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <Icon name="MessageSquare" size={48} className="mb-3 text-gray-300" />
                <p className="text-sm text-center">Нет чатов</p>
                <p className="text-xs text-center mt-1">Нажмите «Новый чат» чтобы начать</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeChat?.id === chat.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${chat.contact.avatar_color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-lg">{getInitial(chat.contact.display_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900 text-sm truncate">{chat.contact.display_name}</span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(chat.last_message_at)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{chat.last_message_text || "Нет сообщений"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${!showSidebar || activeChat ? "flex" : "hidden"} sm:flex flex-col flex-1 bg-[#e5f6fb]`}>
          {activeChat ? (
            <>
              <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${activeChat.contact.avatar_color} flex items-center justify-center`}>
                  <span className="text-white font-bold">{getInitial(activeChat.contact.display_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{activeChat.contact.display_name}</div>
                  <div className="text-xs text-gray-400">@{activeChat.contact.username}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isMine
                            ? "bg-[#00b4d8] text-white rounded-br-md"
                            : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-gray-400"} text-right`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 h-11 rounded-full border-gray-200 px-4"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 rounded-full bg-[#00b4d8] hover:bg-[#0096c7] p-0"
                >
                  <Icon name="Send" size={18} className="text-white" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
              <div className="w-24 h-24 bg-[#00b4d8]/10 rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={48} className="text-[#00b4d8]/50" />
              </div>
              <p className="text-lg font-medium text-gray-500">Выберите чат</p>
              <p className="text-sm mt-1">или создайте новый</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
