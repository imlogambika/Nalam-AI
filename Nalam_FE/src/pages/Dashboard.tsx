import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Footprints, Droplets, Heart, Smartphone, Wind,
  ArrowLeft, Calendar, AlertTriangle, MessageCircle, Send,
  Sliders, X, Sparkles, Loader2,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import MoodTrendChart from "@/components/MoodTrendChart";
import Avatar3D from "@/components/Avatar3D";
import { computeHealthScore, computeMoodFromScore } from "@/components/Avatar3D";
import type { HealthMetrics, Mood } from "@/components/Avatar3D";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const API_BASE = "http://localhost:8000";

const insights = [
  { text: "Low sleep detected — try winding down earlier tonight", icon: Moon, color: "accent" as const },
  { text: "AQI 280 — high pollution may increase stress. Stay indoors.", icon: Wind, color: "accent" as const },
  { text: "Try a 4-4-4-4 breathing exercise to reset", icon: Heart, color: "primary" as const },
];

// Metric config for editing
const metricDefs = [
  { key: "sleep" as const, label: "Sleep", unit: "hrs", min: 0, max: 12, step: 0.1, icon: Moon, color: "info" as const },
  { key: "steps" as const, label: "Steps", unit: "steps", min: 0, max: 20000, step: 100, icon: Footprints, color: "primary" as const },
  { key: "water" as const, label: "Water", unit: "L", min: 0, max: 5, step: 0.1, icon: Droplets, color: "info" as const },
  { key: "heartRate" as const, label: "Heart Rate", unit: "bpm", min: 40, max: 180, step: 1, icon: Heart, color: "primary" as const },
  { key: "screenTime" as const, label: "Screen Time", unit: "hrs", min: 0, max: 16, step: 0.1, icon: Smartphone, color: "accent" as const },
  { key: "aqi" as const, label: "Air Quality", unit: "AQI", min: 0, max: 500, step: 1, icon: Wind, color: "accent" as const },
];

// Tips to improve avatar health
function getAvatarTips(metrics: HealthMetrics): string[] {
  const tips: string[] = [];
  if (metrics.sleep && metrics.sleep < 7)
    tips.push("🛏️ Try to get at least 7 hours of sleep tonight. Your avatar will feel much more energetic!");
  if (metrics.steps && metrics.steps < 5000)
    tips.push("🚶 A short walk can boost your mood! Aim for 5,000+ steps to see your avatar perk up.");
  if (metrics.water && metrics.water < 2)
    tips.push("💧 Drink more water! 2L+ daily helps both you and your avatar stay hydrated and happy.");
  if (metrics.heartRate && metrics.heartRate > 90)
    tips.push("🧘 Your heart rate is elevated. Try some deep breathing to calm both you and your avatar.");
  if (metrics.screenTime && metrics.screenTime > 5)
    tips.push("📱 Too much screen time! Take a break — your avatar gets tired of screens too.");
  if (metrics.aqi && metrics.aqi > 150)
    tips.push("🌬️ Air quality is poor. Stay indoors — your avatar doesn't like pollution either!");
  if (tips.length === 0)
    tips.push("✨ Your avatar is thriving! Keep up the amazing self-care routine.");
  return tips;
}

type AvatarChatMsg = { id: number; text: string; isUser: boolean };

