from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Разрешаем запросы с вашего сайта

# Настройки PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "eco_kom_db",
    "user": "postgres",
    "password": " ", #ВВЕДИТЕ ПАРОЛЬ ОТ СВОЕЙ БД
    "port": "5432"
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.route('/api/chat/log', methods=['POST'])
def log_chat_message():
    """Сохраняем сообщение из чат-бота"""
    try:
        data = request.json
        message_text = data.get('message_text', '')
        sender_type = data.get('sender_type', 'user')
        session_id = data.get('session_id', 'unknown')

        # Автоматически определяем тип запроса
        request_type = None

        text_lower = message_text.lower()

        # Определяем тип запроса
        if any(word in text_lower for word in ['цена', 'стоимость', 'прайс', 'сколько стоит']):
            request_type = 'price'
        elif any(word in text_lower for word in ['контакт', 'телефон', 'позвонить', 'связаться']):
            request_type = 'contacts'
        elif any(word in text_lower for word in ['заказ', 'купить', 'приобрести']):
            request_type = 'order'
        elif any(word in text_lower for word in ['каталог', 'скачать', 'pdf']):
            request_type = 'catalog'
        elif any(word in text_lower for word in ['консульт', 'помощь', 'подобрать']):
            request_type = 'consultation'


        # Сохраняем в БД
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO chat_log 
            (session_id, message_text, sender_type, request_type,
             user_name, user_phone, user_email)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            session_id,
            message_text[:1000],
            sender_type,
            request_type,
            data.get('user_name'),
            data.get('user_phone'),
            data.get('user_email')
        ))

        log_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        print(f"[{datetime.now()}] Лог #{log_id}: {sender_type} - {request_type}")

        return jsonify({
            "success": True,
            "log_id": log_id,
            "classified": {
                "request_type": request_type,
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/requests/create', methods=['POST'])
def create_request():
    """Создание заявки из формы"""
    try:
        data = request.json

        # Проверяем обязательные поля
        if not data.get('name') or not data.get('phone') or not data.get('email'):
            return jsonify({"error": "Заполните все поля"}), 400

        # Сохраняем в БД
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO requests 
            (client_name, phone, email, message, request_type, session_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['name'][:100],
            data['phone'][:20],
            data.get('email', '')[:100],
            data.get('message', '')[:500],
            data.get('request_type', 'callback'),
            data.get('session_id')
        ))

        request_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        print(f"[{datetime.now()}] Новая заявка #{request_id}: {data['name']} - {data['phone']}")

        return jsonify({
            "success": True,
            "request_id": request_id,
            "message": f"Заявка #{request_id} принята"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работы сервера и БД"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()

        return jsonify({
            "status": "healthy",
            "service": "ECO-KOM API",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


# Главная страница
@app.route('/')
def home():
    return """
    <h1>ECO-KOM API работает! </h1>
    <p>Доступные эндпоинты:</p>
    <ul>
        <li>POST /api/chat/log - логирование сообщений чата</li>
        <li>POST /api/requests/create - создание заявки</li>
        <li>GET /health - проверка работы</li>
    </ul>
    <p>Для проверки отправьте POST запрос на /api/chat/log с JSON:</p>
    <pre>{"message_text": "тест", "sender_type": "user", "session_id": "test"}</pre>
    """


if __name__ == '__main__':
    print("=" * 50)
    print("ECO-KOM API запущен!")
    print(f"http://localhost:5000")
    print(f"API: http://localhost:5000/api/chat/log")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)