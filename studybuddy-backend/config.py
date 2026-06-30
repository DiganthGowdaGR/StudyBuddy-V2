"""Configuration - loads environment variables from .env"""
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_KEYS = [
    os.getenv("GROQ_API_KEY"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3")
]
GROQ_API_KEYS = [k.strip() for k in GROQ_API_KEYS if k and k.strip()]
if not GROQ_API_KEYS and GROQ_API_KEY:
    GROQ_API_KEYS = [GROQ_API_KEY.strip()]
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

REQUIRE_PASSCODE = os.getenv("REQUIRE_PASSCODE", "false").lower() == "true"
BYPASS_PASSCODE = os.getenv("BYPASS_PASSCODE", "19780906").strip()

