"""
Avatar Router — Create and serve avatars with mood state variants.
"""
import random
import string
from fastapi import APIRouter
from fastapi.responses import Response
from models.avatar import AvatarCreateRequest, AvatarCreateResponse
from db.connection import get_db

router = APIRouter(prefix="/api", tags=["Avatar"])


def _generate_id(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def _generate_avatar_svg(style: str, skin_tone: int, mood: str) -> str:
    """Generate an SVG avatar based on style, skin tone, and mood."""
    skin_colors = ["#FFDBB4", "#EDB98A", "#D08B5B", "#AE5D29", "#694D3D"]
    skin = skin_colors[min(skin_tone, len(skin_colors) - 1)]

    mood_colors = {
        "calm": "#00D4AA",
        "happy": "#2DD4BF",
        "anxious": "#F5A623",
        "sad": "#4A9EFF",
        "crisis": "#FF4D6D",
    }
    mood_color = mood_colors.get(mood, "#00D4AA")

    mood_expressions = {
        "calm": "M35,45 Q40,50 45,45",
        "happy": "M33,43 Q40,52 47,43",
        "anxious": "M35,47 Q40,44 45,47",
        "sad": "M33,48 Q40,42 47,48",
        "crisis": "M35,47 Q40,44 45,47",
    }
    mouth = mood_expressions.get(mood, mood_expressions["calm"])

    eye_variants = {
        "calm": "M32,35 L33,35 M47,35 L48,35",
        "happy": "M31,34 Q32.5,32 34,34 M46,34 Q47.5,32 49,34",
        "anxious": "M32,34 L33,34 M47,34 L48,34",
        "sad": "M32,36 L33,36 M47,36 L48,36",
        "crisis": "M32,35 L33,35 M47,35 L48,35",
    }
    eyes = eye_variants.get(mood, eye_variants["calm"])

    if style == "geometric":
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <linearGradient id="bg-{mood}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{mood_color};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:{mood_color};stop-opacity:0.05"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="16" fill="url(#bg-{mood})"/>
  <circle cx="40" cy="35" r="18" fill="{skin}"/>
  <path d="{eyes}" stroke="#333" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="{mouth}" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <rect x="25" y="55" width="30" height="20" rx="4" fill="{mood_color}" opacity="0.6"/>
  <circle cx="40" cy="72" r="3" fill="{mood_color}" opacity="0.8"/>
</svg>"""
    elif style == "minimalist":
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" rx="40" fill="{mood_color}" opacity="0.1"/>
  <circle cx="40" cy="36" r="16" fill="{skin}"/>
  <path d="{eyes}" stroke="#555" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="{mouth}" stroke="#555" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>"""
    elif style == "abstract":
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <radialGradient id="glow-{mood}">
      <stop offset="0%" style="stop-color:{mood_color};stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:{mood_color};stop-opacity:0"/>
    </radialGradient>
  </defs>
  <circle cx="40" cy="40" r="38" fill="url(#glow-{mood})"/>
  <ellipse cx="40" cy="35" rx="15" ry="17" fill="{skin}"/>
  <path d="{eyes}" stroke="#333" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="{mouth}" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="26" cy="60" r="6" fill="{mood_color}" opacity="0.3"/>
  <circle cx="54" cy="58" r="4" fill="{mood_color}" opacity="0.4"/>
</svg>"""
    else:  # emoji
        emojis = {
            "calm": "😊", "happy": "😄",
            "anxious": "😰", "sad": "😢", "crisis": "😨",
        }
        emoji = emojis.get(mood, "😊")
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" rx="16" fill="{mood_color}" opacity="0.1"/>
  <text x="40" y="50" font-size="40" text-anchor="middle" dominant-baseline="central">{emoji}</text>
</svg>"""


@router.post("/avatar/create", response_model=AvatarCreateResponse)
async def create_avatar(request: AvatarCreateRequest):
    """Create avatar with mood state variants."""
    avatar_id = f"avt_{_generate_id(6)}"

    mood_states = {}
    for mood in ["calm", "anxious", "sad", "happy", "crisis"]:
        svg = _generate_avatar_svg(request.style, request.skin_tone, mood)
        mood_states[mood] = f"/api/avatar/{avatar_id}/{mood}"

    # Update session with avatar_id
    try:
        db = get_db()
        db.table("sessions").update({
            "avatar_id": avatar_id,
        }).eq("id", request.session_id).execute()
    except Exception as e:
        print(f"[Avatar] Error updating session: {e}")

    return AvatarCreateResponse(
        avatar_id=avatar_id,
        avatar_url=f"/api/avatar/{avatar_id}/calm",
        mood_states=mood_states,
    )


@router.get("/avatar/{avatar_id}/{state}")
async def get_avatar(avatar_id: str, state: str, style: str = "geometric", skin_tone: int = 2):
    """Get avatar SVG by mood state."""
    svg = _generate_avatar_svg(style, skin_tone, state)
    return Response(content=svg, media_type="image/svg+xml")
