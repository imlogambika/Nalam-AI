import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useMemo, useState, useEffect, useCallback } from "react";

export type Mood = "calm" | "anxious" | "sad" | "happy";

export interface HealthMetrics {
  sleep?: number;      // hours (0-12)
  steps?: number;      // steps count
  heartRate?: number;  // bpm
  water?: number;      // liters
  screenTime?: number; // hours
  aqi?: number;        // air quality index
}

interface Avatar3DProps {
  mood?: Mood;
  size?: "sm" | "md" | "lg" | "xl";
  healthMetrics?: HealthMetrics;
  interactive?: boolean;
  showStatus?: boolean;
  label?: string;
  onAvatarTap?: () => void;
}

// Mood-based color themes
const moodThemes: Record<Mood, {
  primary: string;
  secondary: string;
  glow: string;
  skin: string;
  eyeColor: string;
  auraColor: string;
  particleColors: string[];
}> = {
  calm: {
    primary: "#34d399",
    secondary: "#059669",
    glow: "rgba(52, 211, 153, 0.4)",
    skin: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #34d399 100%)",
    eyeColor: "#065f46",
    auraColor: "rgba(52, 211, 153, 0.15)",
    particleColors: ["#34d399", "#6ee7b7", "#a7f3d0", "#059669"],
  },
  happy: {
    primary: "#fbbf24",
    secondary: "#f59e0b",
    glow: "rgba(251, 191, 36, 0.4)",
    skin: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)",
    eyeColor: "#92400e",
    auraColor: "rgba(251, 191, 36, 0.15)",
    particleColors: ["#fbbf24", "#fde68a", "#fef3c7", "#f59e0b"],
  },
  anxious: {
    primary: "#fb923c",
    secondary: "#ea580c",
    glow: "rgba(251, 146, 60, 0.4)",
    skin: "linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)",
    eyeColor: "#9a3412",
    auraColor: "rgba(251, 146, 60, 0.15)",
    particleColors: ["#fb923c", "#fdba74", "#fed7aa", "#ea580c"],
  },
  sad: {
    primary: "#60a5fa",
    secondary: "#2563eb",
    glow: "rgba(96, 165, 250, 0.4)",
    skin: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #60a5fa 100%)",
    eyeColor: "#1e3a5f",
    auraColor: "rgba(96, 165, 250, 0.15)",
    particleColors: ["#60a5fa", "#93c5fd", "#dbeafe", "#2563eb"],
  },
};

const sizeConfig = {
  sm: { container: 80, head: 28, body: 38, eye: 3, mouth: 8, fontSize: "text-xs" },
  md: { container: 140, head: 48, body: 64, eye: 4.5, mouth: 14, fontSize: "text-sm" },
  lg: { container: 200, head: 68, body: 92, eye: 6, mouth: 18, fontSize: "text-base" },
  xl: { container: 260, head: 88, body: 120, eye: 8, mouth: 24, fontSize: "text-lg" },
};

