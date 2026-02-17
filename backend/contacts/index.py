"""Облачная функция поиска и получения списка пользователей.

Обрабатывает поиск пользователей по имени или display_name с помощью ILIKE.
Поддерживает исключение текущего пользователя из результатов.
Таблица users: id, username, display_name, avatar_color, created_at, last_seen.
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
    """Обработчик поиска и получения списка контактов (пользователей).

    OPTIONS — CORS preflight.
    GET ?search=query — поиск пользователей по username или display_name (ILIKE).
    GET ?exclude_id=X — исключить текущего пользователя из результатов.
    Оба параметра можно комбинировать: GET ?search=query&exclude_id=X.
    Без параметра search возвращает всех пользователей (до 100).
    Возвращает: {"users": [{"id", "username", "display_name", "avatar_color"}]}
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

        if not params:
            raw_url = event.get("url", event.get("path", "/"))
            parsed = parse_qs(urlparse(raw_url).query)
            params = {k: v[0] for k, v in parsed.items()}

        search = params.get("search", "").strip()
        exclude_id = params.get("exclude_id")

        conditions = []

        if search:
            safe_search = _esc(search)
            conditions.append(
                "(username ILIKE '%{}%' OR display_name ILIKE '%{}%')".format(safe_search, safe_search)
            )

        if exclude_id:
            safe_exclude_id = int(exclude_id)
            conditions.append("id != {}".format(safe_exclude_id))

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        conn = _get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, username, display_name, avatar_color "
            "FROM users {} "
            "ORDER BY display_name ASC "
            "LIMIT 100;".format(where_clause)
        )
        rows = cur.fetchall()
        conn.close()

        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "display_name": row[2],
                "avatar_color": row[3],
            })

        return _response(200, {"users": users})

    return _response(405, {"error": "Method not allowed"})