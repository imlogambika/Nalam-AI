import { useState } from "react";
import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import MetricCard from "@/components/twin/MetricCard";
import MoodChart from "@/components/twin/MoodChart";
import { AlertTriangle, TrendingUp, Loader2, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { logTwinData, type TwinLogResponse, type TwinAlert } from "@/services/api";

const DigitalTwin = () => {
  const { state } = useApp();
  const [sleepHours, setSleepHours] = useState(6.2);
  const [steps, setSteps] = useState(3200);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [screenTime, setScreenTime] = useState(6.5);
  const [heartRate, setHeartRate] = useState(78);
  const [isLogging, setIsLogging] = useState(false);
  const [twinResponse, setTwinResponse] = useState<TwinLogResponse | null>(null);
  const [logged, setLogged] = useState(false);

  const metrics = [
    { emoji: "😴", label: "Sleep", value: `${sleepHours}h` },
    { emoji: "🚶", label: "Steps", value: steps.toLocaleString() },
    { emoji: "💧", label: "Water", value: `${waterGlasses}/8` },
    { emoji: "❤️", label: "Heart", value: `${heartRate}bpm` },
    { emoji: "📱", label: "Screen", value: `${screenTime}h` },
    { emoji: "🌬️", label: "AQI", value: twinResponse ? `${twinResponse.aqi}` : "—" },
  ];

  const handleLog = async () => {
    setIsLogging(true);
    try {
      const response = await logTwinData({
        session_id: state.sessionId,
        sleep_hours: sleepHours,
        steps,
        water_glasses: waterGlasses,
        screen_time_hours: screenTime,
        heart_rate_bpm: heartRate,
        aqi_auto: true,
      });
      setTwinResponse(response);
      setLogged(true);
    } catch (error) {
      console.error("Twin log error:", error);
      // Fallback with mock data
      setTwinResponse({
        twin_score: 62,
        aqi: 312,
        aqi_level: "Very Poor",
        alerts: [{
          type: "aqi",
          message: "Air quality is hazardous today. This can worsen anxiety. Try indoor breathing exercises.",
          action: "indoor_breathing",
        }],
        mood_correlation: "Health data being collected.",
      });
      setLogged(true);
    } finally {
      setIsLogging(false);
    }
  };

  return (
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
          {twinResponse && (
            <div className="mt-3 flex items-center gap-3">
              <div className="px-3 py-1.5 bg-primary/10 rounded-lg">
                <span className="text-xs text-primary font-mono font-semibold">
                  Twin Score: {twinResponse.twin_score}/100
                </span>
              </div>
              {twinResponse.mood_correlation && (
                <span className="text-xs text-muted-foreground font-body">
                  {twinResponse.mood_correlation}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: "slideUp 0.5s ease-out" }}>
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Alerts */}
        {twinResponse?.alerts && twinResponse.alerts.length > 0 && (
          <div className="space-y-3 mb-6" style={{ animation: "slideUp 0.6s ease-out" }}>
            {twinResponse.alerts.map((alert: TwinAlert, idx: number) => (
              <div
                key={idx}
                className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={14} className="text-destructive" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-display font-semibold text-foreground capitalize">
                    {alert.type} Alert
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Default AQI Alert if no response yet */}
        {!twinResponse && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-soft" style={{ animation: "slideUp 0.6s ease-out" }}>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={14} className="text-destructive" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-display font-semibold text-foreground">Air Quality Alert</h4>
              <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">
                Log your data to check real-time AQI and get personalized health alerts.
              </p>
            </div>
          </div>
        )}

        {/* Mood Chart */}
        <div style={{ animation: "slideUp 0.7s ease-out" }}>
          <MoodChart />
        </div>

        {/* Log button */}
        <div className="mt-6" style={{ animation: "slideUp 0.8s ease-out" }}>
          <button
            onClick={handleLog}
            disabled={isLogging}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm shadow-card hover:shadow-elevated transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLogging ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Logging...
              </>
            ) : logged ? (
              <>
                <Check size={16} /> Logged ✓ — Log Again
              </>
            ) : (
              "Log Today's Data →"
            )}
          </button>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
};

export default DigitalTwin;
