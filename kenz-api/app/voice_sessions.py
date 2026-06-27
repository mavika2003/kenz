import time
from dataclasses import dataclass

SESSION_TTL_SECONDS = 60 * 60 * 24


@dataclass
class SessionRecord:
    turns_used: int
    last_seen: float


_sessions: dict[str, SessionRecord] = {}


def _prune_expired() -> None:
    now = time.time()
    expired = [
        sid
        for sid, record in _sessions.items()
        if now - record.last_seen > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        del _sessions[sid]


def get_turns_used(session_id: str) -> int:
    _prune_expired()
    record = _sessions.get(session_id)
    return record.turns_used if record else 0


def increment_turn(session_id: str) -> int:
    _prune_expired()
    now = time.time()
    record = _sessions.get(session_id)
    if record is None:
        record = SessionRecord(turns_used=0, last_seen=now)
        _sessions[session_id] = record
    record.turns_used += 1
    record.last_seen = now
    return record.turns_used
