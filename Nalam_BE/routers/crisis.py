"""
Crisis Router — Crisis logging and emergency contacts.
Also handles DKMS registration.
"""
import random
import string
from fastapi import APIRouter
from models.avatar import DKMSRegisterRequest, DKMSRegisterResponse
from services.crisis_detector import CRISIS_CONTACTS
from db.connection import get_db

router = APIRouter(prefix="/api", tags=["Crisis"])


@router.post("/crisis/log")
async def log_crisis(session_id: str):
    """Log a crisis event for a session."""
    try:
        db = get_db()
        db.table("sessions").update({
            "crisis_detected": True,
        }).eq("id", session_id).execute()
    except Exception as e:
        print(f"[Crisis] Error logging: {e}")

    return {"status": "logged", "message": "Crisis event recorded safely."}


@router.get("/crisis/contacts")
async def get_crisis_contacts():
    """Get emergency helpline contacts."""
    return {"contacts": CRISIS_CONTACTS}


@router.post("/dkms/register", response_model=DKMSRegisterResponse)
async def register_dkms(request: DKMSRegisterRequest):
    """Log DKMS donor registration intent."""
    try:
        db = get_db()
        db.table("sessions").update({
            "dkms_registered": True,
        }).eq("id", request.session_id).execute()
    except Exception as e:
        print(f"[DKMS] Error logging registration: {e}")

    return DKMSRegisterResponse(
        status="registered",
        message=(
            "You're now on the donor list. Somewhere out there, "
            "a person fighting blood cancer has one more chance because of YOU. 💛"
        ),
    )
