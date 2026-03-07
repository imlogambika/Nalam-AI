import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Phone, MessageCircle } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const helplines = [
  { name: "Vandrevala Foundation", number: "9999666555", desc: "24/7 helpline — English, Hindi", available: true },
  { name: "iCall", number: "9152987821", desc: "Mon–Sat, 8am–10pm", available: true },
  { name: "AASRA", number: "9820466726", desc: "24/7 crisis support", available: true },
  { name: "iMind", number: "1800-599-0019", desc: "Toll-free, 10am–6pm", available: true },
  { name: "Campus Helpline", number: "Your University Counseling Center", desc: "Check your university website", available: false },
];

const CrisisSupport = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-all duration-200 hover:shadow-card">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Crisis Support</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Supportive message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-accent/30 p-6 rounded-2xl mb-6 text-center shadow-elevated"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex"
          >
            <Heart className="w-10 h-10 text-accent mb-4" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            You matter. You are not alone.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whatever you're going through right now, there are people who care and want to help. 
            Reaching out is a sign of strength, not weakness.
          </p>
        </motion.div>

        {/* Helpline cards */}
        <div className="space-y-3 mb-8">
          {helplines.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ x: 4 }}
              className="glass-card-glow p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{h.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                  {h.available && (
                    <p className="text-sm font-mono text-primary mt-1">{h.number}</p>
                  )}
                  {!h.available && (
                    <p className="text-xs text-muted-foreground/60 mt-1">{h.number}</p>
                  )}
                </div>
                {h.available && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={`tel:${h.number}`}
                    className="p-3 rounded-xl bg-accent/15 border border-accent/30 hover:bg-accent/25 transition-all duration-200 shadow-card"
                  >
                    <Phone className="w-5 h-5 text-accent" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back to chat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-card hover:border-primary/30 transition-all duration-200 text-sm text-foreground shadow-card"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            Continue talking with Nalam
          </motion.button>
        </motion.div>

        <p className="mt-8 mb-4 text-xs text-muted-foreground/40 text-center max-w-xs mx-auto">
          ⚕️ Nalam AI is not a substitute for professional mental health therapy. If you are in immediate danger, please call emergency services.
        </p>
      </div>
    </div>
  );
};

export default CrisisSupport;
