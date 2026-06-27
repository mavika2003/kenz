import json
import re
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field

from app.config import Settings
from app.llm_client import LLMError, chat_completion
from app.voice_sessions import get_turns_used, increment_turn
from app.supabase_client import ensure_can_call_llm, increment_llm_calls

VALID_ROUTES = {"/", "/login", "/chat", "/planner"}
VALID_SCROLL_TARGETS = {"who", "experiences", "how", "map"}
VALID_MILESTONES = {"destination", "style", "logistics", "review"}
VALID_PLANNER_FIELDS = {
    "destination",
    "travelStyle",
    "duration",
    "travelers",
    "accommodation",
    "transport",
}
VALID_DESTINATIONS = {"dubai", "abu-dhabi", "both"}
VALID_TRAVEL_STYLES = {"luxury", "balanced", "budget", "backpacker"}
VALID_ACCOMMODATION = {"hotel", "airbnb", "hostel", "resort"}
VALID_TRANSPORT = {"metro", "taxi", "rental", "mixed"}

DEFAULT_VOICE_SYSTEM_PROMPT = """You are Kenzr, a friendly AI mascot — an upbeat Dubai local who helps visitors navigate the KenZ website by voice.
You speak in short, warm, encouraging sentences (max 2 sentences in the "say" field).

You MUST respond with JSON only, no markdown, using this exact shape:
{"say": "short spoken reply", "actions": [...]}

Valid action types:
- {"type": "scroll", "target": "who"|"experiences"|"how"|"map"}
- {"type": "navigate", "route": "/"|"/login"|"/chat"|"/planner"}
- {"type": "planner_go_to", "milestone": "destination"|"style"|"logistics"|"review"}
- {"type": "planner_set", "field": "destination"|"travelStyle"|"duration"|"travelers"|"accommodation"|"transport", "value": <valid value>}
- {"type": "planner_complete", "milestone": "destination"|"style"|"logistics"|"review"}
- {"type": "noop"}

Site map:
- Homepage scroll sections: who, experiences, how, map
- Routes: / (home), /login, /chat (sign-in required), /planner (sign-in required)
- Planner milestones IN ORDER: destination → style → logistics → review
  (There is NO timeline step — duration and travelers are set in the logistics step)
- Field valid values:
  - destination: "dubai", "abu-dhabi", "both"
  - travelStyle: "luxury", "balanced", "budget", "backpacker"
  - duration: integer 1-60
  - travelers: integer 1-20
  - accommodation: "hotel", "airbnb", "hostel", "resort"
  - transport: "metro", "taxi", "rental", "mixed"

Rules:
- If user is NOT authenticated and asks for /chat or /planner, navigate to /login with query {"next": "/planner"}.
- If already on /planner, use planner actions — do NOT navigate again.
- ALWAYS extract ALL information the user mentions even if they say it in passing (e.g. "7 day trip to Dubai" → set destination=dubai AND duration=7).
- If the user's first message mentions trip details (duration, destination, travelers, style) from ANY page, include ALL corresponding planner_set actions along with the navigate action.
- If unclear, use noop and ask one short clarifying question.
- Never invent routes, milestones, or enum values outside the lists above.

Planner auto-advance rules (apply whenever on /planner OR when navigating there):
Milestone order: destination → style → logistics → review

"destination" step:
  - planner_set destination + planner_complete destination + planner_go_to style
  - "say": confirm destination, hint at travel style

"style" step:
  - planner_set travelStyle + planner_complete style + planner_go_to logistics
  - "say": confirm style, hint at logistics

"logistics" step (handles duration, travelers, accommodation, transport):
  - Set ALL fields the user mentions with planner_set actions
  - Only emit planner_complete logistics + planner_go_to review once BOTH accommodation AND transport are known
  - If user only gives some fields, set them and ask for the missing ones in "say"
  - "say": confirm what was set, ask for what's still missing

"review" step:
  - Do NOT auto-advance. Confirm plan in "say" and offer to save.

Multi-step: if user gives info for several steps at once, chain ALL planner_set + planner_complete + planner_go_to actions in order.
Keep "say" warm and specific — always mention what was actually set (e.g. "Seven days in Dubai — perfect!")."""


class PageContext(BaseModel):
    pathname: str = "/"
    planner_milestone: Optional[str] = None
    is_authenticated: bool = False


class VoiceAgentRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=2000)
    session_id: str = Field(min_length=8, max_length=64)
    page_context: PageContext = Field(default_factory=PageContext)


class VoiceAction(BaseModel):
    type: Literal[
        "scroll",
        "navigate",
        "planner_go_to",
        "planner_set",
        "planner_complete",
        "noop",
    ]
    target: Optional[str] = None
    route: Optional[str] = None
    query: Optional[dict[str, str]] = None
    milestone: Optional[str] = None
    field: Optional[str] = None
    value: Optional[Union[str, int, float]] = None


class VoiceAgentResponse(BaseModel):
    say: str
    actions: list[VoiceAction]
    turns_used: int
    turns_limit: int
    transcript: Optional[str] = None


class VoiceSessionLimitError(Exception):
    pass


