import { memo } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glow" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
}

// Additional button variants for Nalam - use alongside shadcn Button
export const NalamButton = memo(({ variant = "glow", size = "md", className, children, ...props }: ButtonProps) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantClasses = {
    glow: "btn-glow",
    glass: "glass-card hover:border-primary/30 text-foreground",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-xl",
  };

  return (
    <button
      className={cn(sizeClasses[size], variantClasses[variant], "font-semibold", className)}
      {...props}
    >
      {children}
    </button>
  );
});

NalamButton.displayName = "NalamButton";
