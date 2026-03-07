import { Phone, HeartHandshake } from "lucide-react";

const contacts = [
  { name: "iCall", phone: "9152987821" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345" },
  { name: "iMind", phone: "080-46110007" },
];

const CrisisCard = () => (
  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-slide-up shadow-soft">
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
        <HeartHandshake size={14} className="text-destructive" strokeWidth={2} />
      </div>
      <h4 className="text-sm font-display font-semibold text-foreground">You're not alone</h4>
    </div>
    <p className="text-xs text-muted-foreground mb-3 font-body ml-[38px]">
      I hear you, and what you're feeling matters. Please reach out to someone who can help right now.
    </p>
    <div className="space-y-2 ml-[38px]">
      {contacts.map((c) => (
        <a
          key={c.name}
          href={`tel:${c.phone}`}
          className="flex items-center justify-between bg-card rounded-lg px-3 py-2.5 border border-border hover:border-destructive/30 transition-all duration-200 shadow-soft"
        >
          <span className="text-xs font-body font-medium text-foreground">{c.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-destructive font-mono font-medium">
            <Phone size={11} /> {c.phone}
          </span>
        </a>
      ))}
    </div>
  </div>
);

export default CrisisCard;
