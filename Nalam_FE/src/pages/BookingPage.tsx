import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import { CalendarDays, ExternalLink, Shield, Clock, Video } from "lucide-react";

const BookingPage = () => (
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

      {/* Booking card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft mb-6" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h3 className="text-base font-display font-bold text-foreground mb-1">Doctor Consultation</h3>
          <p className="text-xs text-muted-foreground font-body">
            Your anonymous session ID and severity score will be shared with the doctor.
          </p>
        </div>
        <a
          href="https://cal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm shadow-card hover:shadow-elevated transition-all duration-200"
        >
          Open Booking <ExternalLink size={15} />
        </a>
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

export default BookingPage;
