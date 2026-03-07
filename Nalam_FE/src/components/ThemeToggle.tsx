import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full border border-border/60 bg-secondary/60 backdrop-blur-md shadow-[0_2px_10px_hsl(var(--primary)/0.1)] transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
        animate={{ x: isDark ? 0 : 28 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-primary-foreground" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-primary-foreground" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
