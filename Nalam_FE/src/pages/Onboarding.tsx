import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, AvatarStyle, Language, MoodDefault } from "@/contexts/AppContext";
import nalamLogo from "@/assets/nalam-logo.png";
import { ArrowRight, Shield, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const avatarStyles: { value: AvatarStyle; label: string; emoji: string }[] = [
  { value: "minimalist", label: "Minimalist", emoji: "◯" },
  { value: "geometric", label: "Geometric", emoji: "◇" },
  { value: "abstract", label: "Abstract", emoji: "✦" },
  { value: "emoji", label: "Emoji", emoji: "😊" },
];

const languages: { value: Language; label: string; name: string }[] = [
  { value: "en", label: "EN", name: "English" },
  { value: "hi", label: "HI", name: "Hindi" },
  { value: "ta", label: "TA", name: "Tamil" },
  { value: "te", label: "TE", name: "Telugu" },
  { value: "bn", label: "BN", name: "Bengali" },
  { value: "kn", label: "KN", name: "Kannada" },
  { value: "ml", label: "ML", name: "Malayalam" },
];

const moods: { value: MoodDefault; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😊", label: "Good" },
  { value: "neutral", emoji: "😐", label: "Okay" },
  { value: "sad", emoji: "😔", label: "Low" },
];

const Onboarding = () => {
  const { state, setState, completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>(state.avatarStyle);
  const [selectedMood, setSelectedMood] = useState<MoodDefault>(state.defaultMood);
  const [selectedLang, setSelectedLang] = useState<Language>(state.language);

  const handleStart = () => {
    setState((prev) => ({
      ...prev,
      avatarStyle: selectedStyle,
      defaultMood: selectedMood,
      language: selectedLang,
    }));
    completeOnboarding();
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-6 py-4">
          <img src={nalamLogo} alt="Nalam AI" className="w-9 h-9 object-contain" />
          <div>
            <h2 className="font-display font-bold text-foreground text-base tracking-tight">Nalam AI</h2>
            <p className="text-xs text-muted-foreground font-body">Mental Health Companion</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10" style={{ animation: "slideUp 0.4s ease-out" }}>
          <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight mb-3">
            Welcome to Nalam AI
          </h1>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Your private, empathetic mental health companion. Let's personalize your experience in a few quick steps.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex gap-4 mb-10" style={{ animation: "slideUp 0.5s ease-out" }}>
          {[
            { icon: Shield, label: "Private & Secure" },
            { icon: Lock, label: "No PII Required" },
            { icon: Heart, label: "Evidence-Based" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Icon size={14} className="text-primary" strokeWidth={2} />
              {label}
            </div>
          ))}
        </div>

        {/* Avatar Style */}
        <div className="mb-8" style={{ animation: "slideUp 0.55s ease-out" }}>
          <label className="text-sm font-display font-semibold text-foreground mb-3 block">Avatar Style</label>
          <div className="grid grid-cols-2 gap-2.5">
            {avatarStyles.map((s) => (
              <button
                key={s.value}
                onClick={() => setSelectedStyle(s.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200 ${
                  selectedStyle === s.value
                    ? "border-primary bg-primary/5 text-foreground shadow-soft"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Default Mood */}
        <div className="mb-8" style={{ animation: "slideUp 0.6s ease-out" }}>
          <label className="text-sm font-display font-semibold text-foreground mb-3 block">How are you feeling today?</label>
          <div className="flex gap-3">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-body transition-all duration-200 ${
                  selectedMood === m.value
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/30 hover:bg-secondary/50"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className={`text-xs font-medium ${selectedMood === m.value ? "text-primary" : "text-muted-foreground"}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mb-10" style={{ animation: "slideUp 0.65s ease-out" }}>
          <label className="text-sm font-display font-semibold text-foreground mb-3 block">Language</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.value}
                onClick={() => setSelectedLang(l.value)}
                className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200 ${
                  selectedLang === l.value
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          className="w-full py-6 text-base rounded-xl bg-primary text-primary-foreground font-display font-bold shadow-card hover:shadow-elevated transition-all duration-200"
          style={{ animation: "slideUp 0.7s ease-out" }}
        >
          Get Started <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
