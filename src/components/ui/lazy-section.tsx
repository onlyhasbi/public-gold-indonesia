import React, { useState, useEffect, useRef, Suspense } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string | number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * A wrapper component that only renders its children when it enters the viewport.
 * Useful for optimizing performance on long pages with heavy components.
 */
export function LazySection({
  children,
  fallback,
  minHeight = "200px",
  className,
  threshold = 0.1,
  rootMargin = "200px",
  once = true,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [threshold, rootMargin, once]);

  return (
    <div
      ref={sectionRef}
      className={cn("w-full", className)}
      style={{ minHeight: !isVisible ? minHeight : undefined }}
    >
      {isVisible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
