"""
Nalam AI — Antigravity Backend
FastAPI application entry point.
"""
import os
import random
import string
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from routers.chat import router as chat_router
from routers.avatar import router as avatar_router
from routers.twin import router as twin_router
from routers.booking import router as booking_router
from routers.crisis import router as crisis_router
from models.session import SessionCreateRequest, SessionCreateResponse
from db.connection import get_db

app = FastAPI(
    title="Nalam AI Antigravity API",
    description="Mental Health Support Assistant Backend",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://nalam-ai.lovable.app",
        os.getenv("FRONTEND_URL", "http://localhost:8080"),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


def _generate_id(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


# Health check
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "service": "Nalam AI Antigravity"}


# Session management
@app.post("/api/session/create", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    """Create an anonymous session. No PII stored."""
    session_id = f"sess_{_generate_id(6)}"

    try:
        db = get_db()
        db.table("sessions").insert({
            "id": session_id,
            "language": request.language,
        }).execute()
    except Exception as e:
        print(f"[Session] Error creating session: {e}")

    return SessionCreateResponse(
        session_id=session_id,
        language=request.language,
    )


# Mount routers
app.include_router(chat_router)
app.include_router(avatar_router)
app.include_router(twin_router)
app.include_router(booking_router)
app.include_router(crisis_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
