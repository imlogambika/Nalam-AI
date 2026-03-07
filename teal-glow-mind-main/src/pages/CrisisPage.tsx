import NavBar from "@/components/layout/NavBar";
import Disclaimer from "@/components/layout/Disclaimer";
import { Phone, HeartHandshake, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const contacts = [
  { name: "iCall", phone: "9152987821", desc: "Psychosocial helpline" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345", desc: "24/7 mental health support" },
  { name: "iMind", phone: "080-46110007", desc: "Counselling helpline" },
  { name: "NIMHANS", phone: "080-46110007", desc: "National institute helpline" },
];

const CrisisPage = () => (
  <div className="min-h-screen bg-background">
    <NavBar />
    <div className="pt-20 pb-16 px-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s ease-out" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <HeartHandshake size={18} className="text-destructive" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">Crisis Support</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          If you're in crisis right now, please reach out immediately. These are free, confidential helplines available 24/7.
        </p>
      </div>

      <div className="space-y-3" style={{ animation: "slideUp 0.5s ease-out" }}>
        {contacts.map((c) => (
          <a
            key={c.name}
            href={`tel:${c.phone}`}
            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-card transition-all duration-200 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-semibold text-foreground">{c.name}</h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{c.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-mono text-sm font-medium">
                <Phone size={14} strokeWidth={2} />
                {c.phone}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8" style={{ animation: "slideUp 0.7s ease-out" }}>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground font-body font-medium hover:border-primary/30 hover:shadow-card transition-all duration-200 shadow-soft"
        >
          <ArrowLeft size={15} strokeWidth={2} /> Back to Chat
        </Link>
      </div>
    </div>
    <Disclaimer />
  </div>
);

export default CrisisPage;
