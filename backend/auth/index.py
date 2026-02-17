"""Облачная функция аутентификации пользователей (v3).

Обрабатывает регистрацию и вход по имени пользователя.
Если пользователь существует — возвращает его, иначе создаёт нового.
Таблица users: id, username, display_name, avatar_color, created_at, last_seen.
"""

import json
import os
import random

import psycopg2

AVATAR_COLORS = [
    "from-purple-500 to-pink-500",
    "from-green-500 to-blue-500",
    "from-blue-500 to-purple-500",
    "from-orange-500 to-red-500",
    "from-teal-500 to-cyan-500",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
    "Access-Control-Max-Age": "86400",
}


def _esc(value):
    """Экранирование одинарных кавычек для SQL."""
    if value is None:
        return "NULL"
    return str(value).replace("'", "''")


def _get_connection():
    """Получить соединение с базой данных."""
    return psycopg2.connect(os.environ["DATABASE_URL"])


def _response(status_code, body):
    """Сформировать ответ с CORS-заголовками."""
    return {
        "statusCode": status_code,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def _user_to_dict(row):
    """Преобразовать строку из БД в словарь пользователя."""
    return {
        "id": row[0],
        "username": row[1],
        "display_name": row[2],
        "avatar_color": row[3],
    }


def handler(event: dict, context) -> dict:
    """Обработчик аутентификации пользователей.

    OPTIONS — CORS preflight.
    POST {"username": "...", "display_name": "..."} — регистрация или вход.
    Если пользователь с таким username уже есть — возвращает его.
    Если нет — создаёт нового с случайным цветом аватара.
    Возвращает: {"user": {"id", "username", "display_name", "avatar_color"}}
    """
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    method = event.get("httpMethod", "GET")

    if method == "POST":
        body = json.loads(event.get("body", "{}"))
        username = body.get("username", "").strip()
        display_name = body.get("display_name", "").strip()

        if not username:
            return _response(400, {"error": "username is required"})
        if not display_name:
            return _response(400, {"error": "display_name is required"})

        safe_username = _esc(username)
        safe_display_name = _esc(display_name)

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, username, display_name, avatar_color "
            "FROM users WHERE username = '{}';".format(safe_username)
        )
        row = cur.fetchone()

        if row:
            cur.execute("UPDATE users SET last_seen = NOW() WHERE id = {};".format(row[0]))
            conn.commit()
            conn.close()
            return _response(200, {"user": _user_to_dict(row)})

        avatar_color = random.choice(AVATAR_COLORS)
        safe_color = _esc(avatar_color)

        cur.execute(
            "INSERT INTO users (username, display_name, avatar_color) "
            "VALUES ('{}', '{}', '{}') "
            "RETURNING id, username, display_name, avatar_color;".format(
                safe_username, safe_display_name, safe_color
            )
        )
        new_row = cur.fetchone()
        conn.commit()
        conn.close()

        return _response(201, {"user": _user_to_dict(new_row)})

    return _response(405, {"error": "Method not allowed"})