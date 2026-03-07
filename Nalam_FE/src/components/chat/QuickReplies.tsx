interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

const replies = [
  { emoji: "😔", label: "Anxious" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "😶", label: "Numb" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😊", label: "Okay" },
];

const QuickReplies = ({ onSelect }: QuickRepliesProps) => (
  <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none">
    {replies.map((r) => (
      <button
        key={r.label}
        onClick={() => onSelect(`I'm feeling ${r.label.toLowerCase()}`)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 whitespace-nowrap font-body font-medium shadow-soft"
      >
        <span>{r.emoji}</span>
        {r.label}
      </button>
    ))}
  </div>
);

export default QuickReplies;
