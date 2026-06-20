from datetime import datetime, timezone
from typing import Any, Optional

import httpx

from app.config import Settings


class SupabaseError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _write_headers(settings: Settings, prefer: str = "return=representation") -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }


def _read_headers(settings: Settings) -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def upsert_user(settings: Settings, row: dict[str, Any]) -> dict[str, Any]:
    row["last_login_at"] = _now_iso()
    url = f"{settings.supabase_url}/rest/v1/users"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            params={"on_conflict": "email"},
            headers=_write_headers(settings, "resolution=merge-duplicates,return=representation"),
            json=row,
        )

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    data = response.json()
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise SupabaseError(502, "Could not save user to database.")


async def get_user_by_id(settings: Settings, user_id: str) -> Optional[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/users"
    params = {
        "id": f"eq.{user_id}",
        "select": "*",
        "limit": "1",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    rows = response.json()
    return rows[0] if rows else None


async def get_user_by_email(settings: Settings, email: str) -> Optional[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/users"
    params = {
        "email": f"eq.{email.lower()}",
        "select": "*",
        "limit": "1",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    rows = response.json()
    return rows[0] if rows else None


async def get_user_by_username(settings: Settings, username: str) -> Optional[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/users"
    params = {
        "username": f"eq.{username.lower()}",
        "select": "*",
        "limit": "1",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    rows = response.json()
    return rows[0] if rows else None


async def get_user_by_email_or_username(
    settings: Settings,
    identifier: str,
) -> Optional[dict[str, Any]]:
    if "@" in identifier:
        return await get_user_by_email(settings, identifier)
    return await get_user_by_username(settings, identifier)


async def create_email_user(
    settings: Settings,
    email: str,
    username: str,
    name: str,
    password_hash: str,
) -> dict[str, Any]:
    row = {
        "email": email.lower(),
        "username": username.lower(),
        "name": name,
        "auth_provider": "email",
        "password_hash": password_hash,
        "last_login_at": _now_iso(),
    }
    url = f"{settings.supabase_url}/rest/v1/users"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=_write_headers(settings),
            json=row,
        )

    if response.status_code == 409:
        raise SupabaseError(409, "An account with this email or username already exists.")

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    data = response.json()
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise SupabaseError(502, "Could not create user.")


async def touch_last_login(settings: Settings, user_id: str) -> None:
    url = f"{settings.supabase_url}/rest/v1/users"
    params = {"id": f"eq.{user_id}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        await client.patch(
            url,
            params=params,
            headers=_write_headers(settings, "return=minimal"),
            json={"last_login_at": _now_iso()},
        )


async def get_chat_messages(
    settings: Settings,
    user_id: str,
    limit: int = 80,
) -> list[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/chat_messages"
    params = {
        "user_id": f"eq.{user_id}",
        "select": "role,content,created_at",
        "order": "created_at.asc",
        "limit": str(limit),
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    return response.json()


async def save_chat_message(
    settings: Settings,
    user_id: str,
    role: str,
    content: str,
) -> None:
    url = f"{settings.supabase_url}/rest/v1/chat_messages"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=_write_headers(settings, "return=minimal"),
            json={
                "user_id": user_id,
                "role": role,
                "content": content,
            },
        )

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)


def usage_from_record(record: dict[str, Any], default_limit: int) -> dict[str, int]:
    limit = int(record.get("llm_call_limit") or default_limit)
    used = int(record.get("llm_calls_used") or 0)
    return {
        "calls_used": used,
        "calls_limit": limit,
        "calls_remaining": max(0, limit - used),
    }


async def ensure_can_call_llm(
    settings: Settings,
    user_id: str,
) -> dict[str, int]:
    record = await get_user_by_id(settings, user_id)
    if not record:
        raise SupabaseError(404, "User not found.")

    usage = usage_from_record(record, settings.free_llm_call_limit)
    if usage["calls_remaining"] <= 0:
        raise SupabaseError(
            429,
            f"Free plan limit reached ({usage['calls_limit']} messages).",
        )
    return usage


async def increment_llm_calls(settings: Settings, user_id: str) -> dict[str, int]:
    record = await get_user_by_id(settings, user_id)
    if not record:
        raise SupabaseError(404, "User not found.")

    used = int(record.get("llm_calls_used") or 0) + 1
    limit = int(record.get("llm_call_limit") or settings.free_llm_call_limit)

    url = f"{settings.supabase_url}/rest/v1/users"
    params = {"id": f"eq.{user_id}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            url,
            params=params,
            headers=_write_headers(settings, "return=representation"),
            json={"llm_calls_used": used},
        )

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    return {
        "calls_used": used,
        "calls_limit": limit,
        "calls_remaining": max(0, limit - used),
    }


def user_record_to_token_payload(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "sub": record["id"],
        "email": record["email"],
        "name": record.get("name") or record["email"].split("@")[0],
        "picture": record.get("picture"),
        "username": record.get("username"),
    }


def user_record_to_response(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": record["id"],
        "email": record["email"],
        "name": record.get("name") or record["email"].split("@")[0],
        "picture": record.get("picture"),
        "username": record.get("username"),
    }


async def save_trip_plan(
    settings: Settings,
    row: dict[str, Any],
) -> dict[str, Any]:
    row["updated_at"] = _now_iso()
    url = f"{settings.supabase_url}/rest/v1/trip_plans"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=_write_headers(settings),
            json=row,
        )

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    data = response.json()
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise SupabaseError(502, "Could not save trip plan.")


async def get_trip_plan_by_token(
    settings: Settings,
    share_token: str,
) -> Optional[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/trip_plans"
    params = {
        "share_token": f"eq.{share_token}",
        "select": "*",
        "limit": "1",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    rows = response.json()
    return rows[0] if rows else None


async def get_latest_trip_plan_for_user(
    settings: Settings,
    user_id: str,
) -> Optional[dict[str, Any]]:
    url = f"{settings.supabase_url}/rest/v1/trip_plans"
    params = {
        "user_id": f"eq.{user_id}",
        "select": "*",
        "order": "updated_at.desc",
        "limit": "1",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params, headers=_read_headers(settings))

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    rows = response.json()
    return rows[0] if rows else None


async def update_trip_plan(
    settings: Settings,
    plan_id: str,
    row: dict[str, Any],
) -> dict[str, Any]:
    row["updated_at"] = _now_iso()
    url = f"{settings.supabase_url}/rest/v1/trip_plans"
    params = {"id": f"eq.{plan_id}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            url,
            params=params,
            headers=_write_headers(settings),
            json=row,
        )

    if response.status_code >= 400:
        raise SupabaseError(response.status_code, response.text)

    data = response.json()
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise SupabaseError(502, "Could not update trip plan.")
