import { motion } from "framer-motion";
import { Wind, Eye, Brain, Timer } from "lucide-react";

interface CopingCardProps {
  title: string;
  description: string;
  type: "breathing" | "grounding" | "focus" | "activation";
  onStart?: () => void;
}

const iconMap = {
  breathing: Wind,
  grounding: Eye,
  focus: Brain,
  activation: Timer,
};

const CopingCard = ({ title, description, type, onStart }: CopingCardProps) => {
  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card-glow p-4 rounded-2xl cursor-pointer max-w-[280px]"
      onClick={onStart}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      <button className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
        Start Exercise →
      </button>
    </motion.div>
  );
};

export default CopingCard;
