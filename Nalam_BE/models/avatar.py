"""
Pydantic models for Avatar endpoints.
"""
from pydantic import BaseModel
from typing import Dict, Optional


class AvatarCreateRequest(BaseModel):
    session_id: str
    style: str = "geometric"
    skin_tone: int = 2
    default_mood: str = "neutral"
    language: str = "en"


class AvatarCreateResponse(BaseModel):
    avatar_id: str
    avatar_url: str
    mood_states: Dict[str, str]


class BookingRequest(BaseModel):
    session_id: str
    severity: str
    phq_score: int = 0
    gad_score: int = 0


class BookingResponse(BaseModel):
    booking_id: str
    status: str


class DKMSRegisterRequest(BaseModel):
    session_id: str


class DKMSRegisterResponse(BaseModel):
    status: str
    message: str
