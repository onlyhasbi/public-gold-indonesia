import { useMemo } from "react";
import {
  Image as UnpicImage,
  type ImageProps as UnpicImageProps,
} from "@unpic/react";
import { cn } from "../../lib/utils";

export type OptimizedImageProps = UnpicImageProps & {
  /**
   * Whether to prioritize this image (adds fetchpriority="high" and removes loading="lazy")
   */
  priority?: boolean;
};

/**
 * A high-performance image component that provides:
 * - Automatic srcset (responsive sizes)
 * - Modern format selection (WebP/AVIF)
 * - Layout shift prevention (CLS)
 * - Optimal lazy loading
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const { src, className, priority, ...unpicProps } = props;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Process the source URL
  const processedSrc = useMemo(() => {
    if (!src) return "";

    // If it's already a Cloudinary URL or local path, return as is
    if (
      src.includes("res.cloudinary.com") ||
      src.startsWith("/") ||
      src.startsWith(".") ||
      src.startsWith("blob:") ||
      src.startsWith("data:")
    ) {
      return src;
    }

    // Handle YouTube thumbnails via Cloudinary
    const ytMatch = src.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/f_auto,q_auto/${videoId}.jpg`;
    }

    // Wrap external URL in Cloudinary Fetch proxy
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(src)}`;
  }, [src, CLOUD_NAME]);

  return (
    <UnpicImage
      {...(unpicProps as UnpicImageProps)}
      src={processedSrc}
      className={cn("max-w-full h-auto", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
