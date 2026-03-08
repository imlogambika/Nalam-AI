"""
Gemini Service — LLM integration with Gemini 2.5 Flash.
Handles chat response generation with context-aware prompting.
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai
from services.langfuse_service import get_prompt, log_trace

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SYSTEM_PROMPT_NAME = "nalam-main-v1"

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


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
    """
    # Fetch versioned prompt from Langfuse
    system_prompt = get_prompt(SYSTEM_PROMPT_NAME)

    # Build context-aware prompt
    user_prompt = f"""
    Session context:
    - PHQ-9 score so far: {phq_score}/27
    - GAD-7 score so far: {gad_score}/21
    - Language: {language}
    - Medical context from books: {rag_context if rag_context else "None available"}

    User message: {message}
    """

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt,
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
        reply_text = response.text
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

    return {"reply": reply_text, "trace_id": trace_id}
