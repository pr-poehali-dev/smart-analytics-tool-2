import urls from "../../backend/func2url.json";

const API_URLS: Record<string, string> = urls;

function getUrl(fn: string): string {
  const url = API_URLS[fn];
  if (!url) throw new Error("Unknown function: " + fn);
  return url;
}

export async function login(username: string, displayName: string) {
  const res = await fetch(getUrl("auth"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, display_name: displayName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function getChats(userId: number) {
  const res = await fetch(getUrl("chats") + "?user_id=" + userId);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load chats");
  return data;
}

export async function createChat(userId: number, otherUserId: number) {
  const res = await fetch(getUrl("chats"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, other_user_id: otherUserId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create chat");
  return data;
}

export async function getMessages(chatId: number, limit = 50, offset = 0) {
  const res = await fetch(
    getUrl("messages") + "?chat_id=" + chatId + "&limit=" + limit + "&offset=" + offset
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load messages");
  return data;
}

export async function sendMessage(chatId: number, senderId: number, text: string) {
  const res = await fetch(getUrl("messages"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, sender_id: senderId, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
}

export async function searchContacts(query: string, excludeId?: number) {
  let url = getUrl("contacts") + "?search=" + encodeURIComponent(query);
  if (excludeId) url += "&exclude_id=" + excludeId;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to search contacts");
  return data;
}

export default { login, getChats, createChat, getMessages, sendMessage, searchContacts };
