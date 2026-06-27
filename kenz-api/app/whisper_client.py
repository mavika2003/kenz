import httpx

from app.config import Settings
from app.llm_client import LLMError


async def transcribe_audio(
    settings: Settings,
    audio_bytes: bytes,
    filename: str = "audio.webm",
    content_type: str = "audio/webm",
) -> str:
    if not audio_bytes:
        raise LLMError(400, "No audio received. Try recording again.")

    if len(audio_bytes) > 25 * 1024 * 1024:
        raise LLMError(413, "Recording is too long. Keep it under 30 seconds.")

    files = {"file": (filename, audio_bytes, content_type)}
    data = {
        "model": settings.whisper_model,
        "language": "en",
        "response_format": "json",
        "temperature": "0",
    }
    headers = {"Authorization": f"Bearer {settings.llm_api_key}"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            settings.whisper_api_url,
            headers=headers,
            files=files,
            data=data,
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

    try:
        payload = response.json()
    except ValueError as exc:
        raise LLMError(502, "Whisper returned an invalid response.") from exc

    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        raise LLMError(422, "Couldn't hear you. Try speaking again.")

    return text.strip()
