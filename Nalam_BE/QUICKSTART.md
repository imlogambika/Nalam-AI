# 🚀 Nalam AI Backend - Quick Start Guide

## Prerequisites

- Python 3.11+
- Supabase account (free tier)
- Langfuse account (free tier)
- Gemini API key (Google AI Studio)

---

## Step 1: Install Dependencies

```bash
cd Nalam_BE
pip install -r requirements.txt
```

---

## Step 2: Setup Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and fill in your API keys:

### Required (Must have):
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx
LANGFUSE_HOST=https://cloud.langfuse.com
```

### Optional (For full features):
```env
HUGGINGFACE_API_KEY=hf_xxx
SARVAM_API_KEY=your_sarvam_key
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENWEATHERMAP_API_KEY=your_openweather_key
CAL_API_KEY=your_cal_api_key
CAL_EVENT_TYPE_ID=your_event_type_id
```

---

## Step 3: Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from:
   ```
   db/migrations/001_initial_schema.sql
   ```
4. Click **Run** to execute the migration
5. Verify tables are created:
   - sessions
   - coping_strategies (should have 20 rows)
   - twin_logs
   - bookings
   - langfuse_feedback
   - pdf_embeddings

---

## Step 4: Setup Langfuse

1. Go to https://cloud.langfuse.com
2. Create a new project: "Nalam AI"
3. Navigate to **Prompts** → **New Prompt**
4. Create prompt with name: `nalam-main-v1`
5. Paste the system prompt from `Documents/Langfuse_DB_Architecture.md`
6. Publish as version 1.0
7. Copy your API keys to `.env`

---

## Step 5: Get API Keys

### Gemini API (Required)
1. Go to https://aistudio.google.com/apikey
2. Create API key
3. Add to `.env` as `GEMINI_API_KEY`

### Supabase (Required)
1. Go to your Supabase project settings
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **anon public** key → `SUPABASE_KEY`

### HuggingFace (Optional - for sentiment analysis)
1. Go to https://huggingface.co/settings/tokens
2. Create token
3. Add to `.env` as `HUGGINGFACE_API_KEY`

### Sarvam AI (Optional - for regional voice)
1. Go to https://www.sarvam.ai/
2. Sign up and get API key
3. Add to `.env` as `SARVAM_API_KEY`

### ElevenLabs (Optional - for English voice)
1. Go to https://elevenlabs.io/
2. Sign up and get API key
3. Add to `.env` as `ELEVENLABS_API_KEY`

### OpenWeatherMap (Optional - for AQI)
1. Go to https://openweathermap.org/api
2. Sign up for free tier
3. Add to `.env` as `OPENWEATHERMAP_API_KEY`

### cal.com (Optional - for doctor booking)
1. Go to https://cal.com/
2. Setup account and get API key
3. Add to `.env` as `CAL_API_KEY`

---

## Step 6: Verify Setup

Run the verification script:

```bash
python verify_setup.py
```

This will check:
- ✓ All dependencies installed
- ✓ Environment variables set
- ✓ Database connection working
- ✓ Langfuse connection working
- ✓ Gemini API working

---

## Step 7: Run the Server

```bash
python main.py
```

Server will start at: **http://localhost:8000**

API documentation: **http://localhost:8000/docs**

---

## Step 8: Test the API

### Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "service": "Nalam AI Antigravity"
}
```

### Create Session
```bash
curl -X POST http://localhost:8000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

Expected response:
```json
{
  "session_id": "sess_abc123",
  "language": "en"
}
```

### Send Chat Message
```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_abc123",
    "message": "I have been feeling anxious lately",
    "language": "en",
    "avatar_id": "avatar_001",
    "phq_score_current": 0,
    "gad_score_current": 0
  }'
```

---

## Optional: Ingest PDF Documents

To enable RAG (Retrieval Augmented Generation):

1. Place your PDF files in a `pdfs/` directory
2. Run the ingestion script:
```bash
python scripts/ingest_pdfs.py
```

This will:
- Extract text from PDFs
- Generate embeddings using Gemini
- Store in pgvector database

---

## Troubleshooting

### Database Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check if Supabase project is active
- Ensure migration script was run successfully

### Langfuse Connection Error
- Verify API keys are correct
- Check if prompt `nalam-main-v1` exists
- Ensure Langfuse project is active

### Gemini API Error
- Verify API key is valid
- Check quota limits at https://aistudio.google.com/
- Ensure model name is correct: `gemini-2.5-flash-preview-05-20`

### Import Errors
- Run: `pip install -r requirements.txt`
- Ensure Python 3.11+ is being used

---

## Production Deployment

### Using Docker

```bash
docker build -t nalam-backend .
docker run -p 8000:8000 --env-file .env nalam-backend
```

### Using Render/Railway

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy from `main` branch
4. Service will auto-deploy on push

---

## Architecture Overview

```
Client Request
    ↓
FastAPI Router
    ↓
Service Layer (Crisis → Sentiment → RAG → Scoring → LLM)
    ↓
Database (Supabase PostgreSQL + pgvector)
    ↓
Observability (Langfuse)
    ↓
Response to Client
```

---

## Support

For issues or questions:
1. Check `AUDIT_REPORT.md` for known issues
2. Review `Documents/PRD_Nalam_AI.md` for feature specs
3. Check `Documents/Langfuse_DB_Architecture.md` for database schema

---

## Next Steps

1. ✅ Backend running
2. 🔄 Connect frontend (React app)
3. 🔄 Test all features end-to-end
4. 🔄 Prepare demo scenarios
5. 🔄 Deploy to production

---

**Ready to build something amazing! 🚀**
