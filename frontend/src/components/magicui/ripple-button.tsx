import React, { useState, useRef } from "react";

interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  duration?: string;
  onClick?: () => void;
}

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export function RippleButton({
  children,
  className,
  rippleColor = "#ADD8E6",
  duration = "600ms",
  onClick,
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
  }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )}
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: duration,
          }}
        />
      ))}
    </button>
  );
}
