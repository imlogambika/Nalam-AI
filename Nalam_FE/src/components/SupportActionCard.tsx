import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Phone, Heart, Loader2, CheckCircle } from "lucide-react";

const API_BASE = "http://localhost:8000";

interface SupportActionCardProps {
  sessionId: string;
  severity: string;
  phqScore: number;
  gadScore: number;
  onRequestCall: () => void;
}

const SupportActionCard = ({
  sessionId,
  severity,
  phqScore,
  gadScore,
  onRequestCall,
}: SupportActionCardProps) => {
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleBookTherapist = async () => {
    setBookingStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          severity: severity,
          phq_score: phqScore,
          gad_score: gadScore,
        }),
      });

      if (res.ok) {
        setBookingStatus("success");
      } else {
        setBookingStatus("error");
      }
    } catch {
      setBookingStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", damping: 20 }}
      className="glass-card border border-primary/20 p-5 rounded-2xl max-w-sm shadow-elevated"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary pulse-soft" />
        </div>
        <h3 className="font-display text-base font-semibold text-foreground">
          We're Here For You
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        It sounds like you might benefit from some extra support. You don't have
        to go through this alone. 💚
      </p>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {/* Book Therapist Button */}
        <button
          onClick={handleBookTherapist}
          disabled={bookingStatus === "loading" || bookingStatus === "success"}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200 disabled:opacity-60 group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
            {bookingStatus === "loading" ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : bookingStatus === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Calendar className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {bookingStatus === "success" ? "Booking Confirmed! ✅" : "Book a Therapist"}
            </p>
            <p className="text-xs text-muted-foreground">
              {bookingStatus === "success"
                ? "We'll send you the details soon"
                : "Schedule a session with a professional"}
            </p>
          </div>
        </button>

        {/* Voice Call Button */}
        <button
          onClick={onRequestCall}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
            <Phone className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Talk to Someone Now</p>
            <p className="text-xs text-muted-foreground">
              Get an immediate support call on your phone
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default SupportActionCard;
