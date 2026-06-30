"""AI itinerary generation — turns trip parameters into a real day-by-day plan."""

import json
from typing import Any

from app.config import Settings
from app.llm_client import chat_completion

SCHEMA = """{
  "title": "short catchy trip title (include the city + days)",
  "summary": "2-3 sentence personalised overview",
  "neighborhood": "the single best area to stay, with a one-line why",
  "days": [
    {
      "day": 1,
      "title": "short theme for the day",
      "morning": "one specific activity naming a REAL place",
      "afternoon": "one specific activity naming a REAL place",
      "evening": "dinner / nightlife naming a REAL restaurant or spot",
      "highlights": ["real place 1", "real place 2"]
    }
  ]
}"""


async def generate_itinerary(
    settings: Settings,
    *,
    destination: str,
    days: int,
    travelers: int,
    budget: str = "",
    interests: str = "",
    origin: str = "",
) -> dict[str, Any]:
    system = (
        "You are Kenzr, a sharp local travel expert for Dubai and the UAE. "
        "You build realistic, specific, day-by-day itineraries using REAL "
        "neighbourhoods, attractions, restaurants and experiences — never generic "
        "filler. Be practical about timing, grouping nearby places, and the traveller's "
        "budget and interests. Respond with ONLY valid JSON matching the requested schema."
    )
    user = (
        f"Plan a {days}-day trip to {destination} for {travelers} traveller(s). "
        f"Budget: {budget or 'mid-range'}. "
        f"Interests: {interests or 'food, culture, iconic sights'}. "
        + (f"Departing from {origin}. " if origin else "")
        + f"Produce exactly {days} day objects. "
        f"Return JSON in this exact shape:\n{SCHEMA}"
    )

    raw = await chat_completion(
        settings,
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=2200,
        temperature=0.7,
        json_mode=True,
    )

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        start, end = raw.find("{"), raw.rfind("}")
        data = json.loads(raw[start : end + 1])

    data.setdefault("title", f"{days}-Day {destination} Trip")
    data.setdefault("summary", "")
    data.setdefault("neighborhood", "")
    days_list = data.get("days") or []
    # Light normalisation so the UI can rely on the shape.
    for i, d in enumerate(days_list, start=1):
        d.setdefault("day", i)
        d.setdefault("title", f"Day {i}")
        d.setdefault("highlights", [])
    data["days"] = days_list
    data["meta"] = {
        "destination": destination,
        "days": days,
        "travelers": travelers,
        "budget": budget,
        "interests": interests,
        "origin": origin,
    }
    return data