// Compute overall health score from metrics (0-100)
export function computeHealthScore(metrics?: HealthMetrics): number {
  if (!metrics) return 70;
  let score = 70; // base
  if (metrics.sleep) {
    if (metrics.sleep >= 7 && metrics.sleep <= 9) score += 10;
    else if (metrics.sleep >= 6) score += 5;
    else score -= 10;
  }
  if (metrics.steps) {
    if (metrics.steps >= 8000) score += 10;
    else if (metrics.steps >= 4000) score += 5;
    else score -= 5;
  }
  if (metrics.heartRate) {
    if (metrics.heartRate >= 60 && metrics.heartRate <= 80) score += 5;
    else if (metrics.heartRate > 100) score -= 10;
  }
  if (metrics.water) {
    if (metrics.water >= 2) score += 5;
    else if (metrics.water < 1) score -= 5;
  }
  if (metrics.screenTime) {
    if (metrics.screenTime <= 3) score += 5;
    else if (metrics.screenTime > 6) score -= 10;
  }
  if (metrics.aqi) {
    if (metrics.aqi <= 50) score += 5;
    else if (metrics.aqi > 200) score -= 15;
    else if (metrics.aqi > 100) score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

// Derive mood from health score
export function computeMoodFromScore(score: number): Mood {
  if (score >= 80) return "happy";
  if (score >= 60) return "calm";
  if (score >= 40) return "anxious";
  return "sad";
}

// Chuckle speech bubble messages by mood
const chuckleMessages: Record<Mood, string[]> = {
  happy: ["Hehe! That tickles! 🤭", "I'm so happy! ✨", "Yay! You're the best! 💛", "Keep it up! 🌟"],
  calm: ["Heh, hey there! 😊", "I'm doing great! 🌿", "Peace and calm~ 🧘", "Nice to see you! 💚"],
  anxious: ["Eep! You startled me! 😅", "I-I'm okay... 💫", "A bit nervous today 😰", "Help me relax? 🌊"],
  sad: ["*sniff* Hi... 💙", "I could use a hug 🫂", "Thanks for checking on me...", "Can you help me? 💧"],
};

const Avatar3D = ({
  mood = "calm",
  size = "lg",
  healthMetrics,
  interactive = true,
  showStatus = true,
  label,
  onAvatarTap,
}: Avatar3DProps) => {
  const theme = moodThemes[mood];
  const cfg = sizeConfig[size];
  const healthScore = computeHealthScore(healthMetrics);

  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [blinkTrigger, setBlinkTrigger] = useState(0);
  const [reaction, setReaction] = useState<{ text: string; emoji: string } | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Mouse tracking for eyes
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeOffsetX = useTransform(mouseX, [-200, 200], [-2, 2]);
  const eyeOffsetY = useTransform(mouseY, [-200, 200], [-1.5, 1.5]);
  const springX = useSpring(eyeOffsetX, { stiffness: 300, damping: 30 });
  const springY = useSpring(eyeOffsetY, { stiffness: 300, damping: 30 });

  // Blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkTrigger((prev) => prev + 1);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    },
    [interactive, mouseX, mouseY]
  );

  // Floating particles based on health
  const particles = useMemo(() => {
    const count = Math.max(4, Math.round(healthScore / 10));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * Math.PI * 2,
      radius: 35 + Math.random() * 25,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
      color: theme.particleColors[i % theme.particleColors.length],
    }));
  }, [healthScore, theme.particleColors]);

  // Mouth path based on mood
  const getMouthPath = () => {
    const w = cfg.mouth;
    const h = w * 0.4;
    switch (mood) {
      case "happy":
        return `M ${-w / 2} 0 Q 0 ${h} ${w / 2} 0`; // smile
      case "sad":
        return `M ${-w / 2} ${h * 0.5} Q 0 ${-h * 0.5} ${w / 2} ${h * 0.5}`; // frown
      case "anxious":
        return `M ${-w / 2} ${h * 0.2} Q ${-w / 4} ${-h * 0.3} 0 ${h * 0.2} Q ${w / 4} ${h * 0.5} ${w / 2} ${h * 0.1}`; // wavy
      default:
        return `M ${-w / 2} 0 L ${w / 2} 0`; // neutral line
    }
  };

  // Health-based energy rings
  const energyRings = useMemo(() => {
    const rings = [];
    const ringCount = healthScore > 80 ? 3 : healthScore > 50 ? 2 : 1;
    for (let i = 0; i < ringCount; i++) {
      rings.push({
        id: i,
        radius: cfg.container * 0.38 + i * 12,
        opacity: 0.15 - i * 0.04,
        dashArray: `${8 + i * 4} ${12 + i * 6}`,
        duration: 20 + i * 8,
      });
    }
    return rings;
  }, [healthScore, cfg.container]);

  const statusText =
    mood === "happy"
      ? "Feeling Great"
      : mood === "calm"
      ? "Feeling Calm"
      : mood === "anxious"
      ? "Feeling Anxious"
      : "Feeling Low";

  const scoreLabel =
    healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Moderate" : "Needs Attention";

  // Animation type cycles: bounce, dance, spin, wobble
  type TapAnim = "bounce" | "dance" | "spin" | "wobble";
  const tapAnimations: TapAnim[] = ["bounce", "dance", "spin", "wobble"];
  const currentTapAnim = tapAnimations[tapCount % tapAnimations.length];

  const getAnimateProps = () => {
    if (!isTapped) {
      return {
        y: [0, -6, 0] as number[],
        scale: isHovered ? 1.05 : 1,
        rotate: 0,
      };
    }
    switch (currentTapAnim) {
      case "dance":
        return { y: [0, -12, 0, -8, 0], rotate: [0, -8, 8, -5, 0], scale: [1, 1.06, 1.04, 1.06, 1] };
      case "spin":
        return { y: [0, -15, 0], rotate: [0, 360], scale: [1, 1.1, 1] };
      case "wobble":
        return { y: [0, -4, 0, -4, 0], rotate: [0, -12, 12, -8, 0], scale: 1 };
      default: // bounce
        return { y: [0, -20, 0, -10, 0], scale: [1, 1.12, 1, 1.06, 1], rotate: 0 };
    }
  };

  return (
    <div
      className="flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => {
        if (interactive) {
          setIsHovered(false);
          mouseX.set(0);
          mouseY.set(0);
        }
      }}
    >
      {/* SVG Avatar */}
      <motion.div
        className="relative cursor-pointer"
        style={{ width: cfg.container, height: cfg.container }}
        animate={getAnimateProps()}
        transition={{
          y: { duration: isTapped ? 0.7 : 4, repeat: isTapped ? 0 : Infinity, ease: "easeInOut" },
          scale: { duration: isTapped ? 0.7 : 0.3 },
          rotate: { duration: isTapped ? 0.7 : 0.3 },
        }}
        onTap={() => {
          if (interactive) {
            setIsTapped(true);
            setIsWiggling(true);
            setTapCount(prev => prev + 1);
            // Pick a random chuckle message
            const msgs = chuckleMessages[mood];
            const emojis = mood === "happy" ? "✨" : mood === "calm" ? "🌿" : mood === "anxious" ? "💫" : "💙";
            setReaction({ text: msgs[tapCount % msgs.length], emoji: emojis });
            setTimeout(() => setIsTapped(false), 800);
            setTimeout(() => setIsWiggling(false), 600);
            setTimeout(() => setReaction(null), 2500);
            onAvatarTap?.();
          }
        }}
      >
        <svg
          width={cfg.container}
          height={cfg.container}
          viewBox={`0 0 ${cfg.container} ${cfg.container}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Head gradient */}
            <radialGradient id={`headGrad-${mood}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor={theme.primary} stopOpacity="0.6" />
              <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.9" />
            </radialGradient>
            {/* Body gradient */}
            <radialGradient id={`bodyGrad-${mood}`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={theme.primary} stopOpacity="0.4" />
              <stop offset="70%" stopColor={theme.secondary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.9" />
            </radialGradient>
            {/* Glow filter */}
            <filter id={`glow-${mood}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Outer glow */}
            <filter id={`outerGlow-${mood}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feFlood floodColor={theme.primary} floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Glass highlight */}
            <linearGradient id={`glassHighlight-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="50%" stopColor="white" stopOpacity="0.05" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Aura outer glow */}
          <motion.circle
            cx={cfg.container / 2}
            cy={cfg.container / 2}
            r={cfg.container * 0.42}
            fill="none"
            stroke={theme.primary}
            strokeWidth="1"
            strokeOpacity="0.2"
            animate={{ r: [cfg.container * 0.4, cfg.container * 0.44, cfg.container * 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Energy rings based on health */}
          {energyRings.map((ring) => (
            <motion.circle
              key={ring.id}
              cx={cfg.container / 2}
              cy={cfg.container / 2}
              r={ring.radius}
              fill="none"
              stroke={theme.primary}
              strokeWidth="1.5"
              strokeOpacity={ring.opacity}
              strokeDasharray={ring.dashArray}
              animate={{ rotate: ring.id % 2 === 0 ? 360 : -360 }}
              transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "center" }}
            />
          ))}

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.circle
              key={p.id}
              cx={cfg.container / 2}
              cy={cfg.container / 2}
              r={p.size}
              fill={p.color}
              opacity={0.6}
              animate={{
                cx: [
                  cfg.container / 2 + Math.cos(p.angle) * p.radius * 0.8,
                  cfg.container / 2 + Math.cos(p.angle + 0.5) * p.radius,
                  cfg.container / 2 + Math.cos(p.angle + 1) * p.radius * 0.8,
                ],
                cy: [
                  cfg.container / 2 + Math.sin(p.angle) * p.radius * 0.8,
                  cfg.container / 2 + Math.sin(p.angle + 0.5) * p.radius,
                  cfg.container / 2 + Math.sin(p.angle + 1) * p.radius * 0.8,
                ],
                opacity: [0.2, 0.7, 0.2],
                r: [p.size * 0.6, p.size, p.size * 0.6],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Body (torso shape) */}
          <motion.ellipse
            cx={cfg.container / 2}
            cy={cfg.container / 2 + cfg.head * 0.65}
            rx={cfg.body * 0.45}
            ry={cfg.body * 0.48}
            fill={`url(#bodyGrad-${mood})`}
            filter={`url(#glow-${mood})`}
            animate={{ ry: [cfg.body * 0.46, cfg.body * 0.5, cfg.body * 0.46] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Body glass highlight */}
          <ellipse
            cx={cfg.container / 2 - cfg.body * 0.1}
            cy={cfg.container / 2 + cfg.head * 0.45}
            rx={cfg.body * 0.25}
            ry={cfg.body * 0.3}
            fill={`url(#glassHighlight-${mood})`}
          />

          {/* Neck */}
          <rect
            x={cfg.container / 2 - cfg.head * 0.12}
            y={cfg.container / 2 - cfg.head * 0.1}
            width={cfg.head * 0.24}
            height={cfg.head * 0.25}
            rx={cfg.head * 0.1}
            fill={theme.primary}
            opacity={0.6}
          />

          {/* Head */}
          <motion.circle
            cx={cfg.container / 2}
            cy={cfg.container / 2 - cfg.head * 0.35}
            r={cfg.head * 0.52}
            fill={`url(#headGrad-${mood})`}
            filter={`url(#outerGlow-${mood})`}
            animate={{
              cy: [cfg.container / 2 - cfg.head * 0.35, cfg.container / 2 - cfg.head * 0.38, cfg.container / 2 - cfg.head * 0.35],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Head glass highlight */}
          <circle
            cx={cfg.container / 2 - cfg.head * 0.12}
            cy={cfg.container / 2 - cfg.head * 0.5}
            r={cfg.head * 0.22}
            fill="white"
            opacity={0.15}
          />

          {/* Eyes */}
          <g>
            {/* Left eye */}
            <motion.g
              animate={{ scaleY: blinkTrigger ? [1, 0.1, 1] : 1 }}
              transition={{ duration: 0.15 }}
              style={{ transformOrigin: `${cfg.container / 2 - cfg.head * 0.16}px ${cfg.container / 2 - cfg.head * 0.38}px` }}
            >
              <motion.circle
                cx={cfg.container / 2 - cfg.head * 0.16}
                cy={cfg.container / 2 - cfg.head * 0.38}
                r={cfg.eye}
                fill={theme.eyeColor}
                style={{ x: springX, y: springY }}
              />
              {/* Eye shine */}
              <circle
                cx={cfg.container / 2 - cfg.head * 0.16 + cfg.eye * 0.3}
                cy={cfg.container / 2 - cfg.head * 0.38 - cfg.eye * 0.3}
                r={cfg.eye * 0.35}
                fill="white"
                opacity={0.8}
              />
            </motion.g>
            {/* Right eye */}
            <motion.g
              animate={{ scaleY: blinkTrigger ? [1, 0.1, 1] : 1 }}
              transition={{ duration: 0.15 }}
              style={{ transformOrigin: `${cfg.container / 2 + cfg.head * 0.16}px ${cfg.container / 2 - cfg.head * 0.38}px` }}
            >
              <motion.circle
                cx={cfg.container / 2 + cfg.head * 0.16}
                cy={cfg.container / 2 - cfg.head * 0.38}
                r={cfg.eye}
                fill={theme.eyeColor}
                style={{ x: springX, y: springY }}
              />
              {/* Eye shine */}
              <circle
                cx={cfg.container / 2 + cfg.head * 0.16 + cfg.eye * 0.3}
                cy={cfg.container / 2 - cfg.head * 0.38 - cfg.eye * 0.3}
                r={cfg.eye * 0.35}
                fill="white"
                opacity={0.8}
              />
            </motion.g>
          </g>

          {/* Eyebrows - mood-based */}
          {mood === "anxious" && (
            <>
              <line
                x1={cfg.container / 2 - cfg.head * 0.24}
                y1={cfg.container / 2 - cfg.head * 0.52}
                x2={cfg.container / 2 - cfg.head * 0.08}
                y2={cfg.container / 2 - cfg.head * 0.48}
                stroke={theme.eyeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <line
                x1={cfg.container / 2 + cfg.head * 0.08}
                y1={cfg.container / 2 - cfg.head * 0.48}
                x2={cfg.container / 2 + cfg.head * 0.24}
                y2={cfg.container / 2 - cfg.head * 0.52}
                stroke={theme.eyeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </>
          )}
          {mood === "sad" && (
            <>
              <line
                x1={cfg.container / 2 - cfg.head * 0.24}
                y1={cfg.container / 2 - cfg.head * 0.48}
                x2={cfg.container / 2 - cfg.head * 0.08}
                y2={cfg.container / 2 - cfg.head * 0.52}
                stroke={theme.eyeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <line
                x1={cfg.container / 2 + cfg.head * 0.08}
                y1={cfg.container / 2 - cfg.head * 0.52}
                x2={cfg.container / 2 + cfg.head * 0.24}
                y2={cfg.container / 2 - cfg.head * 0.48}
                stroke={theme.eyeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </>
          )}

          {/* Mouth */}
          <motion.path
            d={getMouthPath()}
            fill="none"
            stroke={theme.eyeColor}
            strokeWidth={mood === "happy" ? 2 : 1.5}
            strokeLinecap="round"
            transform={`translate(${cfg.container / 2}, ${cfg.container / 2 - cfg.head * 0.22})`}
            animate={mood === "happy" ? { strokeWidth: [2, 2.5, 2] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Cheek blush (happy mood) */}
          {mood === "happy" && (
            <>
              <circle
                cx={cfg.container / 2 - cfg.head * 0.28}
                cy={cfg.container / 2 - cfg.head * 0.25}
                r={cfg.head * 0.08}
                fill="#f87171"
                opacity={0.25}
              />
              <circle
                cx={cfg.container / 2 + cfg.head * 0.28}
                cy={cfg.container / 2 - cfg.head * 0.25}
                r={cfg.head * 0.08}
                fill="#f87171"
                opacity={0.25}
              />
            </>
          )}

          {/* Heart indicator (health score) */}
          {showStatus && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <circle
                cx={cfg.container / 2 + cfg.container * 0.32}
                cy={cfg.container / 2 - cfg.container * 0.3}
                r={12}
                fill="rgba(0,0,0,0.3)"
                stroke={healthScore >= 60 ? "#34d399" : healthScore >= 40 ? "#fbbf24" : "#f87171"}
                strokeWidth={2}
              />
              <text
                x={cfg.container / 2 + cfg.container * 0.32}
                y={cfg.container / 2 - cfg.container * 0.3 + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {healthScore}
              </text>
            </motion.g>
          )}
        </svg>

        {/* Tap reaction effect */}
        {isTapped && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [1, 0], scale: [0.5, 1.5] }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl">
              {mood === "happy" ? "✨" : mood === "calm" ? "🌿" : mood === "anxious" ? "💫" : "💙"}
            </span>
          </motion.div>
        )}

        {/* Speech bubble on tap */}
        {reaction && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ top: -16, left: "50%", transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="bg-card/90 backdrop-blur-md border border-border/30 rounded-2xl px-3 py-1.5 shadow-lg whitespace-nowrap">
              <p className="text-xs font-medium text-foreground">{reaction.text}</p>
            </div>
            {/* Speech tail */}
            <div
              className="w-3 h-3 bg-card/90 border-r border-b border-border/30 mx-auto -mt-1.5"
              style={{ transform: "rotate(45deg)" }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Status text */}
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-center"
        >
          <p className={`font-display font-semibold text-foreground ${cfg.fontSize}`}>
            {label || "Digital Twin"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{statusText}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: healthScore >= 60 ? "#34d399" : healthScore >= 40 ? "#fbbf24" : "#f87171" }}
            />
            <span className="text-[10px] text-muted-foreground font-medium">{scoreLabel} • {healthScore}/100</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Avatar3D;
