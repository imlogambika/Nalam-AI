import { motion } from "framer-motion";
import { useMemo } from "react";

type Mood = "calm" | "anxious" | "sad" | "happy";

interface AvatarWidgetProps {
  mood?: Mood;
  size?: "sm" | "md" | "lg";
}

const moodColors: Record<Mood, string> = {
  calm: "hsl(164, 100%, 42%)",
  happy: "hsl(50, 100%, 60%)",
  anxious: "hsl(37, 90%, 55%)",
  sad: "hsl(214, 100%, 65%)",
};

const moodEmojis: Record<Mood, string> = {
  calm: "😌",
  happy: "😊",
  anxious: "😰",
  sad: "😢",
};

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-36 h-36",
};

const AvatarWidget = ({ mood = "calm", size = "md" }: AvatarWidgetProps) => {
  const color = moodColors[mood];
  const glowIntensity = mood === "anxious" ? "0.5" : "0.3";

  const particles = useMemo(() => (
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.cos((i / 6) * Math.PI * 2) * 40,
      y: Math.sin((i / 6) * Math.PI * 2) * 40,
    }))
  ), []);

  return (
    <motion.div
      className={`${sizeMap[size]} relative flex items-center justify-center`}
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}${Math.round(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        }}
      />
      {/* Orbiting particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            x: [p.x * 0.8, p.x, p.x * 0.8],
            y: [p.y * 0.8, p.y, p.y * 0.8],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + p.id * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Core avatar */}
      <div
        className="relative z-10 rounded-full flex items-center justify-center border-2"
        style={{
          width: "65%",
          height: "65%",
          borderColor: `${color}66`,
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          backdropFilter: "blur(8px)",
        }}
      >
        <span className={size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg"}>
          {moodEmojis[mood]}
        </span>
      </div>
    </motion.div>
  );
};

export default AvatarWidget;
