"""STT service - Groq Whisper transcription"""
from pathlib import Path

import httpx

from config import GROQ_API_KEYS, GROQ_API_KEY
from services.groq_auth import get_current_key, rotate_key

# Groq OpenAI-compatible Whisper endpoint.
WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL = "whisper-large-v3"


def transcribe_audio(file_path: str) -> str:
    """Transcribe audio file using Groq Whisper API. Returns transcribed text."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    attempts = len(GROQ_API_KEYS) if GROQ_API_KEYS else 1
    last_exc = None

    for attempt in range(attempts):
        api_key = get_current_key() or GROQ_API_KEY

        try:
            with open(file_path, "rb") as f:
                files = {"file": (path.name, f, "audio/webm")}
                data = {"model": MODEL}
                headers = {"Authorization": f"Bearer {api_key}"}

                with httpx.Client() as client:
                    response = client.post(
                        WHISPER_URL,
                        files=files,
                        data=data,
                        headers=headers,
                        timeout=60.0,
                    )
                    response.raise_for_status()

            result = response.json()
            text = result.get("text", "")
            if not isinstance(text, str):
                raise ValueError("Unexpected transcription response format")
            return text.strip()
        except Exception as e:
            last_exc = e
            msg = str(e).lower()
            is_exhausted = (
                "429" in msg
                or "rate" in msg
                or "quota" in msg
                or "limit" in msg
                or "401" in msg
            )
            if is_exhausted and attempts > 1:
                rotate_key()
                continue
            raise e

    if last_exc:
        raise last_exc
    raise RuntimeError("No Groq API keys available.")
