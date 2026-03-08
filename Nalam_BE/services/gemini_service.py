"""
Gemini Service — LLM integration with Gemini 2.5 Flash.
Handles chat response generation with context-aware prompting.
Now returns structured JSON with needs_support flag for distress detection.
"""
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from services.langfuse_service import get_prompt, log_trace

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SYSTEM_PROMPT_NAME = "nalam-main-v1"

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


SUPPORT_DETECTION_INSTRUCTION = """

IMPORTANT — DISTRESS DETECTION:
You must also analyse the user's message for signs of emotional distress,
loneliness, hopelessness, suicidal ideation, self-harm thoughts, or any
indication that the user needs professional support.

Always respond in **valid JSON** with exactly these two keys:
{
  "reply": "<your empathetic response text>",
  "needs_support": true | false
}

Set "needs_support" to true when you detect ANY of:
- Suicidal thoughts or self-harm ideation
- Deep loneliness or isolation ("I feel so alone", "nobody cares")
- Hopelessness ("what's the point", "nothing matters", "I can't go on")
- Severe depression indicators ("I don't want to do anything anymore")
- Expressions of wanting to disappear or give up
- Requests for help with emotional crisis

Set "needs_support" to false for general conversation, mild stress, or
everyday emotional sharing that doesn't indicate severe distress.

NEVER include markdown code fences in your response. Return ONLY raw JSON.
"""


async def get_chat_response(
    message: str,
    session_id: str,
    language: str,
    phq_score: int,
    gad_score: int,
    rag_context: str = "",
) -> dict:
    """
    Generate a chat response using Gemini 2.5 Flash.
    Includes session context, clinical scores, and RAG context.
    Returns dict with reply text, trace_id, and needs_support flag.
    """
    # Fetch versioned prompt from Langfuse
    system_prompt = get_prompt(SYSTEM_PROMPT_NAME)

    # Append distress detection instruction
    full_system_prompt = system_prompt + SUPPORT_DETECTION_INSTRUCTION

    # Map language code to full name for Gemini
    language_names = {
        "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
        "bn": "Bengali", "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi",
    }
    lang_name = language_names.get(language, "English")

    # Build context-aware prompt
    user_prompt = f"""
    Session context:
    - PHQ-9 score so far: {phq_score}/27
    - GAD-7 score so far: {gad_score}/21
    - Language: {language} ({lang_name})
    - Medical context from books: {rag_context if rag_context else "None available"}

    User message: {message}

    IMPORTANT: You MUST respond in {lang_name} language. The "reply" value in your JSON must be written in {lang_name}.
    Remember: respond ONLY with valid JSON containing "reply" and "needs_support" keys.
    """

    needs_support = False

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=full_system_prompt,
        )

        # Configure generation with token limits and timeout
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=1024,
            temperature=0.7,
        )

        response = model.generate_content(
            user_prompt,
            generation_config=generation_config,
            request_options={"timeout": 30}
        )
        raw_text = response.text.strip()

        # Parse JSON response from Gemini
        try:
            # Strip markdown code fences if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[1]  # remove first line
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3].strip()

            parsed = json.loads(raw_text)
            reply_text = parsed.get("reply", raw_text)
            needs_support = parsed.get("needs_support", False)
        except (json.JSONDecodeError, AttributeError):
            # If Gemini didn't return valid JSON, use raw text
            print(f"[Gemini] Response was not valid JSON, using raw text")
            reply_text = raw_text
            # Fallback: keyword-based detection
            lower_msg = message.lower()
            distress_keywords = [
                "lonely", "alone", "no point", "give up", "hopeless",
                "end it", "suicide", "kill myself", "self harm", "can't go on",
                "nobody cares", "don't want to live", "disappear",
                "worthless", "burden", "no reason to live"
            ]
            needs_support = any(kw in lower_msg for kw in distress_keywords)

    except Exception as e:
        print(f"[Gemini] Error generating response: {e}")
        # Fallback empathetic response
        reply_text = (
            "I hear you, and what you're feeling is valid. "
            "Thank you for sharing that with me. "
            "Would you like to tell me more about what's on your mind?"
        )

    # Log to Langfuse
    trace_id = log_trace(
        session_id=session_id,
        input_text=user_prompt,
        output_text=reply_text,
        prompt_version=SYSTEM_PROMPT_NAME,
    )

    return {"reply": reply_text, "trace_id": trace_id, "needs_support": needs_support}
