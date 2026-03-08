"""
ElevenLabs Service — English voice TTS and Outbound Call.
Free tier: 10,000 characters/month.
"""
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID", "")
ELEVENLABS_PHONE_ID = os.getenv("ELEVENLABS_PHONE_ID", "")
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


async def trigger_outbound_call(phone_number: str) -> dict:
    """
    Trigger an outbound call via ElevenLabs Conversational AI agent.
    Uses the Twilio integration endpoint.

    Args:
        phone_number: The recipient's phone number (e.g. "+919876543210")

    Returns:
        dict with status and call details
    """
    if not ELEVENLABS_API_KEY or not ELEVENLABS_AGENT_ID or not ELEVENLABS_PHONE_ID:
        print("[ElevenLabs Call] Missing API key, agent ID, or phone ID")
        return {"status": "error", "message": "ElevenLabs call service not configured"}

    try:
        response = requests.post(
            "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "agent_id": ELEVENLABS_AGENT_ID,
                "agent_phone_number_id": ELEVENLABS_PHONE_ID,
                "to_number": phone_number,
            },
            timeout=15,
        )
        response.raise_for_status()
        result = response.json()
        print(f"[ElevenLabs Call] Outbound call triggered to {phone_number}: {result}")
        return {"status": "success", "data": result}
    except requests.exceptions.HTTPError as e:
        error_body = ""
        try:
            error_body = e.response.json()
        except Exception:
            error_body = e.response.text
        print(f"[ElevenLabs Call] HTTP Error: {e} — {error_body}")
        return {"status": "error", "message": f"Call failed: {error_body}"}
    except Exception as e:
        print(f"[ElevenLabs Call] Error: {e}")
        return {"status": "error", "message": str(e)}
