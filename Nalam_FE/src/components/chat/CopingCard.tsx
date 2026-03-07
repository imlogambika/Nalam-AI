import { Wind, Brain, Heart } from "lucide-react";

interface CopingCardProps {
  title: string;
  description: string;
  category: "anxiety" | "depression" | "stress";
  interactive?: boolean;
}

const categoryConfig = {
  anxiety: { icon: Wind, borderColor: "border-primary/30", bgColor: "bg-primary/5", iconColor: "text-primary" },
  depression: { icon: Brain, borderColor: "border-blue-400/30", bgColor: "bg-blue-50", iconColor: "text-blue-500" },
  stress: { icon: Heart, borderColor: "border-amber/30", bgColor: "bg-amber/5", iconColor: "text-amber" },
};

const CopingCard = ({ title, description, category, interactive }: CopingCardProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.borderColor} ${config.bgColor} animate-slide-up shadow-soft`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon size={14} className={config.iconColor} strokeWidth={2} />
        </div>
        <h4 className="text-sm font-display font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground font-body leading-relaxed ml-[38px]">{description}</p>
      {interactive && (
        <button className="ml-[38px] mt-3 text-xs text-primary font-semibold hover:underline font-body">
          Start Breathing Guide →
        </button>
      )}
    </div>
  );
};

export default CopingCard;
