"""
Crisis Router — Crisis logging, emergency contacts, and support call trigger.
Also handles DKMS registration.
"""
import random
import string
from fastapi import APIRouter
from pydantic import BaseModel
from models.avatar import DKMSRegisterRequest, DKMSRegisterResponse
from services.crisis_detector import CRISIS_CONTACTS
from services.elevenlabs_service import trigger_outbound_call
from db.connection import get_db

router = APIRouter(prefix="/api", tags=["Crisis"])


class CallTriggerRequest(BaseModel):
    session_id: str
    phone_number: str


class CallTriggerResponse(BaseModel):
    status: str
    message: str


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


@router.post("/call/trigger", response_model=CallTriggerResponse)
async def trigger_call(request: CallTriggerRequest):
    """
    Trigger an outbound ElevenLabs AI voice call to the user's phone.
    The AI agent will provide empathetic support over the phone.
    """
    # Ensure phone number has country code
    phone = request.phone_number.strip()
    if not phone.startswith("+"):
        phone = "+91" + phone  # default to India

    result = await trigger_outbound_call(phone)

    # Log to DB
    try:
        db = get_db()
        db.table("sessions").update({
            "call_triggered": True,
        }).eq("id", request.session_id).execute()
    except Exception as e:
        print(f"[Call] Error logging to DB: {e}")

    if result["status"] == "success":
        return CallTriggerResponse(
            status="success",
            message="A support call is being placed to your number. Please answer the incoming call. 💚",
        )
    else:
        return CallTriggerResponse(
            status="error",
            message=f"We couldn't place the call right now. Please try a helpline instead. Details: {result.get('message', 'Unknown error')}",
        )


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
