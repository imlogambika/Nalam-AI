"""
Pydantic models for session management.
"""
from pydantic import BaseModel
from typing import Optional


class SessionCreateRequest(BaseModel):
    language: str = "en"


class SessionCreateResponse(BaseModel):
    session_id: str
    language: str
