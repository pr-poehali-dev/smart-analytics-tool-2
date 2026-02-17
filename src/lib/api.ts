import urls from "../../backend/func2url.json";

const API = {
  auth: urls.auth,
  chats: urls.chats,
  messages: urls.messages,
};

export async function login(username: string, displayName: string) {
  const res = await fetch(API.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, display_name: displayName }),
  });
  return res.json();
}

export async function getChats(userId: number) {
  const res = await fetch(`${API.chats}/?user_id=${userId}`);
  return res.json();
}

export async function createChat(userId: number, contactUsername: string) {
  const res = await fetch(API.chats, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, contact_username: contactUsername }),
  });
  return res.json();
}

export async function getMessages(chatId: number, userId: number) {
  const res = await fetch(`${API.messages}/?chat_id=${chatId}&user_id=${userId}`);
  return res.json();
}

export async function sendMessage(chatId: number, senderId: number, text: string) {
  const res = await fetch(API.messages, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, sender_id: senderId, text }),
  });
  return res.json();
}

export default API;
