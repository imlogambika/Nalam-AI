import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import ChatBubble from "@/components/chat/ChatBubble";
import QuickReplies from "@/components/chat/QuickReplies";
import CopingCard from "@/components/chat/CopingCard";
import CrisisCard from "@/components/chat/CrisisCard";
import { useApp } from "@/contexts/AppContext";

interface Message {
  role: "user" | "bot";
  message: string;
  timestamp: string;
}

const botResponses = [
  {
    reply: "I hear you. That sounds really tough. Can you tell me more about what's been weighing on you?",
    copingCard: null,
  },
  {
    reply: "Thank you for sharing that with me. It takes courage to open up. Have you tried any breathing exercises when you feel this way?",
    copingCard: {
      title: "Box Breathing Exercise",
      description: "Breathe in for 4 seconds → hold for 4 → breathe out for 4 → hold for 4. Repeat 4 times.",
      category: "anxiety" as const,
      interactive: true,
    },
  },
  {
    reply: "I understand. Remember, what you're feeling is valid. Let's try something that might help ground you in the present moment.",
    copingCard: {
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present.",
      category: "stress" as const,
      interactive: false,
    },
  },
  {
    reply: "You're doing great by talking about this. Small steps matter. Would you like to explore what activities help lift your mood?",
    copingCard: {
      title: "Behavioral Activation",
      description: "Pick one small, meaningful activity today — a short walk, calling a friend, or cooking something you enjoy.",
      category: "depression" as const,
      interactive: false,
    },
  },
];

const crisisKeywords = ["end it all", "don't want to be here", "self harm", "suicide", "kill myself"];

const Chat = () => {
  const { state } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      message: `Hi there 👋 I'm Nalam AI, your mental health companion. How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [responseIndex, setResponseIndex] = useState(0);
  const [showCrisis, setShowCrisis] = useState(false);
  const [currentCoping, setCurrentCoping] = useState<typeof botResponses[0]["copingCard"]>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showCrisis, currentCoping]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", message: msg, timestamp: now }]);
    setInput("");
    setCurrentCoping(null);

    const isCrisis = crisisKeywords.some((kw) => msg.toLowerCase().includes(kw));

    setTimeout(() => {
      if (isCrisis) {
        setShowCrisis(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: "I'm really glad you reached out to me. What you're feeling matters, and you don't have to face this alone. Please talk to someone who can help right now.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setShowCrisis(false);
        const resp = botResponses[responseIndex % botResponses.length];
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: resp.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setCurrentCoping(resp.copingCard);
        setResponseIndex((i) => i + 1);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-40 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-4 py-6">
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} message={msg.message} timestamp={msg.timestamp} />
          ))}

          {currentCoping && (
            <CopingCard
              title={currentCoping.title}
              description={currentCoping.description}
              category={currentCoping.category}
              interactive={currentCoping.interactive}
            />
          )}

          {showCrisis && <CrisisCard />}
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
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 font-body shadow-soft transition-all duration-200"
            />
            <button
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-card hover:shadow-elevated transition-all duration-200"
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
