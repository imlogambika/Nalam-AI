"""
Sarvam AI Service — Regional language STT/TTS.
Supports Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Marathi.
Free tier: 60 min/month STT + TTS.
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

SARVAM_LANGUAGES = ["hi-IN", "ta-IN", "te-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN"]

# Map short language codes to Sarvam language codes
LANG_MAP = {
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "bn": "bn-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
}


async def speech_to_text(audio_base64: str, language: str) -> str:
    """
    Convert speech audio to text using Sarvam AI.
    Input: base64-encoded audio, language code.
    Returns: transcribed text.
    """
    lang_code = LANG_MAP.get(language, language)

    try:
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"API-Subscription-Key": SARVAM_API_KEY},
            json={
                "model": "saarika:v1",
                "language_code": lang_code,
                "audio": audio_base64,
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json().get("transcript", "")
    except Exception as e:
        print(f"[Sarvam STT] Error: {e}")
        return ""


async def text_to_speech(text: str, language: str) -> str:
    """
    Convert text to speech audio using Sarvam AI.
    Input: text, language code.
    Returns: base64-encoded audio.
    """
    lang_code = LANG_MAP.get(language, language)

    try:
        response = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"API-Subscription-Key": SARVAM_API_KEY},
            json={
                "inputs": [text],
                "target_language_code": lang_code,
                "speaker": "meera",
                "model": "bulbul:v1",
            },
            timeout=15,
        )
        response.raise_for_status()
        audios = response.json().get("audios", [])
        return audios[0] if audios else ""
    except Exception as e:
        print(f"[Sarvam TTS] Error: {e}")
        return ""
