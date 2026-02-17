import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  searchContacts,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface OtherUser {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface ChatItem {
  id: number;
  user1_id: number;
  user2_id: number;
  other_user: OtherUser;
  last_message_text: string | null;
  last_message_at: string | null;
}

interface MessageItem {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string | null;
  sender: {
    username: string;
    display_name: string;
    avatar_color: string;
  };
}

interface ContactItem {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface ChatProps {
  user: User;
  onLogout: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "?");

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const formatMsgTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Chat = ({ user, onLogout }: ChatProps) => {
  // Chat list
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);

  // Messages
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // UI state
  const [view, setView] = useState<"list" | "chat" | "newchat">("list");
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearch, setChatSearch] = useState("");

  // New chat / contacts
  const [contactQuery, setContactQuery] = useState("");
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);
  const chatPollRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Load chats ---- */
  const loadChats = useCallback(async () => {
    try {
      const data = await getChats(user.id);
      if (data.chats) setChats(data.chats);
    } catch {
      /* silent */
    }
  }, [user.id]);

  useEffect(() => {
    loadChats();
    chatPollRef.current = window.setInterval(loadChats, 5000);
    return () => {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
    };
  }, [loadChats]);

  /* ---- Load messages ---- */
  const loadMessages = useCallback(async (chatId: number) => {
    try {
      const data = await getMessages(chatId);
      if (data.messages) {
        setMessages(data.messages.slice().reverse());
      }
    } catch {
      /* silent */
    }
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
  }, [activeChat?.id, loadMessages]);

  /* ---- Auto-scroll ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---- Contact search ---- */
  useEffect(() => {
    if (view !== "newchat") return;
    const timer = setTimeout(async () => {
      setContactsLoading(true);
      try {
        const data = await searchContacts(contactQuery, user.id);
        if (data.users) setContacts(data.users);
      } catch {
        /* silent */
      } finally {
        setContactsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [contactQuery, view, user.id]);

  /* ---- Actions ---- */
  const selectChat = (chat: ChatItem) => {
    setActiveChat(chat);
    setView("chat");
    setShowSearch(false);
    setChatSearch("");
  };

  const goBack = () => {
    setView("list");
    setActiveChat(null);
    setMessages([]);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const openNewChat = () => {
    setView("newchat");
    setContactQuery("");
    setContacts([]);
  };

  const handleSelectContact = async (contact: ContactItem) => {
    try {
      const data = await createChat(user.id, contact.id);
      if (data.chat) {
        await loadChats();
        const chatItem: ChatItem = {
          id: data.chat.id,
          user1_id: data.chat.user1_id,
          user2_id: data.chat.user2_id,
          other_user: contact,
          last_message_text: data.chat.last_message_text,
          last_message_at: data.chat.last_message_at,
        };
        setActiveChat(chatItem);
        setView("chat");
      }
    } catch {
      /* silent */
    }
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
    } catch {
      /* silent */
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---- Filtered chats ---- */
  const filteredChats = chatSearch
    ? chats.filter(
        (c) =>
          c.other_user.display_name.toLowerCase().includes(chatSearch.toLowerCase()) ||
          c.other_user.username.toLowerCase().includes(chatSearch.toLowerCase())
      )
    : chats;

  /* ================================================================ */
  /*  RENDER: New Chat (contact search) view                          */
  /* ================================================================ */

  if (view === "newchat") {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center px-3 gap-2 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setView("list")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="ArrowLeft" size={22} className="text-gray-700" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 flex-1">Новый чат</h2>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="h-10 pl-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00b4d8] text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {contactsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Icon name="Loader2" size={24} className="text-[#00b4d8] animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6">
              <Icon name="Users" size={40} className="mb-3 text-gray-300" />
              <p className="text-sm text-center">
                {contactQuery ? "Никого не найдено" : "Введите имя для поиска"}
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${contact.avatar_color} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-semibold text-base">
                    {getInitial(contact.display_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {contact.display_name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">@{contact.username}</div>
                </div>
                <Icon name="MessageCircle" size={18} className="text-[#00b4d8] flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER: Chat conversation view (mobile)                         */
  /* ================================================================ */

  if (view === "chat" && activeChat) {
    return (
      <div className="h-screen flex flex-col bg-white sm:hidden">
        {/* Chat header */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center px-2 gap-2 flex-shrink-0 shadow-sm">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="ArrowLeft" size={22} className="text-gray-700" />
          </button>
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeChat.other_user.avatar_color} flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white font-semibold text-sm">
              {getInitial(activeChat.other_user.display_name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {activeChat.other_user.display_name}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              @{activeChat.other_user.username}
            </div>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Icon name="Phone" size={18} className="text-[#00b4d8]" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Icon name="Video" size={18} className="text-[#00b4d8]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-[#f0f4f8] px-3 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Icon name="MessageSquare" size={36} className="mb-2 text-gray-300" />
              <p className="text-sm">Нет сообщений</p>
              <p className="text-xs mt-0.5">Начните диалог!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 ${
                        isMine
                          ? "bg-[#00b4d8] text-white rounded-2xl rounded-br-md"
                          : "bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 text-right ${
                          isMine ? "text-white/60" : "text-gray-400"
                        }`}
                      >
                        {formatMsgTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение..."
            className="flex-1 h-10 rounded-full border-gray-200 bg-gray-50 px-4 text-sm focus:border-[#00b4d8]"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#00b4d8] hover:bg-[#0096c7] active:bg-[#0077b6] flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Icon name="Send" size={18} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER: Desktop layout (sidebar + chat area)                     */
  /* ================================================================ */

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ---- Desktop: Two-panel layout ---- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============ LEFT PANEL (chat list) ============ */}
        <div
          className={`${
            view === "list" ? "flex" : "hidden"
          } sm:flex flex-col w-full sm:w-80 sm:min-w-[320px] border-r border-gray-100 bg-white flex-shrink-0`}
        >
          {/* Left header */}
          <div className="h-14 bg-white flex items-center px-4 gap-2 border-b border-gray-100 flex-shrink-0 shadow-sm">
            <div className="w-8 h-8 bg-[#00b4d8] rounded-lg flex items-center justify-center">
              <Icon name="MessageCircle" size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 flex-1">Коннект</h1>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setChatSearch("");
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon
                name={showSearch ? "X" : "Search"}
                size={20}
                className="text-gray-500"
              />
            </button>
            <button
              onClick={openNewChat}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon name="SquarePen" size={20} className="text-gray-500" />
            </button>
            <button
              onClick={onLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon name="LogOut" size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Поиск чатов..."
                  className="h-9 pl-9 rounded-lg border-gray-200 bg-gray-50 text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Icon name="MessageSquare" size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {chatSearch ? "Ничего не найдено" : "Нет чатов"}
                </p>
                {!chatSearch && (
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Нажмите на иконку карандаша, чтобы начать
                  </p>
                )}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    activeChat?.id === chat.id
                      ? "bg-[#00b4d8]/8 border-r-2 border-[#00b4d8]"
                      : "hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${chat.other_user.avatar_color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-lg">
                      {getInitial(chat.other_user.display_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-gray-900 text-[15px] truncate">
                        {chat.other_user.display_name}
                      </span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {formatTime(chat.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {chat.last_message_text || "Нет сообщений"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ============ RIGHT PANEL (conversation) ============ */}
        <div className="hidden sm:flex flex-col flex-1 bg-[#f0f4f8]">
          {activeChat ? (
            <>
              {/* Right header */}
              <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeChat.other_user.avatar_color} flex items-center justify-center`}
                >
                  <span className="text-white font-semibold">
                    {getInitial(activeChat.other_user.display_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {activeChat.other_user.display_name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    @{activeChat.other_user.username}
                  </div>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <Icon name="Phone" size={18} className="text-[#00b4d8]" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <Icon name="Video" size={18} className="text-[#00b4d8]" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <Icon name="MoreVertical" size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Icon name="MessageSquare" size={40} className="mb-2 text-gray-300" />
                    <p className="text-sm">Нет сообщений</p>
                    <p className="text-xs mt-0.5">Отправьте первое сообщение!</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-3xl mx-auto">
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[65%] px-3.5 py-2 ${
                              isMine
                                ? "bg-[#00b4d8] text-white rounded-2xl rounded-br-md"
                                : "bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                            <p
                              className={`text-[10px] mt-0.5 text-right ${
                                isMine ? "text-white/60" : "text-gray-400"
                              }`}
                            >
                              {formatMsgTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3 max-w-3xl mx-auto w-full">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Введите сообщение..."
                  className="flex-1 h-11 rounded-full border-gray-200 bg-gray-50 px-5 text-sm focus:border-[#00b4d8]"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 rounded-full bg-[#00b4d8] hover:bg-[#0096c7] active:bg-[#0077b6] flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0 shadow-md shadow-[#00b4d8]/20"
                >
                  <Icon name="Send" size={18} className="text-white ml-0.5" />
                </button>
              </div>
            </>
          ) : (
            /* No chat selected placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 bg-[#00b4d8]/10 rounded-full flex items-center justify-center mb-5">
                <Icon name="MessageCircle" size={44} className="text-[#00b4d8]/40" />
              </div>
              <p className="text-lg font-medium text-gray-500">Выберите чат</p>
              <p className="text-sm text-gray-400 mt-1">
                или создайте новый, нажав на иконку карандаша
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
