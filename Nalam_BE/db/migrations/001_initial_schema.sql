-- Nalam AI Database Schema
-- Run this in Supabase SQL Editor

-- Anonymous sessions (no PII ever)
CREATE TABLE IF NOT EXISTS sessions (
  id              VARCHAR(20) PRIMARY KEY,
  created_at      TIMESTAMP DEFAULT NOW(),
  language        VARCHAR(5) DEFAULT 'en',
  avatar_id       VARCHAR(20),
  phq_score       INTEGER DEFAULT 0,
  gad_score       INTEGER DEFAULT 0,
  severity        VARCHAR(20) DEFAULT 'minimal',
  total_turns     INTEGER DEFAULT 0,
  crisis_detected BOOLEAN DEFAULT FALSE,
  dkms_informed   BOOLEAN DEFAULT FALSE,
  dkms_registered BOOLEAN DEFAULT FALSE,
  doctor_booked   BOOLEAN DEFAULT FALSE
);

-- Coping strategies library
CREATE TABLE IF NOT EXISTS coping_strategies (
  id          VARCHAR(20) PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category    VARCHAR(20),
  severity    VARCHAR(20),
  interactive BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Digital Twin health logs
CREATE TABLE IF NOT EXISTS twin_logs (
  id                  SERIAL PRIMARY KEY,
  session_id          VARCHAR(20) REFERENCES sessions(id),
  log_date            DATE DEFAULT CURRENT_DATE,
  sleep_hours         FLOAT,
  steps               INTEGER,
  water_glasses       INTEGER,
  screen_time_hours   FLOAT,
  heart_rate_bpm      INTEGER,
  aqi                 INTEGER,
  aqi_level           VARCHAR(30),
  twin_score          INTEGER,
  alerts              JSONB,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Doctor bookings (no PII)
CREATE TABLE IF NOT EXISTS bookings (
  id                  SERIAL PRIMARY KEY,
  session_id          VARCHAR(20) REFERENCES sessions(id),
  cal_event_id        VARCHAR(100),
  severity_at_booking VARCHAR(20),
  phq_at_booking      INTEGER,
  gad_at_booking      INTEGER,
  booked_at           TIMESTAMP DEFAULT NOW()
);

-- Langfuse feedback log
CREATE TABLE IF NOT EXISTS langfuse_feedback (
  id              SERIAL PRIMARY KEY,
  session_id      VARCHAR(20),
  trace_id        VARCHAR(100),
  prompt_version  VARCHAR(20),
  rating          INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- PDF embeddings for RAG
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS pdf_embeddings (
  id          SERIAL PRIMARY KEY,
  source      VARCHAR(100),
  chunk_text  TEXT,
  embedding   vector(768),
  page_num    INTEGER,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx
  ON pdf_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- pgvector similarity search function
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(768),
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id int,
  source varchar(100),
  chunk_text text,
  page_num int,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    source,
    chunk_text,
    page_num,
    1 - (embedding <=> query_embedding) AS similarity
  FROM pdf_embeddings
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Seed 20 coping strategies
INSERT INTO coping_strategies VALUES
('strat_001','Box Breathing','Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 cycles.','anxiety','mild',TRUE),
('strat_002','5-4-3-2-1 Grounding','Name 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste.','anxiety','mild',FALSE),
('strat_003','Progressive Muscle Relaxation','Tense and release each muscle group from toes upward.','anxiety','moderate',FALSE),
('strat_004','Behavioral Activation','Schedule one small meaningful activity per day.','depression','moderate',FALSE),
('strat_005','Thought Record (CBT)','Write triggering event, automatic thought, balanced thought.','depression','moderate',FALSE),
('strat_006','Gratitude Journal','Write 3 specific things you are grateful for today.','depression','mild',FALSE),
('strat_007','Pomodoro Study Reset','25 min work, 5 min break. After 4 cycles, 20 min break.','stress','mild',FALSE),
('strat_008','Cold Water Face Dip','Splash cold water on face for vagal nerve calming.','anxiety','moderate',FALSE),
('strat_009','Safe Place Visualization','Close eyes, visualize your calmest place in detail.','anxiety','moderate',FALSE),
('strat_010','Physical Exercise Burst','10 min brisk walk or jumping jacks to shift body chemistry.','depression','mild',FALSE),
('strat_011','Body Scan Meditation','Bring attention slowly from head to toe, noticing sensations.','anxiety','mild',FALSE),
('strat_012','Cognitive Reframing','Ask: Is this thought 100% true? What would I tell a friend?','depression','moderate',FALSE),
('strat_013','Social Connection','Text or call one trusted person today, even briefly.','depression','moderate',FALSE),
('strat_014','Sleep Hygiene Reset','No screens 1hr before bed. Same sleep/wake time daily.','depression','mild',FALSE),
('strat_015','Diaphragmatic Breathing','Hand on belly, breathe so belly (not chest) rises.','anxiety','mild',TRUE),
('strat_016','Worry Time Scheduling','Designate 15 min/day for worry. Outside that, postpone.','anxiety','moderate',FALSE),
('strat_017','Values Clarification','List top 3 values. Ask: Is today aligned with them?','depression','severe',FALSE),
('strat_018','Crisis Safety Plan','List warning signs, coping steps, trusted contacts, helplines.','general','severe',FALSE),
('strat_019','AQI Indoor Exercise','When AQI > 200, do yoga or stretching indoors instead.','stress','mild',FALSE),
('strat_020','STOP Technique','Stop. Take a breath. Observe your thoughts. Proceed mindfully.','general','all',FALSE)
ON CONFLICT (id) DO NOTHING;
