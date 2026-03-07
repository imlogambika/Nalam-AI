import { motion } from "framer-motion";
import { Phone, Heart } from "lucide-react";

const helplines = [
  { name: "iCall", number: "9152987821", desc: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "9999666555", desc: "24/7 helpline" },
  { name: "AASRA", number: "9820466726", desc: "24/7 crisis support" },
];

const CrisisSupportCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card border-accent/40 p-5 rounded-2xl max-w-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-accent pulse-soft" />
        <h3 className="font-display text-base font-semibold text-foreground">You're Not Alone</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        It sounds like you're going through a difficult time. Please reach out to someone who can help.
      </p>
      <div className="space-y-2">
        {helplines.map((h) => (
          <a
            key={h.name}
            href={`tel:${h.number}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            <Phone className="w-4 h-4 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.number} · {h.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default CrisisSupportCard;
