import hashlib

import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def make_sub_from_email(email: str) -> str:
    return hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:32]
