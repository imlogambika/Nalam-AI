"""
Pydantic models for Digital Twin endpoints.
"""
from pydantic import BaseModel
from typing import Optional, List


class TwinLogRequest(BaseModel):
    session_id: str
    date: Optional[str] = None
    sleep_hours: float = 0.0
    steps: int = 0
    water_glasses: int = 0
    screen_time_hours: float = 0.0
    heart_rate_bpm: int = 0
    aqi_auto: bool = True


class TwinAlert(BaseModel):
    type: str
    message: str
    action: str


class TwinLogResponse(BaseModel):
    twin_score: int = 0
    aqi: int = 0
    aqi_level: str = "Unknown"
    alerts: List[TwinAlert] = []
    mood_correlation: str = ""


class TwinHistoryEntry(BaseModel):
    log_date: str
    sleep_hours: float
    steps: int
    water_glasses: int
    screen_time_hours: float
    heart_rate_bpm: int
    aqi: int
    aqi_level: str
    twin_score: int
