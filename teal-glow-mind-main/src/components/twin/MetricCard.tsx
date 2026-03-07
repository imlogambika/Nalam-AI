interface MetricCardProps {
  emoji: string;
  label: string;
  value: string;
}

const MetricCard = ({ emoji, label, value }: MetricCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-1.5 hover:border-primary/30 hover:shadow-card transition-all duration-200 shadow-soft">
    <span className="text-xl">{emoji}</span>
    <span className="text-[11px] text-muted-foreground font-body font-medium uppercase tracking-wider">{label}</span>
    <span className="text-base font-mono font-semibold text-foreground">{value}</span>
  </div>
);

export default MetricCard;
