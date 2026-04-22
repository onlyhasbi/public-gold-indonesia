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
 * Memoized to prevent unnecessary re-renders of heavy components.
 */
export const LazySection = React.memo(
  ({
    children,
    fallback,
    minHeight = "200px",
    className,
    threshold = 0,
    rootMargin = "50px",
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
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          const handle = window.requestIdleCallback(
            () => setShouldRender(true),
            {
              timeout: 200,
            },
          );
          return () => window.cancelIdleCallback(handle);
        } else {
          const timer = setTimeout(() => setShouldRender(true), 50);
          return () => clearTimeout(timer);
        }
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
        className={cn("w-full transition-opacity duration-500", className)}
        style={{
          minHeight: !shouldRender ? minHeight : undefined,
          opacity: shouldRender ? 1 : 0.6,
        }}
      >
        {content}
      </div>
    );
  },
);

LazySection.displayName = "LazySection";
