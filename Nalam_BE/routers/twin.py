"""
Digital Twin Router — Health metrics logging, AQI fetching, and alert generation.
"""
from datetime import date, datetime, timezone
from fastapi import APIRouter
from models.twin import TwinLogRequest, TwinLogResponse, TwinAlert, TwinHistoryEntry
from services.aqi_service import get_aqi
from db.connection import get_db
from typing import List

router = APIRouter(prefix="/api", tags=["Digital Twin"])


def _compute_twin_score(
    sleep: float, steps: int, water: int,
    screen: float, hr: int, aqi: int
) -> int:
    """
    Compute a composite health score (0-100) from twin metrics.
    Higher = better.
    """
    score = 0

    # Sleep: 7-9 hours is ideal (max 20 points)
    if 7 <= sleep <= 9:
        score += 20
    elif 6 <= sleep <= 10:
        score += 15
    elif 5 <= sleep <= 11:
        score += 10
    else:
        score += 5

    # Steps: >8000 ideal (max 20 points)
    if steps >= 8000:
        score += 20
    elif steps >= 5000:
        score += 15
    elif steps >= 3000:
        score += 10
    elif steps >= 1000:
        score += 5

    # Water: 8 glasses ideal (max 15 points)
    if water >= 8:
        score += 15
    elif water >= 6:
        score += 12
    elif water >= 4:
        score += 8
    else:
        score += 3

    # Screen time: <4 hours ideal (max 15 points)
    if screen <= 2:
        score += 15
    elif screen <= 4:
        score += 12
    elif screen <= 6:
        score += 8
    else:
        score += 3

    # Heart rate: 60-80 ideal (max 15 points)
    if 60 <= hr <= 80:
        score += 15
    elif 50 <= hr <= 100:
        score += 10
    else:
        score += 5

    # AQI: <100 is good (max 15 points)
    if aqi <= 50:
        score += 15
    elif aqi <= 100:
        score += 12
    elif aqi <= 200:
        score += 8
    elif aqi <= 300:
        score += 4
    else:
        score += 1

    return min(score, 100)


def _generate_alerts(
    aqi: int, sleep: float, steps: int, session_phq: int
) -> List[TwinAlert]:
    """Generate health alerts based on metrics and mental health scores."""
    alerts = []

    if aqi > 200:
        alerts.append(TwinAlert(
            type="aqi",
            message="Air quality is hazardous today. This can worsen anxiety. Try indoor breathing exercises.",
            action="indoor_breathing",
        ))
    elif aqi > 100:
        alerts.append(TwinAlert(
            type="aqi",
            message="Air quality is moderate. Consider indoor exercise if you're sensitive.",
            action="indoor_exercise",
        ))

    if sleep < 5:
        alert_msg = "Very low sleep detected."
        if session_phq > 10:
            alert_msg += " Combined with your mood scores, this suggests burnout risk. Please prioritize rest."
            alerts.append(TwinAlert(type="burnout", message=alert_msg, action="burnout_recovery"))
        else:
            alert_msg += " Try to maintain a consistent sleep schedule."
            alerts.append(TwinAlert(type="sleep", message=alert_msg, action="sleep_hygiene"))

    if steps < 500:
        alerts.append(TwinAlert(
            type="movement",
            message="Very low physical activity. Even a short 10-minute walk can improve mood significantly.",
            action="movement_challenge",
        ))

    return alerts


def _generate_mood_correlation(session_id: str) -> str:
    """Generate mood correlation insights from recent data."""
    try:
        db = get_db()
        result = db.table("twin_logs").select("*").eq(
            "session_id", session_id
        ).order("log_date", desc=True).limit(7).execute()

        if not result.data or len(result.data) < 2:
            return "Not enough data yet for mood correlation analysis."

        logs = result.data
        avg_sleep = sum(l.get("sleep_hours", 0) for l in logs) / len(logs)
        avg_steps = sum(l.get("steps", 0) for l in logs) / len(logs)

        insights = []
        if avg_sleep < 6:
            insights.append("Sleep below average")
        if avg_steps < 3000:
            insights.append("Low physical activity trend")

        session = db.table("sessions").select("phq_score").eq("id", session_id).single().execute()
        if session.data and session.data.get("phq_score", 0) > 10:
            insights.append("rising PHQ trend detected")

        if insights:
            return " + ".join(insights)
        return "Your health metrics are looking balanced!"
    except Exception as e:
        print(f"[Twin] Error generating correlation: {e}")
        return "Health data being collected."


@router.post("/twin/log", response_model=TwinLogResponse)
async def log_twin(request: TwinLogRequest):
    """Log daily health metrics and get alerts + insights."""
    # Fetch AQI if auto mode
    aqi_data = {"aqi": 0, "level": "Unknown"}
    if request.aqi_auto:
        aqi_data = await get_aqi()

    twin_score = _compute_twin_score(
        sleep=request.sleep_hours,
        steps=request.steps,
        water=request.water_glasses,
        screen=request.screen_time_hours,
        hr=request.heart_rate_bpm,
        aqi=aqi_data["aqi"],
    )

    # Get session PHQ for alert correlation
    session_phq = 0
    try:
        db = get_db()
        session = db.table("sessions").select("phq_score").eq(
            "id", request.session_id
        ).single().execute()
        if session.data:
            session_phq = session.data.get("phq_score", 0)
    except Exception as e:
        print(f"[Session] Error fetching session PHQ: {e}")

    alerts = _generate_alerts(
        aqi=aqi_data["aqi"],
        sleep=request.sleep_hours,
        steps=request.steps,
        session_phq=session_phq,
    )

    # Save to DB
    try:
        db = get_db()
        db.table("twin_logs").insert({
            "session_id": request.session_id,
            "log_date": request.date or datetime.now(timezone.utc).date().isoformat(),
            "sleep_hours": request.sleep_hours,
            "steps": request.steps,
            "water_glasses": request.water_glasses,
            "screen_time_hours": request.screen_time_hours,
            "heart_rate_bpm": request.heart_rate_bpm,
            "aqi": aqi_data["aqi"],
            "aqi_level": aqi_data["level"],
            "twin_score": twin_score,
        }).execute()
    except Exception as e:
        print(f"[Twin] Error saving log: {e}")

    mood_correlation = _generate_mood_correlation(request.session_id)

    return TwinLogResponse(
        twin_score=twin_score,
        aqi=aqi_data["aqi"],
        aqi_level=aqi_data["level"],
        alerts=alerts,
        mood_correlation=mood_correlation,
    )


@router.get("/twin/{session_id}/history")
async def get_twin_history(session_id: str):
    """Get 7-day twin history for a session."""
    try:
        db = get_db()
        result = db.table("twin_logs").select("*").eq(
            "session_id", session_id
        ).order("log_date", desc=True).limit(7).execute()

        return {"history": result.data or []}
    except Exception as e:
        print(f"[Twin] Error fetching history: {e}")
        return {"history": []}
