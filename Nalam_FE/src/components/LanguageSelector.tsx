import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
];

interface LanguageSelectorProps {
  selected: string;
  onSelect: (code: string) => void;
}

const LanguageSelector = ({ selected, onSelect }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-sm text-foreground hover:border-primary/30 transition-colors"
      >
        <Globe className="w-4 h-4 text-primary" />
        {languages.find(l => l.code === selected)?.label || "English"}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-0 z-50 glass-card p-2 rounded-xl min-w-[160px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onSelect(lang.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected === lang.code
                  ? "bg-primary/15 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
