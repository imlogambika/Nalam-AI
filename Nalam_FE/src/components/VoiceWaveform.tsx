import { motion } from "framer-motion";

interface VoiceWaveformProps {
  active?: boolean;
}

const VoiceWaveform = ({ active = false }: VoiceWaveformProps) => {
  const bars = 12;

  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          animate={active ? {
            height: [8, 20 + Math.random() * 12, 8],
          } : { height: 8 }}
          transition={active ? {
            duration: 0.5 + Math.random() * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          } : {}}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;
