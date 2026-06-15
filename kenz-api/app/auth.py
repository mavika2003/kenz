from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt

from app.config import Settings


class AuthError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def create_access_token(user: dict[str, Any], settings: Settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["sub"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "username": user.get("username"),
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_expire_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str, settings: Settings) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise AuthError(401, "Session expired. Please sign in again.") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError(401, "Invalid session. Please sign in again.") from exc


def user_from_payload(payload: dict[str, Any]) -> dict[str, Optional[str]]:
    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "picture": payload.get("picture"),
        "username": payload.get("username"),
    }
