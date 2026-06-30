"""LiteAPI hotel search proxy — returns normalized hotels + cheapest rate.

The LiteAPI key stays server-side. Shapes are accessed defensively so we can
adjust quickly once we see live sandbox responses.
"""

from typing import Any, Optional

import httpx

from app.config import Settings


def _headers(settings: Settings) -> dict[str, str]:
    return {
        "X-API-Key": settings.liteapi_key,
        "Content-Type": "application/json",
        "accept": "application/json",
    }


def _cheapest_rate(hotel: dict[str, Any], fallback_currency: str) -> Optional[dict[str, Any]]:
    best: Optional[dict[str, Any]] = None
    for room in hotel.get("roomTypes") or []:
        for rate in room.get("rates") or []:
            total = (rate.get("retailRate") or {}).get("total") or []
            amount = total[0].get("amount") if total else rate.get("price")
            currency = total[0].get("currency") if total else rate.get("currency", fallback_currency)
            if amount is None:
                continue
            if best is None or amount < best["amount"]:
                best = {
                    "amount": float(amount),
                    "currency": currency or fallback_currency,
                    "room": rate.get("name") or room.get("name"),
                }
    return best


def _first_image(meta: dict[str, Any]) -> str:
    imgs = meta.get("hotelImages") or meta.get("images") or []
    if imgs:
        first = imgs[0]
        if isinstance(first, dict):
            return first.get("url") or first.get("urlHd") or ""
        if isinstance(first, str):
            return first
    return meta.get("main_photo") or meta.get("thumbnail") or ""


async def search_hotels(
    settings: Settings,
    *,
    city: str,
    country: str,
    checkin: str,
    checkout: str,
    adults: int = 2,
    currency: str = "USD",
    limit: int = 12,
) -> list[dict[str, Any]]:
    """Two-step LiteAPI flow: hotel content by city -> live rates by hotelIds."""
    headers = _headers(settings)

    async with httpx.AsyncClient(timeout=30) as client:
        # 1) Hotel content (names, photos, stars, ratings).
        content_resp = await client.get(
            f"{settings.liteapi_base}/data/hotels",
            headers=headers,
            params={"countryCode": country, "cityName": city, "limit": 40},
        )
        content_resp.raise_for_status()
        content = content_resp.json().get("data") or []
        by_id = {h.get("id"): h for h in content if h.get("id")}
        if not by_id:
            return []
        ids = list(by_id.keys())[:40]

        # 2) Live rates for those hotels.
        rates_resp = await client.post(
            f"{settings.liteapi_base}/hotels/rates",
            headers=headers,
            json={
                "hotelIds": ids,
                "checkin": checkin,
                "checkout": checkout,
                "currency": currency,
                "guestNationality": "AE",
                "occupancies": [{"adults": adults}],
            },
        )
        rates_resp.raise_for_status()
        rates = rates_resp.json().get("data") or []

    priced: dict[str, dict[str, Any]] = {}
    for hotel in rates:
        hid = hotel.get("hotelId") or hotel.get("id")
        cheapest = _cheapest_rate(hotel, currency)
        if hid and cheapest:
            priced[hid] = cheapest

    hotels: list[dict[str, Any]] = []
    for hid, rate in priced.items():
        meta = by_id.get(hid, {})
        hotels.append(
            {
                "id": hid,
                "name": meta.get("name") or "Hotel",
                "stars": meta.get("stars") or 0,
                "rating": meta.get("rating"),
                "reviewCount": meta.get("reviewCount"),
                "address": meta.get("address") or meta.get("city") or "",
                "image": meta.get("main_photo") or meta.get("thumbnail") or _first_image(meta),
                "room": rate.get("room"),
                "price": round(rate["amount"]),
                "currency": rate["currency"],
            }
        )

    hotels.sort(key=lambda h: h["price"])
    return hotels[:limit]
