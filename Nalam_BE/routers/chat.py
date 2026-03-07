"""
Chat Router — Main chat endpoint with full 10-step pipeline.
Handles text messages, voice messages, and feedback.
"""
import random
import string
from fastapi import APIRouter
from models.chat import (
    ChatRequest, ChatResponse, CopingCardData, CrisisContact,
    VoiceRequest, VoiceResponse, FeedbackRequest,
)
from services.crisis_detector import (
    detect_crisis, detect_dkms_keywords,
    CRISIS_CONTACTS, CRISIS_MESSAGE,
)
from services.scoring_service import update_scores, compute_severity, should_book_doctor
from services.sentiment_service import get_sentiment, sentiment_to_avatar_state
from services.gemini_service import get_chat_response
from services.rag_service import search_rag
from services.coping_service import get_coping_strategy
from services.langfuse_service import log_feedback
from services.sarvam_service import speech_to_text as sarvam_stt, text_to_speech as sarvam_tts
from services.elevenlabs_service import text_to_speech_english as elevenlabs_tts
from db.connection import get_db

router = APIRouter(prefix="/api", tags=["Chat"])


def _update_session(session_id: str, phq: int, gad: int, severity: str):
    """Update session scores in database."""
    try:
        db = get_db()
        db.table("sessions").update({
            "phq_score": phq,
            "gad_score": gad,
            "severity": severity,
        }).eq("id", session_id).execute()
    except Exception as e:
        print(f"[Session] Error updating session: {e}")


def _update_session_crisis(session_id: str):
    """Mark session as having crisis detected."""
    try:
        db = get_db()
        db.table("sessions").update({
            "crisis_detected": True,
        }).eq("id", session_id).execute()
    except Exception as e:
        print(f"[Session] Error updating crisis flag: {e}")


def _build_crisis_response(session_id: str) -> ChatResponse:
    """Build crisis response with contacts and warm message."""
    _update_session_crisis(session_id)
    return ChatResponse(
        reply=CRISIS_MESSAGE,
        crisis_detected=True,
        crisis_contacts=[
            CrisisContact(name=c["name"], phone=c["phone"])
            for c in CRISIS_CONTACTS
        ],
        book_doctor_cta=True,
        avatar_state="crisis",
        sentiment_score=0.0,
        phq_score_updated=0,
        gad_score_updated=0,
        severity="severe",
    )


@router.post("/chat/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Main chat endpoint — Full 10-step pipeline:
    1. Crisis check (instant, rule-based)
    2. Sentiment analysis (parallel)
    3. RAG search from PDF knowledge base
    4. PHQ/GAD score update
    5. Gemini 2.5 Flash response
    6. Coping strategy selection
    7. Avatar state mapping
    8. DKMS trigger check
    9. Doctor booking CTA
    10. Session update in DB
    """
    # Step 1: Crisis check (instant, rule-based)
    crisis = detect_crisis(request.message)
    if crisis:
        return _build_crisis_response(request.session_id)

    # Step 2: Sentiment analysis
    sentiment = await get_sentiment(request.message)

    # Step 3: RAG search from PDF knowledge base
    rag_context = await search_rag(request.message)

    # Step 4: PHQ/GAD score update
    phq, gad = update_scores(
        request.message,
        request.phq_score_current,
        request.gad_score_current,
    )
    severity = compute_severity(phq, gad)

    # Step 5: Gemini 2.5 Flash response
    llm_result = await get_chat_response(
        message=request.message,
        session_id=request.session_id,
        language=request.language,
        phq_score=phq,
        gad_score=gad,
        rag_context=rag_context,
    )

    # Step 6: Coping strategy
    coping_data = await get_coping_strategy(
        category="anxiety" if gad > phq else "depression",
        severity=severity if severity in ["mild", "moderate", "severe"] else "mild",
    )
    coping_card = None
    if coping_data:
        coping_card = CopingCardData(**coping_data)

    # Step 7: Avatar state
    avatar_state = sentiment_to_avatar_state(sentiment)

    # Step 8: DKMS trigger check
    dkms_triggered = detect_dkms_keywords(request.message)

    # Step 9: Doctor booking CTA
    book_cta = should_book_doctor(phq, gad)

    # Step 10: Update session in DB
    _update_session(request.session_id, phq, gad, severity)

    return ChatResponse(
        reply=llm_result["reply"],
        sentiment_score=sentiment,
        avatar_state=avatar_state,
        phq_score_updated=phq,
        gad_score_updated=gad,
        severity=severity,
        coping_card=coping_card,
        crisis_detected=False,
        dkms_triggered=dkms_triggered,
        book_doctor_cta=book_cta,
        langfuse_trace_id=llm_result["trace_id"],
    )


@router.post("/chat/voice", response_model=VoiceResponse)
async def voice_message(request: VoiceRequest):
    """
    Voice message endpoint — STT → Chat → TTS.
    Routes to Sarvam AI for regional languages, ElevenLabs for English.
    """
    # STT: Route to correct service
    if request.language == "en":
        # For English, we'd need a separate STT (ElevenLabs doesn't have STT)
        # Fallback to Sarvam for now or use browser-side Web Speech API
        transcript = await sarvam_stt(request.audio_base64, "en")
    else:
        transcript = await sarvam_stt(request.audio_base64, request.language)

    if not transcript:
        return VoiceResponse(
            transcript="",
            reply_text="I couldn't understand the audio. Could you please try again?",
            reply_audio_base64="",
            sentiment_score=0.5,
            avatar_state="calm",
        )

    # Process as normal text message
    chat_request = ChatRequest(
        session_id=request.session_id,
        message=transcript,
        language=request.language,
        avatar_id=request.avatar_id,
    )
    chat_response = await send_message(chat_request)

    # TTS: Route to correct service
    if request.language == "en":
        audio = await elevenlabs_tts(chat_response.reply)
    else:
        audio = await sarvam_tts(chat_response.reply, request.language)

    return VoiceResponse(
        transcript=transcript,
        reply_text=chat_response.reply,
        reply_audio_base64=audio,
        sentiment_score=chat_response.sentiment_score,
        avatar_state=chat_response.avatar_state,
    )


@router.post("/feedback/rate")
async def rate_response(request: FeedbackRequest):
    """Submit user feedback rating for a response via Langfuse."""
    log_feedback(request.trace_id, request.rating)

    # Also log to DB
    try:
        db = get_db()
        db.table("langfuse_feedback").insert({
            "session_id": request.session_id,
            "trace_id": request.trace_id,
            "rating": request.rating,
        }).execute()
    except Exception as e:
        print(f"[Feedback] Error logging to DB: {e}")

    return {"status": "ok", "message": "Feedback recorded"}
