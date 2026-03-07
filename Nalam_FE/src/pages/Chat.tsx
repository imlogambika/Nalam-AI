import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Send, LayoutDashboard } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import CopingCard from "@/components/CopingCard";
import CrisisSupportCard from "@/components/CrisisSupportCard";
import QuickReplyButtons from "@/components/QuickReplyButtons";
import AvatarWidget from "@/components/AvatarWidget";
import VoiceWaveform from "@/components/VoiceWaveform";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  type?: "text" | "coping" | "crisis";
};

const crisisKeywords = ["end it all", "don't want to be here", "self harm", "suicide", "kill myself"];

const aiResponses: Record<string, string> = {
  anxious: "I hear you. Feeling anxious can be overwhelming, but you're not alone. Let me suggest a quick breathing exercise that might help ground you right now. 🌊",
  stressed: "Stress is your body's way of responding to pressure. Let's work through this together. Would you like to try a grounding technique?",
  sad: "It takes courage to acknowledge sadness. I'm here with you. Sometimes talking about what's on your mind can help lighten the weight. 💙",
  okay: "That's good to hear! Even on okay days, it's great to check in with yourself. Is there anything specific you'd like to explore today?",
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showCoping, showCrisis]);

  const detectCrisis = (text: string) => {
    return crisisKeywords.some(kw => text.toLowerCase().includes(kw));
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: nextId.current++, text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setShowQuickReplies(false);

    if (detectCrisis(text)) {
      setShowCrisis(true);
      setCurrentMood("sad");
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: nextId.current++,
          text: "I can sense you're going through something very difficult right now. You are important, and help is available. Please reach out to one of these helplines. 💛",
          isUser: false,
          type: "crisis"
        }]);
      }, 800);
      return;
    }

    setShowCrisis(false);

    const lower = text.toLowerCase();
    if (lower.includes("anxious") || lower.includes("worried") || lower.includes("nervous")) {
      setCurrentMood("anxious");
    } else if (lower.includes("sad") || lower.includes("depressed") || lower.includes("low")) {
      setCurrentMood("sad");
    } else if (lower.includes("happy") || lower.includes("great") || lower.includes("good") || lower.includes("okay")) {
      setCurrentMood("happy");
    } else {
      setCurrentMood("calm");
    }

    setTimeout(() => {
      const matchedKey = Object.keys(aiResponses).find(k => lower.includes(k));
      const response = matchedKey
        ? aiResponses[matchedKey]
        : "Thank you for sharing that with me. Remember, every feeling is valid. Would you like to try a coping exercise, or would you prefer to keep talking? 🌱";

      setMessages(prev => [...prev, {
        id: nextId.current++,
        text: response,
        isUser: false,
      }]);

      if (lower.includes("anxious") || lower.includes("stressed") || lower.includes("sad")) {
        setShowCoping(true);
      }
    }, 1200);
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

        {showCrisis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CrisisSupportCard />
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
          />
          <button
            onClick={() => sendMessage(input)}
            className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200 hover:shadow-card"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
