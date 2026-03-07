"""
Langfuse Service — Tracing, prompt management, and user feedback.
"""
import os
from dotenv import load_dotenv

load_dotenv()

LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

_langfuse = None


def _get_langfuse():
    """Get or create Langfuse client singleton."""
    global _langfuse
    if _langfuse is None:
        try:
            from langfuse import Langfuse
            _langfuse = Langfuse(
                public_key=LANGFUSE_PUBLIC_KEY,
                secret_key=LANGFUSE_SECRET_KEY,
                host=LANGFUSE_HOST,
            )
        except Exception as e:
            print(f"[Langfuse] Failed to initialize: {e}")
            return None
    return _langfuse


def get_prompt(name: str) -> str:
    """
    Fetch a versioned prompt from Langfuse.
    Falls back to a default system prompt if Langfuse is unavailable.
    """
    DEFAULT_SYSTEM_PROMPT = """You are Nalam AI, an empathetic mental health companion for students.

RULES:
- Never provide medical diagnoses
- Always respond with warmth and empathy
- Use CBT-aligned techniques naturally
- If the user seems in crisis, express care and suggest professional help
- Keep responses concise but meaningful (2-4 sentences)
- Adapt your language tone based on severity
- Reference medical knowledge naturally when relevant
- Always validate the user's feelings before suggesting techniques
- If language is not English, respond in the same language

You are NOT a therapist. You are a caring companion who listens, validates, and gently guides."""

    lf = _get_langfuse()
    if lf is None:
        return DEFAULT_SYSTEM_PROMPT
    try:
        prompt = lf.get_prompt(name)
        return prompt.compile()
    except Exception as e:
        print(f"[Langfuse] Failed to fetch prompt '{name}': {e}")
        return DEFAULT_SYSTEM_PROMPT


def log_trace(session_id: str, input_text: str, output_text: str, prompt_version: str) -> str:
    """Log a conversation trace to Langfuse."""
    lf = _get_langfuse()
    if lf is None:
        return "trace_unavailable"
    try:
        trace = lf.trace(
            name="nalam-chat",
            session_id=session_id,
            input=input_text,
            output=output_text,
            metadata={"prompt_version": prompt_version},
        )
        return trace.id
    except Exception as e:
        print(f"[Langfuse] Failed to log trace: {e}")
        return "trace_error"


def log_feedback(trace_id: str, rating: int):
    """Log user feedback (rating) for a trace."""
    lf = _get_langfuse()
    if lf is None:
        return
    try:
        lf.score(
            trace_id=trace_id,
            name="user_rating",
            value=rating,
        )
    except Exception as e:
        print(f"[Langfuse] Failed to log feedback: {e}")
