"""Облачная функция управления сообщениями в чате.

Обрабатывает получение сообщений чата и отправку новых сообщений.
Таблица messages: id, chat_id, sender_id, text, file_url, file_name, file_type, created_at.
При отправке сообщения обновляет last_message_text и last_message_at в таблице chats.
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


def handler(event: dict, context) -> dict:
    """Обработчик управления сообщениями.

    OPTIONS — CORS preflight.
    GET ?chat_id=X&limit=50&offset=0 — получить сообщения чата, отсортированные от новых к старым.
    POST {"chat_id": X, "sender_id": Y, "text": "..."} — отправить сообщение в чат.
    При отправке также обновляется last_message_text и last_message_at в таблице chats.
    Возвращает JSON со списком сообщений или данными нового сообщения.
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
        params = event.get("queryStringParameters") or {}
        chat_id = params.get("chat_id")

        if not chat_id:
            raw_url = event.get("url", event.get("path", "/"))
            parsed = parse_qs(urlparse(raw_url).query)
            chat_id = parsed.get("chat_id", [None])[0]
            if not params.get("limit"):
                params = {**params}
                params["limit"] = parsed.get("limit", ["50"])[0]
                params["offset"] = parsed.get("offset", ["0"])[0]

        if not chat_id:
            return _response(400, {"error": "chat_id is required"})

        safe_chat_id = int(chat_id)
        limit = int(params.get("limit", "50"))
        offset = int(params.get("offset", "0"))

        if limit > 200:
            limit = 200

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT m.id, m.chat_id, m.sender_id, m.text, m.file_url, m.file_name, m.file_type, m.created_at, "
            "u.username, u.display_name, u.avatar_color "
            "FROM messages m "
            "JOIN users u ON u.id = m.sender_id "
            "WHERE m.chat_id = {} "
            "ORDER BY m.created_at DESC "
            "LIMIT {} OFFSET {};".format(safe_chat_id, limit, offset)
        )
        rows = cur.fetchall()
        conn.close()

        messages = []
        for row in rows:
            messages.append({
                "id": row[0],
                "chat_id": row[1],
                "sender_id": row[2],
                "text": row[3],
                "file_url": row[4],
                "file_name": row[5],
                "file_type": row[6],
                "created_at": str(row[7]) if row[7] else None,
                "sender": {
                    "username": row[8],
                    "display_name": row[9],
                    "avatar_color": row[10],
                },
            })

        return _response(200, {"messages": messages})

    if method == "POST":
        body = json.loads(event.get("body", "{}"))
        chat_id = body.get("chat_id")
        sender_id = body.get("sender_id")
        text = body.get("text", "").strip()
        file_url = body.get("file_url")
        file_name = body.get("file_name")
        file_type = body.get("file_type")

        if not chat_id or not sender_id:
            return _response(400, {"error": "chat_id and sender_id are required"})

        if not text and not file_url:
            return _response(400, {"error": "text or file_url is required"})

        safe_chat_id = int(chat_id)
        safe_sender_id = int(sender_id)
        safe_text = _esc(text) if text else None
        safe_file_url = _esc(file_url) if file_url else None
        safe_file_name = _esc(file_name) if file_name else None
        safe_file_type = _esc(file_type) if file_type else None

        text_sql = "'{}'".format(safe_text) if safe_text else "NULL"
        file_url_sql = "'{}'".format(safe_file_url) if safe_file_url else "NULL"
        file_name_sql = "'{}'".format(safe_file_name) if safe_file_name else "NULL"
        file_type_sql = "'{}'".format(safe_file_type) if safe_file_type else "NULL"

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO messages (chat_id, sender_id, text, file_url, file_name, file_type) "
            "VALUES ({}, {}, {}, {}, {}, {}) "
            "RETURNING id, chat_id, sender_id, text, file_url, file_name, file_type, created_at;".format(
                safe_chat_id, safe_sender_id, text_sql, file_url_sql, file_name_sql, file_type_sql
            )
        )
        row = cur.fetchone()

        last_msg_text = _esc(text) if text else _esc(file_name or "File")
        cur.execute(
            "UPDATE chats SET last_message_text = '{}', last_message_at = NOW() WHERE id = {};".format(
                last_msg_text, safe_chat_id
            )
        )

        conn.commit()

        cur.execute(
            "SELECT username, display_name, avatar_color FROM users WHERE id = {};".format(safe_sender_id)
        )
        sender_row = cur.fetchone()
        conn.close()

        message = {
            "id": row[0],
            "chat_id": row[1],
            "sender_id": row[2],
            "text": row[3],
            "file_url": row[4],
            "file_name": row[5],
            "file_type": row[6],
            "created_at": str(row[7]) if row[7] else None,
            "sender": {
                "username": sender_row[0] if sender_row else None,
                "display_name": sender_row[1] if sender_row else None,
                "avatar_color": sender_row[2] if sender_row else None,
            },
        }

        return _response(201, {"message": message})

    return _response(405, {"error": "Method not allowed"})