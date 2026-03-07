import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Calendar as CalendarIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const timeSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"];
const days = [
  { date: "Mar 10", day: "Mon" },
  { date: "Mar 11", day: "Tue" },
  { date: "Mar 12", day: "Wed" },
  { date: "Mar 13", day: "Thu" },
  { date: "Mar 14", day: "Fri" },
];

const DoctorBooking = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = () => {
    if (selectedDay && selectedTime) setConfirmed(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-muted transition-all duration-200 hover:shadow-card">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Book a Session</h1>
          </div>
          <ThemeToggle />
        </div>

        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="glass-card p-5 rounded-2xl mb-6 shadow-elevated">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">Mental Health Consultation</h3>
                    <p className="text-xs text-muted-foreground">30 min · Free via Nalam AI</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with a qualified counselor. Your anonymity is preserved — no personal data is shared.
                </p>
              </div>

              {/* Day selector */}
              <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" /> Select a Day
              </h3>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {days.map((d) => (
                  <motion.button
                    key={d.date}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDay(d.date)}
                    className={`px-4 py-3 rounded-2xl border text-center min-w-[72px] transition-all duration-300 ${
                      selectedDay === d.date
                        ? "bg-primary/20 border-primary/40 text-primary shadow-card-hover"
                        : "border-border bg-card/40 text-muted-foreground hover:border-primary/20 shadow-card"
                    }`}
                  >
                    <p className="text-xs font-medium">{d.day}</p>
                    <p className="text-sm font-semibold mt-0.5">{d.date.split(" ")[1]}</p>
                  </motion.button>
                ))}
              </div>

              {/* Time slots */}
              {selectedDay && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3">Available Times</h3>
                  <div className="grid grid-cols-3 gap-2 mb-8">
                    {timeSlots.map((t) => (
                      <motion.button
                        key={t}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                          selectedTime === t
                            ? "bg-primary/20 border-primary/40 text-primary shadow-card-hover"
                            : "border-border bg-card/40 text-muted-foreground hover:border-primary/20 shadow-card"
                        }`}
                      >
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedDay && selectedTime && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <button onClick={handleBook} className="w-full btn-glow py-4 text-base font-semibold">
                    Confirm Booking
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center mt-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mb-6 shadow-elevated"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 glow-text">
                Session Booked!
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedDay} at {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-xs mb-8">
                A counselor will be available at the scheduled time. Your privacy is fully protected. 💙
              </p>
              <button
                onClick={() => navigate("/chat")}
                className="btn-glow px-6 py-3 text-sm font-semibold"
              >
                Back to Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorBooking;
