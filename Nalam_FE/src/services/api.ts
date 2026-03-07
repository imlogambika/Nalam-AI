/**
 * Nalam AI — API Service Layer
 * Connects the React frontend to the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ChatRequest {
  session_id: string;
  avatar_id?: string;
  message: string;
  language: string;
  voice_mode?: boolean;
  phq_score_current: number;
  gad_score_current: number;
}

interface CopingCard {
  strategy_id?: string;
  title: string;
  description: string;
  category: string;
  severity?: string;
  interactive: boolean;
}

interface CrisisContact {
  name: string;
  phone: string;
}

interface ChatResponse {
  reply: string;
  sentiment_score: number;
  avatar_state: string;
  phq_score_updated: number;
  gad_score_updated: number;
  severity: string;
  coping_card: CopingCard | null;
  crisis_detected: boolean;
  crisis_contacts?: CrisisContact[];
  dkms_triggered: boolean;
  book_doctor_cta: boolean;
  langfuse_trace_id?: string;
}

interface VoiceRequest {
  session_id: string;
  audio_base64: string;
  language: string;
  avatar_id?: string;
}

interface VoiceResponse {
  transcript: string;
  reply_text: string;
  reply_audio_base64: string;
  sentiment_score: number;
  avatar_state: string;
}

interface SessionCreateResponse {
  session_id: string;
  language: string;
}

interface AvatarCreateRequest {
  session_id: string;
  style: string;
  skin_tone: number;
  default_mood: string;
  language: string;
}

interface AvatarCreateResponse {
  avatar_id: string;
  avatar_url: string;
  mood_states: Record<string, string>;
}

interface TwinLogRequest {
  session_id: string;
  date?: string;
  sleep_hours: number;
  steps: number;
  water_glasses: number;
  screen_time_hours: number;
  heart_rate_bpm: number;
  aqi_auto: boolean;
}

interface TwinAlert {
  type: string;
  message: string;
  action: string;
}

interface TwinLogResponse {
  twin_score: number;
  aqi: number;
  aqi_level: string;
  alerts: TwinAlert[];
  mood_correlation: string;
}

interface BookingRequest {
  session_id: string;
  severity: string;
  phq_score: number;
  gad_score: number;
}

interface BookingResponse {
  booking_id: string;
  status: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ===================== Session =====================

export async function createSession(language: string = "en"): Promise<SessionCreateResponse> {
  return apiRequest<SessionCreateResponse>("/api/session/create", {
    method: "POST",
    body: JSON.stringify({ language }),
  });
}

// ===================== Chat =====================

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  return apiRequest<ChatResponse>("/api/chat/message", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function sendVoiceMessage(request: VoiceRequest): Promise<VoiceResponse> {
  return apiRequest<VoiceResponse>("/api/chat/voice", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function submitFeedback(
  session_id: string,
  trace_id: string,
  rating: number
): Promise<void> {
  await apiRequest("/api/feedback/rate", {
    method: "POST",
    body: JSON.stringify({ session_id, trace_id, rating }),
  });
}

// ===================== Avatar =====================

export async function createAvatar(request: AvatarCreateRequest): Promise<AvatarCreateResponse> {
  return apiRequest<AvatarCreateResponse>("/api/avatar/create", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getAvatarUrl(avatarId: string, state: string): string {
  return `${API_BASE_URL}/api/avatar/${avatarId}/${state}`;
}

// ===================== Digital Twin =====================

export async function logTwinData(request: TwinLogRequest): Promise<TwinLogResponse> {
  return apiRequest<TwinLogResponse>("/api/twin/log", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getTwinHistory(sessionId: string): Promise<{ history: any[] }> {
  return apiRequest(`/api/twin/${sessionId}/history`);
}

// ===================== Booking =====================

export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  return apiRequest<BookingResponse>("/api/booking/create", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ===================== Crisis =====================

export async function getCrisisContacts(): Promise<{ contacts: CrisisContact[] }> {
  return apiRequest("/api/crisis/contacts");
}

export async function logCrisis(sessionId: string): Promise<void> {
  await apiRequest(`/api/crisis/log?session_id=${sessionId}`, {
    method: "POST",
  });
}

// ===================== DKMS =====================

export async function registerDKMS(
  sessionId: string
): Promise<{ status: string; message: string }> {
  return apiRequest("/api/dkms/register", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
}

// ===================== Health Check =====================

export async function healthCheck(): Promise<{ status: string; version: string }> {
  return apiRequest("/health");
}

// Export types for use in components
export type {
  ChatRequest,
  ChatResponse,
  CopingCard,
  CrisisContact,
  VoiceRequest,
  VoiceResponse,
  SessionCreateResponse,
  AvatarCreateRequest,
  AvatarCreateResponse,
  TwinLogRequest,
  TwinLogResponse,
  TwinAlert,
  BookingRequest,
  BookingResponse,
};
