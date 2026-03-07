interface ChatBubbleProps {
  role: "user" | "bot";
  message: string;
  timestamp: string;
}

const ChatBubble = ({ role, message, timestamp }: ChatBubbleProps) => {
  const isBot = role === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} animate-slide-up`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-sm font-body leading-relaxed ${
          isBot
            ? "bg-card border border-border rounded-2xl rounded-tl-sm text-foreground shadow-soft"
            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-soft"
        }`}
      >
        <p>{message}</p>
        <span className={`block text-[10px] mt-1.5 text-right font-mono ${isBot ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
