import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Activity, Phone, CalendarDays } from "lucide-react";
import nalamLogo from "@/assets/nalam-logo.png";

const navItems = [
  { path: "/chat", label: "Chat", icon: MessageCircle },
  { path: "/twin", label: "Twin", icon: Activity },
  { path: "/book", label: "Book", icon: CalendarDays },
  { path: "/crisis", label: "Crisis", icon: Phone },
];

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/chat" className="flex items-center gap-2.5">
          <img src={nalamLogo} alt="Nalam AI" className="w-8 h-8 object-contain" />
          <span className="font-display text-base text-foreground font-bold tracking-tight">Nalam AI</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span className="hidden sm:inline font-body">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
