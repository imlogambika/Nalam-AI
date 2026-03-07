import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import MetricCard from "@/components/twin/MetricCard";
import MoodChart from "@/components/twin/MoodChart";
import { AlertTriangle, TrendingUp } from "lucide-react";

const metrics = [
  { emoji: "😴", label: "Sleep", value: "6.2h" },
  { emoji: "🚶", label: "Steps", value: "3,200" },
  { emoji: "💧", label: "Water", value: "4/8" },
  { emoji: "❤️", label: "Heart", value: "78bpm" },
  { emoji: "📱", label: "Screen", value: "6.5h" },
  { emoji: "🌬️", label: "AQI", value: "312" },
];

const DigitalTwin = () => (
  <div className="min-h-screen bg-background">
    <NavBar />
    <div className="pt-20 pb-16 px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s ease-out" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Your Digital Twin</h1>
            <p className="text-xs text-muted-foreground font-body">7-Day Health + Mood Overview</p>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: "slideUp 0.5s ease-out" }}>
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* AQI Alert */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-soft" style={{ animation: "slideUp 0.6s ease-out" }}>
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={14} className="text-destructive" strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-sm font-display font-semibold text-foreground">Air Quality Alert</h4>
          <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
            AQI is hazardous today. This can worsen anxiety. Try indoor breathing exercises instead of outdoor activities.
          </p>
        </div>
      </div>

      {/* Mood Chart */}
      <div style={{ animation: "slideUp 0.7s ease-out" }}>
        <MoodChart />
      </div>

      {/* Log button */}
      <div className="mt-6" style={{ animation: "slideUp 0.8s ease-out" }}>
        <button className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm shadow-card hover:shadow-elevated transition-all duration-200">
          Log Today's Data →
        </button>
      </div>
    </div>
    <Disclaimer />
  </div>
);

export default DigitalTwin;
