import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Send, LayoutDashboard } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import CopingCard from "@/components/CopingCard";
import CrisisSupportCard from "@/components/CrisisSupportCard";
import SupportActionCard from "@/components/SupportActionCard";
import PhoneInputModal from "@/components/PhoneInputModal";
import QuickReplyButtons from "@/components/QuickReplyButtons";
import AvatarWidget from "@/components/AvatarWidget";
import VoiceWaveform from "@/components/VoiceWaveform";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const API_BASE = "http://localhost:8000";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  type?: "text" | "coping" | "crisis";
};

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hi there 🌿 I'm Nalam, your mental health companion. How are you feeling today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showCoping, setShowCoping] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [currentMood, setCurrentMood] = useState<"calm" | "anxious" | "sad" | "happy">("calm");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [phqScore, setPhqScore] = useState(0);
  const [gadScore, setGadScore] = useState(0);
  const [severity, setSeverity] = useState("minimal");
  const [showSupportCard, setShowSupportCard] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/session/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: "en" }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
          console.log("[Nalam] Session created:", data.session_id);
        } else {
          console.error("[Nalam] Failed to create session, using fallback");
          setSessionId(`sess_local_${Date.now()}`);
        }
      } catch (err) {
        console.error("[Nalam] Session creation error:", err);
        setSessionId(`sess_local_${Date.now()}`);
      }
    };
    createSession();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showCoping, showCrisis, showSupportCard, isLoading]);

  const mapAvatarState = (state: string): "calm" | "anxious" | "sad" | "happy" => {
    if (state === "anxious" || state === "stressed") return "anxious";
    if (state === "sad" || state === "crisis") return "sad";
    if (state === "happy" || state === "positive") return "happy";
    return "calm";
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: nextId.current++, text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setShowQuickReplies(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          language: "en",
          avatar_id: "avatar_001",
          phq_score_current: phqScore,
          gad_score_current: gadScore,
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = await res.json();

      // Update scores from backend
      if (data.phq_score_updated !== undefined) setPhqScore(data.phq_score_updated);
      if (data.gad_score_updated !== undefined) setGadScore(data.gad_score_updated);

      // Handle crisis response
      if (data.crisis_detected) {
        setShowCrisis(true);
        setCurrentMood("sad");
        setMessages(prev => [...prev, {
          id: nextId.current++,
          text: data.reply,
          isUser: false,
          type: "crisis",
        }]);
        setIsLoading(false);
        return;
      }

      setShowCrisis(false);

      // Update avatar mood from backend
      if (data.avatar_state) {
        setCurrentMood(mapAvatarState(data.avatar_state));
      }

      // Add AI reply
      setMessages(prev => [...prev, {
        id: nextId.current++,
        text: data.reply,
        isUser: false,
      }]);

      // Show coping card if backend suggests one
      if (data.coping_card) {
        setShowCoping(true);
      }

      // Update severity
      if (data.severity) {
        setSeverity(data.severity);
      }

      // Show support action card if Gemini detects distress
      if (data.needs_support) {
        setShowSupportCard(true);
      } else {
        setShowSupportCard(false);
      }

    } catch (err) {
      console.error("[Nalam] Chat API error:", err);
      setMessages(prev => [...prev, {
        id: nextId.current++,
        text: "I'm having trouble connecting right now. Please make sure the backend server is running on http://localhost:8000 and try again. 🔄",
        isUser: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <ParticleBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30 backdrop-blur-xl bg-card/30 shadow-elevated">
        <div className="flex items-center gap-3">
          <AvatarWidget mood={currentMood} size="sm" />
          <div>
            <h2 className="text-sm font-display font-semibold text-foreground">Nalam AI</h2>
            <p className="text-xs text-primary">● Online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-muted transition-all duration-200 hover:shadow-card"
          >
            <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} delay={i === messages.length - 1 ? 0.1 : 0} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card/50 backdrop-blur-sm w-fit"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-muted-foreground">Nalam is thinking...</span>
          </motion.div>
        )}

        {showCrisis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CrisisSupportCard />
          </motion.div>
        )}

        {/* Support Action Card — therapist booking + voice call */}
        {showSupportCard && !showCrisis && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <SupportActionCard
              sessionId={sessionId}
              severity={severity}
              phqScore={phqScore}
              gadScore={gadScore}
              onRequestCall={() => setShowPhoneModal(true)}
            />
          </motion.div>
        )}

        {showCoping && !showCrisis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 overflow-x-auto pb-2"
          >
            <CopingCard title="Box Breathing" description="4-4-4-4 breathing to calm your nervous system" type="breathing" />
            <CopingCard title="5-4-3-2-1 Grounding" description="Use your senses to anchor yourself" type="grounding" />
            <CopingCard title="Study Focus Reset" description="Pomodoro-style reset for exam stress" type="focus" />
          </motion.div>
        )}

        {showQuickReplies && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <QuickReplyButtons onSelect={(emotion) => sendMessage(`I'm feeling ${emotion.toLowerCase()}`)} />
          </motion.div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="relative z-10 px-4 py-1">
        <p className="text-[10px] text-muted-foreground/40 text-center">
          ⚕️ Not a substitute for professional therapy
        </p>
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-2 shadow-elevated">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-xl transition-all duration-200 ${isRecording ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`}
          >
            {isRecording ? <VoiceWaveform active /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none font-body"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200 hover:shadow-card disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Phone Input Modal */}
      <PhoneInputModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSubmit={async (phone) => {
          const res = await fetch(`${API_BASE}/api/call/trigger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, phone_number: phone }),
          });
          if (!res.ok) throw new Error("Call trigger failed");
          const data = await res.json();
          if (data.status !== "success") throw new Error(data.message);
        }}
      />
    </div>
  );
};

export default Chat;
