import secrets
import string
from app.utils.security import hash_password, verify_password


def generate_tracking_token() -> str:
    """Generate a 6-character alphanumeric tracking token."""
    alphabet = string.ascii_uppercase + string.digits
    # Remove ambiguous chars: 0, O, I, 1
    alphabet = alphabet.replace("0", "").replace("O", "").replace("I", "").replace("1", "")
    return "".join(secrets.choice(alphabet) for _ in range(6))


def hash_token(token: str) -> str:
    """Bcrypt hash of the token — plaintext never stored."""
    return hash_password(token)


def verify_token(plain: str, hashed: str) -> bool:
    """Verify tracking token against stored bcrypt hash."""
    return verify_password(plain, hashed)
