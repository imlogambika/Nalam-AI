import { useState } from "react";
import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import { CalendarDays, ExternalLink, Shield, Clock, Video, Loader2, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { createBooking } from "@/services/api";

const BookingPage = () => {
  const { state } = useApp();
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const response = await createBooking({
        session_id: state.sessionId,
        severity: state.severity,
        phq_score: state.phqScore,
        gad_score: state.gadScore,
      });
      setBookingId(response.booking_id);
      setBooked(true);
    } catch (error) {
      console.error("Booking error:", error);
      // Open cal.com directly as fallback
      window.open("https://cal.com", "_blank");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-20 pb-16 px-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8" style={{ animation: "slideUp 0.4s ease-out" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays size={18} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Book a Session</h1>
              <p className="text-xs text-muted-foreground font-body">Anonymous & confidential</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Connect with a qualified mental health professional. No personal information required.
          </p>
        </div>

        {/* Session Info */}
        {state.severity !== "minimal" && (
          <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-soft" style={{ animation: "slideUp 0.45s ease-out" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">Your Severity Level</span>
              <span className={`text-xs font-mono font-semibold capitalize ${
                state.severity === "severe" || state.severity === "moderately_severe"
                  ? "text-destructive"
                  : state.severity === "moderate"
                  ? "text-amber-500"
                  : "text-primary"
              }`}>
                {state.severity.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground font-body">PHQ-9 / GAD-7</span>
              <span className="text-xs font-mono font-medium text-foreground">
                {state.phqScore}/27 · {state.gadScore}/21
              </span>
            </div>
          </div>
        )}

        {/* Booking card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft mb-6" style={{ animation: "slideUp 0.5s ease-out" }}>
          {booked ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-base font-display font-bold text-foreground mb-1">Booking Confirmed!</h3>
              <p className="text-xs text-muted-foreground font-body mb-2">
                Your anonymous session has been booked.
              </p>
              <span className="text-xs font-mono text-primary">{bookingId}</span>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🩺</span>
                </div>
                <h3 className="text-base font-display font-bold text-foreground mb-1">Doctor Consultation</h3>
                <p className="text-xs text-muted-foreground font-body">
                  Your anonymous session ID and severity score will be shared with the doctor.
                </p>
              </div>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm shadow-card hover:shadow-elevated transition-all duration-200 disabled:opacity-70"
              >
                {isBooking ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    Book Session <ExternalLink size={15} />
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* How it works */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft" style={{ animation: "slideUp 0.6s ease-out" }}>
          <h4 className="text-sm font-display font-semibold text-foreground mb-4">How it works</h4>
          <div className="space-y-4">
            {[
              { icon: Clock, step: "1", text: "Choose a time slot that works for you" },
              { icon: Shield, step: "2", text: "Your severity score & strategies tried are shared (no PII)" },
              { icon: Video, step: "3", text: "Join the video session at your scheduled time" },
            ].map(({ icon: Icon, step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-primary" strokeWidth={2} />
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
};

export default BookingPage;
