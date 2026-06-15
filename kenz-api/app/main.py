import httpx
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth import (
    AuthError,
    create_access_token,
    decode_access_token,
    user_from_payload,
)
from app.config import (
    DEFAULT_SYSTEM_PROMPT,
    AuthResponse,
    ChatHistoryResponse,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    get_settings,
)
from app.llm_client import LLMError, chat_completion
from app.passwords import hash_password, verify_password
from app.supabase_client import (
    SupabaseError,
    create_email_user,
    ensure_can_call_llm,
    get_chat_messages,
    get_user_by_email,
    get_user_by_email_or_username,
    get_user_by_id,
    get_user_by_username,
    increment_llm_calls,
    save_chat_message,
    touch_last_login,
    usage_from_record,
    user_record_to_response,
    user_record_to_token_payload,
)

app = FastAPI(title="KenZ Chat API", version="1.0.0")

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    try:
        payload = decode_access_token(credentials.credentials, settings)
    except AuthError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    return user_from_payload(payload)


def require_user_id(user: dict) -> str:
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return user_id


def build_auth_response(record: dict) -> AuthResponse:
    token = create_access_token(user_record_to_token_payload(record), settings)
    user = user_record_to_response(record)
    return AuthResponse(
        access_token=token,
        user=UserResponse(**user),
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": settings.llm_model}


@app.post("/auth/register", response_model=AuthResponse)
async def auth_register(request: RegisterRequest) -> AuthResponse:
    email = request.email.lower().strip()
    username = request.username.lower().strip()
    name = (request.name or username).strip()

    try:
        if await get_user_by_email(settings, email):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        if await get_user_by_username(settings, username):
            raise HTTPException(status_code=409, detail="This username is already taken.")

        record = await create_email_user(
            settings,
            email=email,
            username=username,
            name=name,
            password_hash=hash_password(request.password),
        )
        return build_auth_response(record)
    except SupabaseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.post("/auth/login", response_model=AuthResponse)
async def auth_login(request: LoginRequest) -> AuthResponse:
    identifier = request.email_or_username.strip()

    try:
        record = await get_user_by_email_or_username(settings, identifier)
        if not record or record.get("auth_provider") != "email":
            raise HTTPException(status_code=401, detail="Invalid email/username or password.")

        password_hash = record.get("password_hash")
        if not password_hash or not verify_password(request.password, password_hash):
            raise HTTPException(status_code=401, detail="Invalid email/username or password.")

        await touch_last_login(settings, record["id"])
        return build_auth_response(record)
    except SupabaseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.get("/auth/me", response_model=UserResponse)
async def auth_me(user: dict = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=user.get("id"),
        email=user["email"] or "",
        name=user["name"] or "",
        username=user.get("username"),
        picture=user.get("picture"),
    )


@app.get("/chat/history", response_model=ChatHistoryResponse)
async def chat_history(user: dict = Depends(get_current_user)) -> ChatHistoryResponse:
    user_id = require_user_id(user)

    try:
        record = await get_user_by_id(settings, user_id)
        if not record:
            raise HTTPException(status_code=404, detail="User not found.")

        rows = await get_chat_messages(settings, user_id, settings.chat_history_limit)
        usage = usage_from_record(record, settings.free_llm_call_limit)
        messages = [
            ChatMessage(role=row["role"], content=row["content"])
            for row in rows
        ]
        return ChatHistoryResponse(messages=messages, **usage)
    except SupabaseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
) -> ChatResponse:
    user_id = require_user_id(user)
    user_message = request.message.strip()

    try:
        usage = await ensure_can_call_llm(settings, user_id)

        history = await get_chat_messages(settings, user_id, settings.chat_history_limit)
        await save_chat_message(settings, user_id, "user", user_message)

        system_prompt = settings.system_prompt or DEFAULT_SYSTEM_PROMPT
        llm_messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for row in history:
            llm_messages.append({"role": row["role"], "content": row["content"]})
        llm_messages.append({"role": "user", "content": user_message})

        reply = await chat_completion(settings, llm_messages)

        await save_chat_message(settings, user_id, "assistant", reply)
        usage = await increment_llm_calls(settings, user_id)

        return ChatResponse(message=reply, **usage)
    except SupabaseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except LLMError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not reach the LLM provider. Check LLM_API_URL and your API key.",
        ) from exc
