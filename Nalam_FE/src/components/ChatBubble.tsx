import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  delay?: number;
}

const ChatBubble = ({ message, isUser, delay = 0 }: ChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: isUser ? 12 : -12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "max-w-[80%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed font-body",
        isUser
          ? "ml-auto bg-primary/20 border border-primary/30 text-foreground"
          : "mr-auto glass-card text-foreground"
      )}
    >
      {message}
    </motion.div>
  );
};

export default ChatBubble;
