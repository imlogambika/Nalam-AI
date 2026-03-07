import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  color?: "primary" | "accent" | "info";
  trend?: "up" | "down" | "stable";
}

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    icon: "text-primary",
    glow: "hsl(164 100% 42% / 0.15)",
  },
  accent: {
    bg: "bg-accent/10",
    border: "border-accent/20",
    icon: "text-accent",
    glow: "hsl(37 90% 55% / 0.15)",
  },
  info: {
    bg: "bg-info/10",
    border: "border-info/20",
    icon: "text-info",
    glow: "hsl(214 100% 65% / 0.15)",
  },
};

const MetricCard = ({ icon: Icon, label, value, unit, color = "primary", trend }: MetricCardProps) => {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`glass-card-glow p-4 rounded-2xl ${c.border} border`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-medium text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
        {trend && (
          <span className={`ml-auto text-xs ${trend === "up" ? "text-primary" : trend === "down" ? "text-accent" : "text-muted-foreground"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
