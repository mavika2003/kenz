from functools import lru_cache
from typing import Literal, Optional

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # OpenAI-compatible provider (Groq, Hugging Face router, etc.)
    llm_api_key: str = Field(alias="LLM_API_KEY")
    llm_api_url: str = Field(
        default="https://api.groq.com/openai/v1/chat/completions",
        alias="LLM_API_URL",
    )
    llm_model: str = Field(
        default="llama-3.3-70b-versatile",
        alias="LLM_MODEL",
    )
    allowed_origins: str = Field(
        default="http://localhost:3000,https://gokenz.com,https://www.gokenz.com",
        alias="ALLOWED_ORIGINS",
    )
    system_prompt: Optional[str] = Field(default=None, alias="SYSTEM_PROMPT")
    max_tokens: int = Field(default=512, alias="MAX_TOKENS")

    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_expire_days: int = Field(default=7, alias="JWT_EXPIRE_DAYS")

    supabase_url: str = Field(
        default="https://zynadcpqsmxulhkcwzrl.supabase.co",
        alias="SUPABASE_URL",
    )
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    free_llm_call_limit: int = Field(default=100, alias="FREE_LLM_CALL_LIMIT")
    chat_history_limit: int = Field(default=80, alias="CHAT_HISTORY_LIMIT")

    voice_session_turn_limit: int = Field(default=100, alias="VOICE_SESSION_TURN_LIMIT")
    voice_system_prompt: Optional[str] = Field(default=None, alias="VOICE_SYSTEM_PROMPT")
    voice_max_tokens: int = Field(default=600, alias="VOICE_MAX_TOKENS")

    whisper_api_url: str = Field(
        default="https://api.groq.com/openai/v1/audio/transcriptions",
        alias="WHISPER_API_URL",
    )
    whisper_model: str = Field(
        default="whisper-large-v3-turbo",
        alias="WHISPER_MODEL",
    )

    # LiteAPI (hotel content + live rates). Key stays server-side.
    liteapi_key: str = Field(default="", alias="LITEAPI_KEY")
    liteapi_base: str = Field(
        default="https://api.liteapi.travel/v3.0",
        alias="LITEAPI_BASE",
    )

    @property
    def origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


DEFAULT_SYSTEM_PROMPT = """You are a Kenzr — a real Dubai local who texts like a friend, not a tour guide brochure.
You give honest, practical advice about Dubai: neighborhoods, food, scams to avoid, hidden spots, and how locals actually live.
Keep replies short and conversational (2-4 sentences unless the user asks for detail). Use plain language, no corporate tone.
If you don't know something, say so. Never invent specific business names, prices, or opening hours."""


@lru_cache
def get_settings() -> Settings:
    return Settings()


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    message: str
    calls_used: int
    calls_limit: int
    calls_remaining: int


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessage]
    calls_used: int
    calls_limit: int
    calls_remaining: int


class UserResponse(BaseModel):
    id: Optional[str] = None
    email: str
    name: str
    username: Optional[str] = None
    picture: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=128)
    name: Optional[str] = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    email_or_username: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class TripPlanRequest(BaseModel):
    destination: Optional[str] = None
    travel_style: Optional[str] = None
    duration: int = Field(default=7, ge=1, le=60)
    travelers: int = Field(default=1, ge=1, le=20)
    budget_total: Optional[int] = None
    accommodation: Optional[str] = None
    transport: Optional[str] = None
    start_date: Optional[str] = None
    plan_data: dict = Field(default_factory=dict)
    budget_breakdown: Optional[dict] = None


class TripPlanResponse(BaseModel):
    id: str
    share_token: str
    share_url: str
