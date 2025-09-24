import React from "react";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
}

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
}:AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:300%_100%] bg-clip-text text-transparent animate-gradient",
        className
      )}
      style={{
        animationDuration: `${3 / speed}s`,
        backgroundImage: `linear-gradient(90deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
      }}
    >
      {children}
    </span>
  );
}
