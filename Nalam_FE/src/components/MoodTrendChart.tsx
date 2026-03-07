import { motion } from "framer-motion";

const moodData = [
  { day: "Mon", score: 6, mood: "😊" },
  { day: "Tue", score: 4, mood: "😰" },
  { day: "Wed", score: 5, mood: "😐" },
  { day: "Thu", score: 3, mood: "😢" },
  { day: "Fri", score: 7, mood: "😊" },
  { day: "Sat", score: 6, mood: "😌" },
  { day: "Sun", score: 8, mood: "😊" },
];

const MoodTrendChart = () => {
  const maxScore = 10;

  return (
    <div className="glass-card p-5 rounded-2xl">
      <h3 className="font-display text-base font-semibold text-foreground mb-4">Mood This Week</h3>
      <div className="flex items-end gap-3 h-32">
        {moodData.map((d, i) => {
          const height = (d.score / maxScore) * 100;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-sm">{d.mood}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                className="w-full rounded-xl bg-gradient-to-t from-primary/40 to-primary/10 relative min-h-[4px]"
              >
                <div className="absolute inset-x-0 top-0 h-1 rounded-full bg-primary/60" />
              </motion.div>
              <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTrendChart;
