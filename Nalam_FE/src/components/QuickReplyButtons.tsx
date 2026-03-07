import { motion } from "framer-motion";

interface QuickReplyButtonsProps {
  onSelect: (emotion: string) => void;
}

const emotions = [
  { label: "Anxious", emoji: "😰", color: "border-accent/40 hover:bg-accent/15" },
  { label: "Stressed", emoji: "😤", color: "border-accent/40 hover:bg-accent/15" },
  { label: "Sad", emoji: "😢", color: "border-info/40 hover:bg-info/15" },
  { label: "Okay", emoji: "🙂", color: "border-primary/40 hover:bg-primary/15" },
];

const QuickReplyButtons = ({ onSelect }: QuickReplyButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map((e, i) => (
        <motion.button
          key={e.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onSelect(e.label)}
          className={`px-4 py-2 rounded-2xl border bg-card/40 backdrop-blur text-sm font-medium text-foreground transition-all duration-300 ${e.color}`}
        >
          {e.emoji} {e.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
