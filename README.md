Структура проекта:
eco-kom/
├── backend/                 # Python Flask сервер
│   ├── app.py             # Основное приложение
│   └── requirements.txt   # Зависимости Python
├── database/
│   └── schema.sql         # Структура базы данных
├── frontend/              # Файлы фронтенда
└── README.md             # Эта документация

Как запустить: скачать pythom, postgresql (Запомнить пароль, который указывали при установке!).
В cmd: 
git clone https://github.com/larettiee/eco-kom.git
cd eco-kom

Запустить pgAdmin, создать свой сервер, в нем свою бд. (Правой кнопкой databases - create - database). 
Name: eco_kom_db, Owner: postgres. На свою бд правой кнопкой мыши - query tool - иконка открытия файла - database/schema.sql.

Установка python зависимостей для бэка(в cmd): cd backend. Установка зависимостей:
python -m ensurepip --upgrade
pip install -r requirements.txt
Если ошибки, попробуйте:
pip install flask flask-cors psycopg2-binary python-dotenv

Запуск сервера для работы с бд:
Убедитесь, что вы в папке backend/ в cmd:
python app.py

Ожидаемый вывод:
==================================================
ECO-KOM Chatbot API запущен!
Сервер: http://0.0.0.0:5000
Проверка: http://localhost:5000/api/health
Режим отладки: True
==================================================
 * Serving Flask app 'app'
 * Debug mode: on

В браузере по адресу  http://localhost:5000 должна быть страница с API



