-- Создание таблицы логов чат-бота
CREATE TABLE IF NOT EXISTS chat_log (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    sender_type TEXT CHECK(sender_type IN ('user', 'bot')),
    request_type TEXT, -- 'price', 'contacts', 'order', 'catalog', 'consultation'
    user_name TEXT,
    user_phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заявок
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    request_type TEXT NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для ускорения запросов (опционально)
CREATE INDEX IF NOT EXISTS idx_chat_log_session_id ON chat_log(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_log_created_at ON chat_log(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);