import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useInView } from "react-intersection-observer";
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
 * Uses a microtask instead of requestIdleCallback to reduce visible delay.
 */
export const LazySection = React.memo(
  ({
    children,
    fallback,
    minHeight = "200px",
    className,
    threshold = 0,
    rootMargin = "200px",
    once = true,
  }: LazySectionProps) => {
    const { ref, inView } = useInView({
      threshold,
      rootMargin,
      triggerOnce: once,
    });

    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      if (inView && !shouldRender) {
        // Use microtask for near-instant rendering once in view
        // This eliminates the perceptible delay from requestIdleCallback
        queueMicrotask(() => setShouldRender(true));
      }
    }, [inView, shouldRender]);

    const content = useMemo(() => {
      return shouldRender ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      );
    }, [shouldRender, children, fallback]);

    return (
      <div
        ref={ref}
        className={cn("w-full transition-opacity duration-300", className)}
        style={{
          minHeight: !shouldRender ? minHeight : undefined,
          opacity: shouldRender ? 1 : 0.8,
        }}
      >
        {content}
      </div>
    );
  },
);

LazySection.displayName = "LazySection";