const Dashboard = () => {
  const navigate = useNavigate();

  // Editable health metrics
  const [metrics, setMetrics] = useState<HealthMetrics>({
    sleep: 6.2,
    steps: 4230,
    water: 1.8,
    heartRate: 72,
    screenTime: 5.4,
    aqi: 280,
  });

  const [showMetricEditor, setShowMetricEditor] = useState(false);
  const [showAvatarChat, setShowAvatarChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<AvatarChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const nextChatId = useRef(0);

  // Derived values
  const healthScore = computeHealthScore(metrics);
  const derivedMood = computeMoodFromScore(healthScore);

  // Trend arrows
  const getTrend = (key: string) => {
    if (key === "sleep" && metrics.sleep && metrics.sleep < 7) return "down" as const;
    if (key === "steps" && metrics.steps && metrics.steps > 4000) return "up" as const;
    if (key === "screenTime" && metrics.screenTime && metrics.screenTime > 5) return "up" as const;
    if (key === "aqi" && metrics.aqi && metrics.aqi > 200) return "up" as const;
    if (key === "heartRate") return "stable" as const;
    return undefined;
  };

  const formatValue = (key: string, value: number) => {
    if (key === "steps") return value.toLocaleString();
    if (key === "heartRate" || key === "aqi") return Math.round(value).toString();
    return value.toFixed(1);
  };

  const updateMetric = (key: keyof HealthMetrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  // Avatar chat scroll
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Initialize avatar chat greeting
  const openAvatarChat = () => {
    setShowAvatarChat(true);
    if (chatMessages.length === 0) {
      const tips = getAvatarTips(metrics);
      const greeting =
        derivedMood === "happy"
          ? "Hey! I'm feeling great today! 🌟 What would you like to know?"
          : derivedMood === "calm"
          ? "Hi there! I'm doing well. Want to chat about how to keep me happy? 💚"
          : derivedMood === "anxious"
          ? "Hey... I'm feeling a bit off today. Can you help me feel better? 🌊"
          : "Hi... I'm not feeling so good. Here's what could help me:";

      setChatMessages([{ id: nextChatId.current++, text: greeting, isUser: false }]);

      // Add tips after a short delay
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { id: nextChatId.current++, text: tips[0], isUser: false },
        ]);
      }, 800);
    }
  };

  const sendAvatarChat = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { id: nextChatId.current++, text, isUser: true }]);
    setChatLoading(true);

    // Try to get a response from Gemini about the avatar's health
    try {
      const prompt = `You are a cute digital wellness avatar companion named "Nalam Twin". Your current health score is ${healthScore}/100 and mood is "${derivedMood}". 
Health metrics: Sleep ${metrics.sleep}hrs, Steps ${metrics.steps}, Water ${metrics.water}L, Heart Rate ${metrics.heartRate}bpm, Screen Time ${metrics.screenTime}hrs, AQI ${metrics.aqi}.
The user asked: "${text}"
Respond as the avatar in 1-2 short sentences. Be cute, friendly, and give specific actionable advice. Use emojis.`;

      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: `avatar_chat_${Date.now()}`,
          message: prompt,
          language: "en",
          avatar_id: "avatar_001",
          phq_score_current: 0,
          gad_score_current: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { id: nextChatId.current++, text: data.reply, isUser: false },
        ]);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback: use local tips
      const tips = getAvatarTips(metrics);
      const fallback = tips[Math.floor(Math.random() * tips.length)];
      setChatMessages((prev) => [
        ...prev,
        { id: nextChatId.current++, text: fallback, isUser: false },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-8 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button onClick={() => navigate("/chat")} className="p-2 rounded-xl hover:bg-muted transition-all duration-200 hover:shadow-card">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground">Wellness Dashboard</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => navigate("/booking")} className="p-2 rounded-xl hover:bg-muted transition-all duration-200 hover:shadow-card">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* 3D Avatar center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center my-6"
        >
          <Avatar3D
            mood={derivedMood}
            size="xl"
            interactive
            showStatus
            label="Your Digital Twin"
            healthMetrics={metrics}
            onAvatarTap={openAvatarChat}
          />

          {/* Action buttons under avatar */}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMetricEditor(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              Edit Metrics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAvatarChat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat with Twin
            </motion.button>
          </div>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {metricDefs.map((m) => (
            <MetricCard
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={formatValue(m.key, metrics[m.key] ?? 0)}
              unit={m.unit}
              color={m.color}
              trend={getTrend(m.key)}
            />
          ))}
        </div>

        {/* Mood chart */}
        <div className="mb-6">
          <MoodTrendChart />
        </div>

        {/* Insights */}
        <div className="space-y-3 mb-6">
          <h3 className="font-display text-base font-semibold text-foreground">Insights</h3>
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ x: 4 }}
              className="glass-card-glow p-4 rounded-2xl flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                insight.color === "accent" ? "bg-accent/15" : "bg-primary/15"
              }`}>
                <insight.icon className={`w-4 h-4 ${insight.color === "accent" ? "text-accent" : "text-primary"}`} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Crisis quick access */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate("/crisis")}
          className="w-full glass-card border-accent/30 p-4 rounded-2xl flex items-center gap-3 hover:border-accent/50 transition-all duration-300 hover:shadow-card-hover"
        >
          <AlertTriangle className="w-5 h-5 text-accent" />
          <span className="text-sm text-foreground">Need immediate support?</span>
          <span className="ml-auto text-xs text-accent font-medium">Get Help →</span>
        </motion.button>
      </div>

      {/* ──────── Metric Editor Modal ──────── */}
      <AnimatePresence>
        {showMetricEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMetricEditor(false)} />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-md glass-card rounded-2xl p-5 shadow-elevated border border-border/30 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">Edit Health Metrics</h3>
                </div>
                <button onClick={() => setShowMetricEditor(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Adjust values to see how your Digital Twin reacts in real-time! ✨
              </p>

              <div className="space-y-5">
                {metricDefs.map((m) => {
                  const val = metrics[m.key] ?? 0;
                  return (
                    <div key={m.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{m.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {formatValue(m.key, val)} {m.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={m.min}
                        max={m.max}
                        step={m.step}
                        value={val}
                        onChange={(e) => updateMetric(m.key, parseFloat(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((val - m.min) / (m.max - m.min)) * 100}%, var(--color-muted) ${((val - m.min) / (m.max - m.min)) * 100}%, var(--color-muted) 100%)`,
                        }}
                      />
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground/50">{m.min}</span>
                        <span className="text-[10px] text-muted-foreground/50">{m.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live preview */}
              <div className="mt-5 p-3 rounded-xl bg-muted/20 border border-border/20 text-center">
                <p className="text-xs text-muted-foreground">
                  Avatar Mood: <span className="font-semibold text-foreground capitalize">{derivedMood}</span>
                  {" • "}
                  Score: <span className="font-semibold text-primary">{healthScore}/100</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────── Avatar Chat Dialog ──────── */}
      <AnimatePresence>
        {showAvatarChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAvatarChat(false)} />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-md glass-card rounded-2xl shadow-elevated border border-border/30 overflow-hidden flex flex-col"
              style={{ maxHeight: "70vh" }}
            >
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                <div className="flex items-center gap-3">
                  <Avatar3D mood={derivedMood} size="sm" showStatus={false} interactive={false} />
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">Nalam Twin</h3>
                    <p className="text-[10px] text-primary">● Online • {derivedMood}</p>
                  </div>
                </div>
                <button onClick={() => setShowAvatarChat(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Chat messages */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 200 }}>
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.isUser
                          ? "bg-primary/15 text-foreground rounded-br-md"
                          : "bg-muted/40 text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/40 px-3.5 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                {["How can I make you happy?", "What should I improve?", "Give me wellness tips"].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendAvatarChat(q)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <div className="p-3 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAvatarChat(chatInput)}
                    placeholder="Ask your twin anything..."
                    className="flex-1 bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={() => sendAvatarChat(chatInput)}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
