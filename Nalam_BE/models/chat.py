"""
Pydantic models for chat endpoints.
"""
from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    session_id: str
    avatar_id: Optional[str] = None
    message: str
    language: str = "en"
    voice_mode: bool = False
    phq_score_current: int = 0
    gad_score_current: int = 0


class CopingCardData(BaseModel):
    strategy_id: Optional[str] = None
    title: str
    description: str
    category: str
    severity: Optional[str] = None
    interactive: bool = False


class CrisisContact(BaseModel):
    name: str
    phone: str


class ChatResponse(BaseModel):
    reply: str
    sentiment_score: float = 0.0
    avatar_state: str = "calm"
    phq_score_updated: int = 0
    gad_score_updated: int = 0
    severity: str = "minimal"
    coping_card: Optional[CopingCardData] = None
    crisis_detected: bool = False
    crisis_contacts: Optional[List[CrisisContact]] = None
    dkms_triggered: bool = False
    book_doctor_cta: bool = False
    langfuse_trace_id: Optional[str] = None


class VoiceRequest(BaseModel):
    session_id: str
    audio_base64: str
    language: str = "en"
    avatar_id: Optional[str] = None


class VoiceResponse(BaseModel):
    transcript: str
    reply_text: str
    reply_audio_base64: str
    sentiment_score: float = 0.0
    avatar_state: str = "calm"


class FeedbackRequest(BaseModel):
    session_id: str
    trace_id: str
    rating: int
