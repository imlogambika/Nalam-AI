"""
Booking Router — cal.com doctor booking integration.
"""
import os
import requests
from fastapi import APIRouter
from models.avatar import BookingRequest, BookingResponse
from db.connection import get_db
from dotenv import load_dotenv

load_dotenv()

CAL_API_KEY = os.getenv("CAL_API_KEY", "")
CAL_EVENT_TYPE_ID = os.getenv("CAL_EVENT_TYPE_ID", "")

router = APIRouter(prefix="/api", tags=["Booking"])


@router.post("/booking/create", response_model=BookingResponse)
async def create_booking(request: BookingRequest):
    """Create a doctor booking via cal.com API."""
    booking_id = "booking_unavailable"

    if CAL_API_KEY and CAL_EVENT_TYPE_ID:
        try:
            response = requests.post(
                "https://api.cal.com/v1/bookings",
                headers={"Authorization": f"Bearer {CAL_API_KEY}"},
                json={
                    "eventTypeId": int(CAL_EVENT_TYPE_ID),
                    "metadata": {
                        "anonymous_session": request.session_id,
                        "severity": request.severity,
                        "phq_score": request.phq_score,
                        "gad_score": request.gad_score,
                    },
                },
                timeout=10,
            )
            if response.status_code == 200:
                booking_id = response.json().get("id", "booking_created")
        except Exception as e:
            print(f"[Booking] Error creating booking: {e}")

    # Log to DB
    try:
        db = get_db()
        db.table("bookings").insert({
            "session_id": request.session_id,
            "cal_event_id": booking_id,
            "severity_at_booking": request.severity,
        }).execute()
    except Exception as e:
        print(f"[Booking] Error logging to DB: {e}")

    return BookingResponse(booking_id=booking_id, status="confirmed")
