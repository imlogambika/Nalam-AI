import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ThumbsUp, ThumbsDown } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import ChatBubble from "@/components/chat/ChatBubble";
import QuickReplies from "@/components/chat/QuickReplies";
import CopingCard from "@/components/chat/CopingCard";
import CrisisCard from "@/components/chat/CrisisCard";
import DKMSCard from "@/components/chat/DKMSCard";
import { useApp } from "@/contexts/AppContext";
import { sendMessage, submitFeedback, type ChatResponse, type CopingCard as CopingCardType } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "bot";
  message: string;
  timestamp: string;
  traceId?: string;
  sentiment?: number;
  avatarState?: string;
}

const Chat = () => {
  const { state, updateScores, setState } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      message: `Hi there 👋 I'm Nalam AI, your mental health companion. How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showDKMS, setShowDKMS] = useState(false);
  const [dkmsPhase, setDkmsPhase] = useState(1);
  const [currentCoping, setCurrentCoping] = useState<CopingCardType | null>(null);
  const [showBookingCTA, setShowBookingCTA] = useState(false);
  const [lastTraceId, setLastTraceId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showCrisis, currentCoping, showDKMS]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", message: msg, timestamp: now }]);
    setInput("");
    setCurrentCoping(null);
    setShowCrisis(false);
    setShowDKMS(false);
    setShowBookingCTA(false);
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendMessage({
        session_id: state.sessionId,
        avatar_id: state.avatarId,
        message: msg,
        language: state.language,
        phq_score_current: state.phqScore,
        gad_score_current: state.gadScore,
      });

      const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message: response.reply,
          timestamp: botTimestamp,
          traceId: response.langfuse_trace_id,
          sentiment: response.sentiment_score,
          avatarState: response.avatar_state,
        },
      ]);

      // Update scores in context
      updateScores(response.phq_score_updated, response.gad_score_updated, response.severity);

      // Update avatar state
      setState((prev) => ({ ...prev, avatarState: response.avatar_state }));

      // Set coping card
      if (response.coping_card) {
        setCurrentCoping(response.coping_card);
      }

      // Crisis detection
      if (response.crisis_detected) {
        setShowCrisis(true);
      }

      // DKMS trigger
      if (response.dkms_triggered) {
        setShowDKMS(true);
      }

      // Doctor booking CTA
      if (response.book_doctor_cta) {
        setShowBookingCTA(true);
      }

      // Store trace ID for feedback
      if (response.langfuse_trace_id) {
        setLastTraceId(response.langfuse_trace_id);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      // Fallback to offline response
      const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message: "I hear you, and what you're feeling is valid. Thank you for sharing. Would you like to tell me more?",
          timestamp: botTimestamp,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (rating: number) => {
    if (lastTraceId) {
      try {
        await submitFeedback(state.sessionId, lastTraceId, rating);
      } catch (e) {
        console.error("Feedback error:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-40 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-4 py-6">
          {messages.map((msg, i) => (
            <div key={i}>
              <ChatBubble role={msg.role} message={msg.message} timestamp={msg.timestamp} />
              {/* Feedback buttons for bot messages */}
              {msg.role === "bot" && msg.traceId && i === messages.length - 1 && (
                <div className="flex gap-2 ml-4 mt-1">
                  <button
                    onClick={() => handleFeedback(1)}
                    className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                    title="Helpful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    onClick={() => handleFeedback(0)}
                    className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                    title="Not helpful"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {currentCoping && (
            <CopingCard
              title={currentCoping.title}
              description={currentCoping.description}
              category={currentCoping.category as "anxiety" | "depression" | "stress"}
              interactive={currentCoping.interactive}
            />
          )}

          {showCrisis && <CrisisCard />}

          {showDKMS && <DKMSCard phase={dkmsPhase} sessionId={state.sessionId} />}

          {showBookingCTA && !showCrisis && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-slide-up shadow-soft">
              <p className="text-sm text-foreground font-body mb-3">
                Based on our conversation, it might be helpful to talk to a professional. Would you like to book an anonymous session?
              </p>
              <button
                onClick={() => navigate("/book")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-body font-semibold hover:shadow-card transition-all duration-200"
              >
                Book a Session →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-8 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <QuickReplies onSelect={handleSend} />
          <div className="flex items-center gap-2.5 mt-2">
            <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 shadow-soft">
              <Mic size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type how you're feeling..."
              disabled={isLoading}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 font-body shadow-soft transition-all duration-200 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-card hover:shadow-elevated transition-all duration-200 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};

export default Chat;
