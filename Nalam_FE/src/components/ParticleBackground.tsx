import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const ParticleBackground = () => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 15,
      size: 1 + Math.random() * 3,
      opacity: 0.15 + Math.random() * 0.25,
    })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Breathing gradient overlay */}
      <div className="absolute inset-0 breathing-bg bg-gradient-radial">
        <div
          className="absolute w-[600px] h-[600px] rounded-full breathing-bg"
          style={{
            top: "20%",
            left: "60%",
            background: "radial-gradient(circle, hsl(164 100% 42% / 0.04), transparent 70%)",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full breathing-bg"
          style={{
            bottom: "10%",
            left: "20%",
            background: "radial-gradient(circle, hsl(214 100% 65% / 0.03), transparent 70%)",
            animationDelay: "4s",
          }}
        />
      </div>
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: 0,
          }}
          animate={{
            y: ["100vh", "-10vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
