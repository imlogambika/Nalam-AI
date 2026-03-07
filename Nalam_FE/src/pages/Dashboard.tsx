import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Footprints, Droplets, Heart, Smartphone, Wind, ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import MoodTrendChart from "@/components/MoodTrendChart";
import AvatarWidget from "@/components/AvatarWidget";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const insights = [
  { text: "Low sleep detected — try winding down earlier tonight", icon: Moon, color: "accent" as const },
  { text: "AQI 280 — high pollution may increase stress. Stay indoors.", icon: Wind, color: "accent" as const },
  { text: "Try a 4-4-4-4 breathing exercise to reset", icon: Heart, color: "primary" as const },
];

const Dashboard = () => {
  const navigate = useNavigate();

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

        {/* Avatar center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center my-6"
        >
          <AvatarWidget mood="calm" size="lg" />
          <p className="mt-3 text-sm text-muted-foreground">Digital Twin • Feeling Calm</p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard icon={Moon} label="Sleep" value="6.2" unit="hrs" color="info" trend="down" />
          <MetricCard icon={Footprints} label="Steps" value="4,230" unit="steps" color="primary" trend="up" />
          <MetricCard icon={Droplets} label="Water" value="1.8" unit="L" color="info" />
          <MetricCard icon={Heart} label="Heart Rate" value="72" unit="bpm" color="primary" trend="stable" />
          <MetricCard icon={Smartphone} label="Screen Time" value="5.4" unit="hrs" color="accent" trend="up" />
          <MetricCard icon={Wind} label="Air Quality" value="280" unit="AQI" color="accent" trend="up" />
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
    </div>
  );
};

export default Dashboard;
