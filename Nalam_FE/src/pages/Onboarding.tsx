import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AvatarWidget from "@/components/AvatarWidget";
import LanguageSelector from "@/components/LanguageSelector";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const moods = ["calm", "happy", "anxious", "sad"] as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("nalam_language") || "en";
  });
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number]>("calm");
  const [step, setStep] = useState(0);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem("nalam_language", code);
  };

  const handleContinue = () => {
    localStorage.setItem("nalam_language", language);
    localStorage.setItem("nalam_mood", selectedMood);
    navigate("/chat");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-0 flex items-center gap-3"
        >
          <ThemeToggle />
          <LanguageSelector selected={language} onSelect={handleLanguageChange} />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-8 animate-glow-pulse shadow-elevated"
              >
                <span className="text-3xl">🧠</span>
              </motion.div>

              <h1 className="text-4xl font-display font-bold text-foreground mb-3 glow-text">
                Nalam AI
              </h1>
              <p className="text-lg text-muted-foreground mb-2 font-body">
                Your personal mental health companion
              </p>
              <p className="text-sm text-muted-foreground/70 mb-10 max-w-xs">
                Private. Compassionate. Always here for you.
              </p>

              <button
                onClick={() => setStep(1)}
                className="btn-glow px-8 py-4 text-base font-semibold tracking-wide"
              >
                Start My Journey
              </button>

              <p className="mt-8 text-xs text-muted-foreground/50 max-w-[280px] leading-relaxed">
                ⚕️ Nalam AI is not a substitute for professional mental health therapy. If you are in crisis, please contact a qualified professional.
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
                How are you feeling?
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Your avatar reflects your emotional state
              </p>

              <AvatarWidget mood={selectedMood} size="lg" />

              <div className="flex gap-3 mt-8 flex-wrap justify-center">
                {moods.map((mood) => (
                  <motion.button
                    key={mood}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium border transition-all duration-300 ${
                      selectedMood === mood
                        ? "bg-primary/20 border-primary/40 text-primary shadow-card-hover"
                        : "border-border bg-card/40 text-muted-foreground hover:border-primary/20 shadow-card"
                    }`}
                  >
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleContinue}
                className="btn-glow px-8 py-4 text-base font-semibold mt-10"
              >
                Continue to Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
