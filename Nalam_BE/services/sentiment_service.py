"""
Sentiment Analysis Service — HuggingFace distilbert.
Runs in parallel with LLM call on every user message.
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
MODEL_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"


async def get_sentiment(message: str) -> float:
    """
    Analyze sentiment of a message using HuggingFace Inference API.
    Returns a score between 0 (very negative) and 1 (very positive).
    """
    if not HUGGINGFACE_API_KEY:
        return _fallback_sentiment(message)

    try:
        response = requests.post(
            MODEL_URL,
            headers={"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"},
            json={"inputs": message},
            timeout=5,
        )

        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                scores = result[0]
                # Find POSITIVE label score
                for item in scores:
                    if item["label"] == "POSITIVE":
                        return round(item["score"], 3)
                    elif item["label"] == "NEGATIVE":
                        return round(1 - item["score"], 3)
        return 0.5
    except Exception as e:
        print(f"[Sentiment] Error: {e}")
        return _fallback_sentiment(message)


def _fallback_sentiment(message: str) -> float:
    """Simple keyword-based sentiment fallback."""
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
    """Map sentiment score to avatar mood state."""
    if score >= 0.6:
        return "happy"
    if score >= 0.4:
        return "calm"
    if score >= 0.25:
        return "anxious"
    return "sad"
