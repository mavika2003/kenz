import httpx
from typing import Dict, List, Optional

from app.config import Settings


class LLMError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


async def chat_completion(
    settings: Settings,
    messages: List[Dict[str, str]],
    *,
    max_tokens: Optional[int] = None,
    temperature: float = 0.8,
    json_mode: bool = False,
) -> str:
    payload: dict = {
        "model": settings.llm_model,
        "messages": messages,
        "max_tokens": max_tokens if max_tokens is not None else settings.max_tokens,
        "temperature": temperature,
        "top_p": 0.95,
        "stream": False,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            settings.llm_api_url,
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        detail = response.text
        try:
            error_body = response.json()
            detail = error_body.get("error", detail)
            if isinstance(detail, dict):
                detail = detail.get("message", str(detail))
        except ValueError:
            pass
        raise LLMError(response.status_code, str(detail))

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise LLMError(502, "Model returned no choices")

    message = choices[0].get("message") or {}
    content = message.get("content")
    if not content:
        raise LLMError(502, "Model returned an empty response")

    return content.strip()
