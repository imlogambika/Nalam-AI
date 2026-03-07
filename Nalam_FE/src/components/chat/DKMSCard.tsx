import { useState } from "react";
import { Heart, ExternalLink, PartyPopper } from "lucide-react";
import { registerDKMS } from "@/services/api";

interface DKMSCardProps {
  phase: number;
  sessionId: string;
}

const DKMSCard = ({ phase: initialPhase, sessionId }: DKMSCardProps) => {
  const [phase, setPhase] = useState(initialPhase);
  const [isRegistering, setIsRegistering] = useState(false);
  const [boostMessage, setBoostMessage] = useState("");

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await registerDKMS(sessionId);
      setBoostMessage(response.message);
      setPhase(3);
    } catch (e) {
      console.error("DKMS registration error:", e);
    } finally {
      setIsRegistering(false);
    }
  };

  if (phase === 3) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-50/10 p-4 animate-slide-up shadow-soft">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <PartyPopper size={14} className="text-amber-500" strokeWidth={2} />
          </div>
          <h4 className="text-sm font-display font-semibold text-foreground">You're a Hero! 🎉</h4>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed ml-[38px]">
          {boostMessage || "You're now on the donor list. Somewhere out there, a person fighting blood cancer has one more chance because of YOU. 💛"}
        </p>
      </div>
    );
  }

  if (phase === 2) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-50/10 p-4 animate-slide-up shadow-soft">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Heart size={14} className="text-amber-500" strokeWidth={2} />
          </div>
          <h4 className="text-sm font-display font-semibold text-foreground">Join the DKMS Registry</h4>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed ml-[38px] mb-3">
          Registration is free and takes just 10 minutes. You could save a life.
        </p>
        <div className="flex gap-2 ml-[38px]">
          <a
            href="https://www.dkms.org/en/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-all duration-200"
          >
            Register Now <ExternalLink size={11} />
          </a>
          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className="px-3.5 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:border-amber-400/30 transition-all duration-200 disabled:opacity-50"
          >
            {isRegistering ? "Registering..." : "I've Registered ✓"}
          </button>
        </div>
      </div>
    );
  }

  // Phase 1: Information
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-50/10 p-4 animate-slide-up shadow-soft">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Heart size={14} className="text-amber-500" strokeWidth={2} />
        </div>
        <h4 className="text-sm font-display font-semibold text-foreground">About DKMS</h4>
      </div>
      <p className="text-xs text-muted-foreground font-body leading-relaxed ml-[38px] mb-3">
        DKMS is a global organization fighting blood cancer. Every 27 seconds, someone is diagnosed with blood cancer. You can help by joining the bone marrow donor registry.
      </p>
      <button
        onClick={() => setPhase(2)}
        className="ml-[38px] text-xs text-amber-500 font-semibold hover:underline font-body"
      >
        Learn More →
      </button>
    </div>
  );
};

export default DKMSCard;
