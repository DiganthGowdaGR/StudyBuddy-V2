"""Thread-safe Groq API Key Rotator"""
import logging
import threading
from config import GROQ_API_KEYS

logger = logging.getLogger("groq_auth")

_current_key_idx = 0
_key_lock = threading.Lock()


def get_current_key() -> str | None:
    """Return the active Groq API Key from config."""
    global _current_key_idx
    with _key_lock:
        if not GROQ_API_KEYS:
            return None
        return GROQ_API_KEYS[_current_key_idx % len(GROQ_API_KEYS)]


def rotate_key():
    """Rotate to the next Groq API Key."""
    global _current_key_idx
    with _key_lock:
        if GROQ_API_KEYS:
            _current_key_idx = (_current_key_idx + 1) % len(GROQ_API_KEYS)
            logger.warning(
                f"Switching active Groq API key to index {_current_key_idx} due to rate limits."
            )
