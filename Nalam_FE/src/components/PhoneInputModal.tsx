import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Phone, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PhoneInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => Promise<void>;
}

const PhoneInputModal = ({ isOpen, onClose, onSubmit }: PhoneInputModalProps) => {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!phone.trim() || phone.trim().length < 10) return;
    setStatus("loading");
    try {
      await onSubmit(phone.trim());
      setStatus("success");
      setMessage("Call is being placed! Please answer the incoming call. 💚");
    } catch (err) {
      setStatus("error");
      setMessage("Couldn't place the call. Please try a helpline number instead.");
    }
  };

  const handleClose = () => {
    setPhone("");
    setStatus("idle");
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm glass-card rounded-2xl p-6 shadow-elevated border border-border/30"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {status === "success" ? (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Call Initiated! 📞
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {message}
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-colors"
              >
                Got it
              </button>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Couldn't Place Call
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {message}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { setStatus("idle"); setMessage(""); }}
                  className="px-4 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Talk to Someone
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Our AI support agent will call you
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Enter your phone number and our caring AI support agent will call you
                right away to listen and help. 💚
              </p>

              <div className="flex gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/30 text-sm text-muted-foreground font-medium">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter your number"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={phone.trim().length < 10 || status === "loading"}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing call...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Call Me Now
                  </>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
                Your number is not stored and is used only for this call
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhoneInputModal;
