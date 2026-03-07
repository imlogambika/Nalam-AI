"""
ElevenLabs Service — English voice TTS.
Free tier: 10,000 characters/month.
"""
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # calm, warm therapist voice


async def text_to_speech_english(text: str) -> str:
    """
    Convert text to speech using ElevenLabs API.
    Returns base64-encoded audio.
    """
    try:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            json={
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.75,
                    "similarity_boost": 0.75,
                },
            },
            timeout=15,
        )
        response.raise_for_status()
        return base64.b64encode(response.content).decode()
    except Exception as e:
        print(f"[ElevenLabs TTS] Error: {e}")
        return ""
