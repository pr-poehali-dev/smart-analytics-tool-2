"""Облачная функция управления чатами (v2).

Обрабатывает получение списка чатов пользователя и создание новых чатов.
Таблица chats: id, user1_id, user2_id, last_message_text, last_message_at, created_at.
Связана с таблицей users для получения информации о собеседнике.
"""

import json
import os
from urllib.parse import parse_qs, urlparse

import psycopg2


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
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def _get_param(event, name):
    """Извлечь GET-параметр из queryStringParameters или из URL/path."""
    params = event.get("queryStringParameters") or {}
    value = params.get(name)
    if not value:
        raw_url = event.get("url", event.get("path", "/"))
        parsed = parse_qs(urlparse(raw_url).query)
        value = parsed.get(name, [None])[0]
    return value


def handler(event: dict, context) -> dict:
    """Обработчик управления чатами.

    OPTIONS — CORS preflight.
    GET ?user_id=X — получить список всех чатов пользователя с информацией о собеседнике и последнем сообщении.
    POST {"user_id": X, "other_user_id": Y} — создать новый чат или вернуть существующий между двумя пользователями.
    Возвращает JSON со списком чатов или данными одного чата.
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

    if method == "GET":
        user_id = _get_param(event, "user_id")

        if not user_id:
            return _response(400, {"error": "user_id is required"})

        safe_user_id = int(user_id)

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT c.id, c.user1_id, c.user2_id, c.last_message_text, c.last_message_at, c.created_at, "
            "u.id, u.username, u.display_name, u.avatar_color "
            "FROM chats c "
            "JOIN users u ON u.id = CASE WHEN c.user1_id = {} THEN c.user2_id ELSE c.user1_id END "
            "WHERE c.user1_id = {} OR c.user2_id = {} "
            "ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC;".format(
                safe_user_id, safe_user_id, safe_user_id
            )
        )
        rows = cur.fetchall()
        conn.close()

        chats = []
        for row in rows:
            chats.append({
                "id": row[0],
                "user1_id": row[1],
                "user2_id": row[2],
                "last_message_text": row[3],
                "last_message_at": str(row[4]) if row[4] else None,
                "created_at": str(row[5]) if row[5] else None,
                "other_user": {
                    "id": row[6],
                    "username": row[7],
                    "display_name": row[8],
                    "avatar_color": row[9],
                },
            })

        return _response(200, {"chats": chats})

    if method == "POST":
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("user_id")
        other_user_id = body.get("other_user_id")

        if not user_id or not other_user_id:
            return _response(400, {"error": "user_id and other_user_id are required"})

        safe_user_id = int(user_id)
        safe_other_id = int(other_user_id)

        if safe_user_id == safe_other_id:
            return _response(400, {"error": "Cannot create chat with yourself"})

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, user1_id, user2_id, last_message_text, last_message_at, created_at "
            "FROM chats "
            "WHERE (user1_id = {} AND user2_id = {}) OR (user1_id = {} AND user2_id = {});".format(
                safe_user_id, safe_other_id, safe_other_id, safe_user_id
            )
        )
        row = cur.fetchone()

        if row:
            conn.close()
            return _response(200, {
                "chat": {
                    "id": row[0],
                    "user1_id": row[1],
                    "user2_id": row[2],
                    "last_message_text": row[3],
                    "last_message_at": str(row[4]) if row[4] else None,
                    "created_at": str(row[5]) if row[5] else None,
                },
            })

        cur.execute(
            "INSERT INTO chats (user1_id, user2_id) "
            "VALUES ({}, {}) "
            "RETURNING id, user1_id, user2_id, last_message_text, last_message_at, created_at;".format(
                safe_user_id, safe_other_id
            )
        )
        new_row = cur.fetchone()
        conn.commit()
        conn.close()

        return _response(201, {
            "chat": {
                "id": new_row[0],
                "user1_id": new_row[1],
                "user2_id": new_row[2],
                "last_message_text": new_row[3],
                "last_message_at": str(new_row[4]) if new_row[4] else None,
                "created_at": str(new_row[5]) if new_row[5] else None,
            },
        })

    return _response(405, {"error": "Method not allowed"})