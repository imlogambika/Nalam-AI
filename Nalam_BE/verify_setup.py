"""
Nalam AI Backend - Setup Verification Script
Checks all dependencies, environment variables, and database connections.
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()


def check_env_var(name: str, required: bool = True) -> bool:
    """Check if environment variable is set."""
    value = os.getenv(name)
    if value:
        print(f"[OK] {name}: Set")
        return True
    else:
        status = "[X]" if required else "[!]"
        req_text = "REQUIRED" if required else "Optional"
        print(f"{status} {name}: Not set ({req_text})")
        return not required


def check_dependencies():
    """Check if all required Python packages are installed."""
    print("\n" + "="*60)
    print("CHECKING DEPENDENCIES")
    print("="*60)
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "supabase",
        "langfuse",
        "google.generativeai",
        "requests",
        "dotenv",
        "pydantic",
        "httpx",
    ]
    
    all_installed = True
    for package in required_packages:
        try:
            __import__(package.replace("-", "_").replace(".", "_"))
            print(f"[OK] {package}")
        except ImportError:
            print(f"[X] {package} - NOT INSTALLED")
            all_installed = False
    
    return all_installed


def check_environment():
    """Check all environment variables."""
    print("\n" + "="*60)
    print("CHECKING ENVIRONMENT VARIABLES")
    print("="*60)
    
    required_vars = [
        "GEMINI_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "LANGFUSE_PUBLIC_KEY",
        "LANGFUSE_SECRET_KEY",
    ]
    
    optional_vars = [
        "HUGGINGFACE_API_KEY",
        "SARVAM_API_KEY",
        "ELEVENLABS_API_KEY",
        "OPENWEATHERMAP_API_KEY",
        "CAL_API_KEY",
        "CAL_EVENT_TYPE_ID",
    ]
    
    all_required = all(check_env_var(var, required=True) for var in required_vars)
    
    print("\n[!] Optional Variables:")
    for var in optional_vars:
        check_env_var(var, required=False)
    
    return all_required


def check_database():
    """Check database connection."""
    print("\n" + "="*60)
    print("CHECKING DATABASE CONNECTION")
    print("="*60)
    
    try:
        from db.connection import get_db
        db = get_db()
        
        # Test connection by querying sessions table
        result = db.table("sessions").select("id").limit(1).execute()
        print("[OK] Database connection successful")
        print("[OK] Sessions table accessible")
        
        # Check if coping strategies are seeded
        strategies = db.table("coping_strategies").select("id").execute()
        strategy_count = len(strategies.data) if strategies.data else 0
        
        if strategy_count >= 20:
            print(f"[OK] Coping strategies seeded ({strategy_count} strategies)")
        elif strategy_count > 0:
            print(f"[!] Only {strategy_count} coping strategies found (expected 20)")
        else:
            print("[X] No coping strategies found - run migration script")
        
        # Check pgvector extension
        embeddings = db.table("pdf_embeddings").select("id").limit(1).execute()
        print("[OK] pgvector table accessible")
        
        return True
    except Exception as e:
        print(f"[X] Database connection failed: {e}")
        return False


def check_langfuse():
    """Check Langfuse connection."""
    print("\n" + "="*60)
    print("CHECKING LANGFUSE CONNECTION")
    print("="*60)
    
    try:
        from services.langfuse_service import get_langfuse_client
        client = get_langfuse_client()
        print("[OK] Langfuse client initialized")
        
        # Try to fetch prompt
        from services.langfuse_service import get_prompt
        prompt = get_prompt("nalam-main-v1")
        if prompt:
            print("[OK] Prompt 'nalam-main-v1' found in Langfuse")
        else:
            print("[!] Prompt 'nalam-main-v1' not found - create it in Langfuse dashboard")
        
        return True
    except Exception as e:
        print(f"[X] Langfuse connection failed: {e}")
        return False


def check_gemini():
    """Check Gemini API connection."""
    print("\n" + "="*60)
    print("CHECKING GEMINI API")
    print("="*60)
    
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            print("[X] GEMINI_API_KEY not set")
            return False
        
        genai.configure(api_key=api_key)
        
        # Test with a simple generation
        model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
        response = model.generate_content(
            "Say 'OK' if you can hear me.",
            generation_config=genai.types.GenerationConfig(max_output_tokens=10)
        )
        
        if response.text:
            print("[OK] Gemini API connection successful")
            print("[OK] Model: gemini-2.5-flash-preview-05-20")
            return True
        else:
            print("[X] Gemini API returned empty response")
            return False
    except Exception as e:
        print(f"[X] Gemini API connection failed: {e}")
        return False


def main():
    """Run all checks."""
    print("\n" + "="*60)
    print("NALAM AI BACKEND - SETUP VERIFICATION")
    print("="*60)
    
    results = {
        "Dependencies": check_dependencies(),
        "Environment": check_environment(),
        "Database": check_database(),
        "Langfuse": check_langfuse(),
        "Gemini API": check_gemini(),
    }
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    all_passed = True
    for check, passed in results.items():
        status = "[OK] PASS" if passed else "[X] FAIL"
        print(f"{check}: {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*60)
    
    if all_passed:
        print("\n[OK] ALL CHECKS PASSED - READY TO RUN")
        print("\nStart the server with:")
        print("  python main.py")
        print("\nServer will be available at: http://localhost:8000")
        print("API docs at: http://localhost:8000/docs")
        return 0
    else:
        print("\n[X] SOME CHECKS FAILED")
        print("\nPlease fix the issues above before running the server.")
        print("\nSetup steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Copy .env.example to .env and fill in API keys")
        print("3. Run database migration in Supabase SQL Editor")
        print("4. Create Langfuse prompt 'nalam-main-v1'")
        return 1


if __name__ == "__main__":
    sys.exit(main())
