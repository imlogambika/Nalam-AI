# 🎯 Nalam AI Backend - Deployment Checklist

## ✅ Completed (By Audit)

- [x] Code audit completed
- [x] All critical security vulnerabilities fixed
- [x] Package dependencies updated to secure versions
- [x] HTTPS enforced for all external APIs
- [x] LLM token limits and timeouts added
- [x] Error handling improved
- [x] Timezone-aware datetime implemented
- [x] PRD compliance verified (100%)
- [x] Database schema validated
- [x] Documentation created (AUDIT_REPORT.md, QUICKSTART.md, SUMMARY.md)
- [x] Verification script created (verify_setup.py)

---

## 🔲 To Do (Setup & Deployment)

### Phase 1: Local Setup (30 minutes)

- [ ] **Install Dependencies**
  ```bash
  cd Nalam_BE
  pip install -r requirements.txt
  ```

- [ ] **Create .env File**
  ```bash
  copy .env.example .env
  ```

- [ ] **Get API Keys**
  - [ ] Gemini API: https://aistudio.google.com/apikey
  - [ ] Supabase: Create project at https://supabase.com
  - [ ] Langfuse: Create project at https://cloud.langfuse.com
  - [ ] HuggingFace (optional): https://huggingface.co/settings/tokens
  - [ ] Sarvam AI (optional): https://www.sarvam.ai/
  - [ ] ElevenLabs (optional): https://elevenlabs.io/
  - [ ] OpenWeatherMap (optional): https://openweathermap.org/api
  - [ ] cal.com (optional): https://cal.com/

- [ ] **Fill .env File**
  ```env
  GEMINI_API_KEY=your_key_here
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_KEY=your_key_here
  LANGFUSE_PUBLIC_KEY=pk-lf-xxx
  LANGFUSE_SECRET_KEY=sk-lf-xxx
  LANGFUSE_HOST=https://cloud.langfuse.com
  ```

### Phase 2: Database Setup (15 minutes)

- [ ] **Run Migration in Supabase**
  1. Open Supabase SQL Editor
  2. Copy content from `db/migrations/001_initial_schema.sql`
  3. Paste and run
  4. Verify tables created

- [ ] **Verify Seed Data**
  - [ ] Check `coping_strategies` table has 20 rows
  - [ ] Check `sessions` table exists
  - [ ] Check `pdf_embeddings` table exists (pgvector)

### Phase 3: Langfuse Setup (10 minutes)

- [ ] **Create Langfuse Project**
  1. Go to https://cloud.langfuse.com
  2. Create new project: "Nalam AI"
  3. Copy API keys to .env

- [ ] **Create System Prompt**
  1. Navigate to Prompts → New Prompt
  2. Name: `nalam-main-v1`
  3. Copy prompt from `Documents/Langfuse_DB_Architecture.md`
  4. Publish as version 1.0

### Phase 4: Verification (5 minutes)

- [ ] **Run Verification Script**
  ```bash
  python verify_setup.py
  ```

- [ ] **Check All Passes**
  - [ ] Dependencies: PASS
  - [ ] Environment: PASS
  - [ ] Database: PASS
  - [ ] Langfuse: PASS
  - [ ] Gemini API: PASS

### Phase 5: Testing (10 minutes)

- [ ] **Start Server**
  ```bash
  python main.py
  ```

- [ ] **Test Health Endpoint**
  ```bash
  curl http://localhost:8000/health
  ```

- [ ] **Test Session Creation**
  ```bash
  curl -X POST http://localhost:8000/api/session/create \
    -H "Content-Type: application/json" \
    -d '{"language": "en"}'
  ```

- [ ] **Test Chat Endpoint**
  - Use session_id from previous step
  - Send test message
  - Verify response

- [ ] **Check API Docs**
  - Open http://localhost:8000/docs
  - Verify all endpoints visible

### Phase 6: Optional Features (20 minutes)

- [ ] **PDF Ingestion (for RAG)**
  - [ ] Place PDFs in `pdfs/` directory
  - [ ] Run `python scripts/ingest_pdfs.py`
  - [ ] Verify embeddings in database

- [ ] **Voice Services**
  - [ ] Add Sarvam API key (regional languages)
  - [ ] Add ElevenLabs API key (English)
  - [ ] Test voice endpoints

- [ ] **AQI Service**
  - [ ] Add OpenWeatherMap API key
  - [ ] Test `/api/twin/log` endpoint

- [ ] **Doctor Booking**
  - [ ] Add cal.com API key
  - [ ] Test `/api/booking/create` endpoint

---

## 🚀 Production Deployment

### Option 1: Docker

- [ ] **Build Image**
  ```bash
  docker build -t nalam-backend .
  ```

- [ ] **Run Container**
  ```bash
  docker run -p 8000:8000 --env-file .env nalam-backend
  ```

### Option 2: Render/Railway

- [ ] Push code to GitHub
- [ ] Connect repository to Render/Railway
- [ ] Set environment variables in dashboard
- [ ] Deploy from main branch

### Option 3: Manual Server

- [ ] SSH into server
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Setup .env file
- [ ] Run with systemd/supervisor

---

## 🧪 Testing Checklist

- [ ] **Core Features**
  - [ ] Session creation works
  - [ ] Chat messages work
  - [ ] Crisis detection triggers
  - [ ] Sentiment analysis runs
  - [ ] PHQ-9/GAD-7 scoring updates
  - [ ] Coping strategies returned
  - [ ] Langfuse logging works

- [ ] **Digital Twin**
  - [ ] Health metrics logging
  - [ ] AQI fetching
  - [ ] Alert generation
  - [ ] History retrieval

- [ ] **Integrations**
  - [ ] Gemini API responds
  - [ ] Supabase queries work
  - [ ] Langfuse traces appear
  - [ ] RAG search returns results

---

## 📊 Monitoring

- [ ] **Langfuse Dashboard**
  - [ ] Traces appearing
  - [ ] Prompt versions tracked
  - [ ] User feedback logged

- [ ] **Supabase Dashboard**
  - [ ] Sessions being created
  - [ ] Logs being written
  - [ ] No errors in logs

- [ ] **Server Logs**
  - [ ] No error messages
  - [ ] Response times < 3s
  - [ ] All services connecting

---

## 🎯 Demo Preparation

- [ ] **Test Scenarios**
  - [ ] Anxious student (Hindi) - GAD-7 flow
  - [ ] Depressed student - PHQ-9 → doctor booking
  - [ ] Crisis message - emergency contacts
  - [ ] DKMS trigger - blood cancer awareness
  - [ ] Digital Twin - AQI + sleep correlation

- [ ] **Demo Data**
  - [ ] Create test sessions
  - [ ] Log sample health metrics
  - [ ] Test all features end-to-end

---

## ✅ Final Checks

- [ ] All environment variables set
- [ ] Database migration completed
- [ ] Langfuse prompt created
- [ ] Verification script passes
- [ ] Server starts without errors
- [ ] API endpoints respond
- [ ] Documentation reviewed
- [ ] Team briefed on features

---

## 🎉 Ready to Launch!

When all checkboxes are complete, you're ready to:
- ✅ Connect frontend
- ✅ Run end-to-end tests
- ✅ Deploy to production
- ✅ Demo to stakeholders

**Good luck with your hackathon! 🚀**
