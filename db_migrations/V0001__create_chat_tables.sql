
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) DEFAULT 'from-blue-500 to-purple-500',
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id),
    user2_id INTEGER NOT NULL REFERENCES users(id),
    last_message_text TEXT,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id),
    sender_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_chats_user1 ON chats(user1_id);
CREATE INDEX idx_chats_user2 ON chats(user2_id);