async def process_voice_turn(
    settings: Settings,
    session_id: str,
    transcript: str,
    page_context: PageContext,
    user_id: Optional[str] = None,
) -> VoiceAgentResponse:
    cleaned = transcript.strip()
    if not cleaned:
        raise LLMError(422, "Couldn't hear you. Try speaking again.")

    if user_id:
        await ensure_can_call_llm(settings, user_id)
    else:
        limit = settings.voice_session_turn_limit
        if get_turns_used(session_id) >= limit:
            raise VoiceSessionLimitError()

    system_prompt = settings.voice_system_prompt or DEFAULT_VOICE_SYSTEM_PROMPT
    user_message = build_user_message(cleaned, page_context)
    llm_messages: List[Dict[str, str]] = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    raw = await chat_completion(
        settings,
        llm_messages,
        max_tokens=settings.voice_max_tokens,
        temperature=0.3,
        json_mode=True,
    )
    say, actions = parse_llm_response(raw)

    if user_id:
        usage = await increment_llm_calls(settings, user_id)
        turns_used = usage["calls_used"]
        turns_limit = usage["calls_limit"]
    else:
        turns_used = increment_turn(session_id)
        turns_limit = settings.voice_session_turn_limit

    return VoiceAgentResponse(
        say=say,
        actions=actions,
        turns_used=turns_used,
        turns_limit=turns_limit,
        transcript=cleaned,
    )


def build_user_message(transcript: str, page_context: PageContext) -> str:
    ctx = page_context.model_dump()
    return (
        f"User said: {transcript.strip()}\n\n"
        f"Current page context: {json.dumps(ctx)}"
    )


def _sanitize_query(query: Any) -> Optional[dict[str, str]]:
    if not isinstance(query, dict):
        return None
    allowed_keys = {"next", "mode"}
    sanitized: dict[str, str] = {}
    for key, value in query.items():
        if key not in allowed_keys:
            continue
        if not isinstance(value, str):
            continue
        if key == "next" and value not in VALID_ROUTES:
            continue
        if key == "mode" and value not in {"login", "signup"}:
            continue
        sanitized[key] = value
    return sanitized or None


def _sanitize_planner_value(field: str, value: Any) -> Optional[Union[str, int]]:
    if field in {"duration", "travelers"}:
        try:
            num = int(value)
        except (TypeError, ValueError):
            return None
        if field == "duration" and not (1 <= num <= 60):
            return None
        if field == "travelers" and not (1 <= num <= 20):
            return None
        return num

    if not isinstance(value, str):
        return None
    normalized = value.strip().lower()

    if field == "destination" and normalized in VALID_DESTINATIONS:
        return normalized
    if field == "travelStyle" and normalized in VALID_TRAVEL_STYLES:
        return normalized
    if field == "accommodation" and normalized in VALID_ACCOMMODATION:
        return normalized
    if field == "transport" and normalized in VALID_TRANSPORT:
        return normalized
    return None


def sanitize_action(raw: dict[str, Any]) -> Optional[VoiceAction]:
    action_type = raw.get("type")
    if action_type == "noop":
        return VoiceAction(type="noop")

    if action_type == "scroll":
        target = raw.get("target")
        if isinstance(target, str) and target in VALID_SCROLL_TARGETS:
            return VoiceAction(type="scroll", target=target)
        return None

    if action_type == "navigate":
        route = raw.get("route")
        if isinstance(route, str) and route in VALID_ROUTES:
            return VoiceAction(
                type="navigate",
                route=route,
                query=_sanitize_query(raw.get("query")),
            )
        return None

    if action_type == "planner_go_to":
        milestone = raw.get("milestone")
        if isinstance(milestone, str) and milestone in VALID_MILESTONES:
            return VoiceAction(type="planner_go_to", milestone=milestone)
        return None

    if action_type == "planner_complete":
        milestone = raw.get("milestone")
        if isinstance(milestone, str) and milestone in VALID_MILESTONES:
            return VoiceAction(type="planner_complete", milestone=milestone)
        return None

    if action_type == "planner_set":
        field = raw.get("field")
        if not isinstance(field, str) or field not in VALID_PLANNER_FIELDS:
            return None
        value = _sanitize_planner_value(field, raw.get("value"))
        if value is None:
            return None
        return VoiceAction(type="planner_set", field=field, value=value)

    return None


def parse_llm_response(raw_content: str) -> tuple[str, list[VoiceAction]]:
    content = raw_content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return (
            "Sorry, I got a bit confused. Could you say that again?",
            [VoiceAction(type="noop")],
        )

    say = data.get("say")
    if not isinstance(say, str) or not say.strip():
        say = "Okay!"

    actions_raw = data.get("actions")
    if not isinstance(actions_raw, list):
        return say.strip(), [VoiceAction(type="noop")]

    actions: list[VoiceAction] = []
    for item in actions_raw:
        if not isinstance(item, dict):
            continue
        sanitized = sanitize_action(item)
        if sanitized is not None:
            actions.append(sanitized)

    if not actions:
        actions = [VoiceAction(type="noop")]

    return say.strip(), actions
