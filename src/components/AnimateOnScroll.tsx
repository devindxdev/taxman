"use client";

import { useInView } from "@/hooks/useInView";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimateOnScroll({
  children,
  delay = 0,
  className = "",
}: AnimateOnScrollProps) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`${!isInView ? "opacity-0" : "animate-fade-in-up"} ${className}`}
      style={isInView && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
