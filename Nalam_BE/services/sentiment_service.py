"""
Sentiment Analysis Service — Gemini-based sentiment detection.
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def get_sentiment(message: str) -> float:
    """
    Analyze sentiment using Gemini.
    Returns score 0 (negative) to 1 (positive).
    """
    if not GEMINI_API_KEY:
        return _fallback_sentiment(message)

    try:
        model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
        response = model.generate_content(
            f"Rate sentiment 0-1 (0=very negative, 1=very positive). Reply ONLY with number: {message}",
            generation_config=genai.types.GenerationConfig(max_output_tokens=10, temperature=0)
        )
        score = float(response.text.strip())
        return round(max(0, min(1, score)), 3)
    except Exception as e:
        print(f"[Sentiment] Error: {e}")
        return _fallback_sentiment(message)


def _fallback_sentiment(message: str) -> float:
    """Keyword-based fallback."""
    positive = ["happy", "good", "great", "better", "okay", "fine", "grateful", "excited", "glad"]
    negative = ["sad", "anxious", "stressed", "worried", "depressed", "scared", "angry",
                "hopeless", "tired", "exhausted", "lonely", "overwhelmed", "numb"]

    msg_lower = message.lower()
    pos_count = sum(1 for w in positive if w in msg_lower)
    neg_count = sum(1 for w in negative if w in msg_lower)

    if pos_count + neg_count == 0:
        return 0.5
    return round(pos_count / (pos_count + neg_count), 3)


def sentiment_to_avatar_state(score: float) -> str:
    """Map sentiment to avatar state."""
    if score >= 0.6:
        return "happy"
    if score >= 0.4:
        return "calm"
    if score >= 0.25:
        return "anxious"
    return "sad"
