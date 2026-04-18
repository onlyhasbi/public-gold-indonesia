import { cn } from "../../lib/utils";
import { type ImgHTMLAttributes } from "react";

export type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  priority?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

/**
 * A high-performance image component that provides:
 * - Automatic srcset (responsive sizes)
 * - Modern format selection (WebP/AVIF)
 * - Layout shift prevention (CLS)
 * - Optimal lazy loading
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const { src, className, priority, width, height, aspectRatio, ...rest } = props;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!src) return null;

  // Determine if it's an external URL that needs Cloudinary Fetch
  const isExternal = src.startsWith("http") && !src.includes("res.cloudinary.com");
  
  if (!isExternal) {
    return (
      <img
        src={src}
        className={cn("max-w-full h-auto", className)}
        loading={priority ? "eager" : "lazy"}
        {...rest}
      />
    );
  }

  // Construct Cloudinary Fetch URL with c_limit (NO CROPPING)
  const getUrl = (w?: number) => {
    const transformations = ["f_auto", "q_auto", "c_limit"];
    if (w) transformations.push(`w_${w}`);
    
    // Check if it's a YouTube URL
    const ytMatch = src.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/${transformations.join(",")}/${ytMatch[1]}.jpg`;
    }
    
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformations.join(",")}/${encodeURIComponent(src)}`;
  };

  const defaultWidth = width || 800;
  const srcset = [400, 800, 1200, 1600].map(w => `${getUrl(w)} ${w}w`).join(", ");

  return (
    <img
      src={getUrl(defaultWidth)}
      srcSet={srcset}
      sizes={props.sizes || "(max-width: 768px) 100vw, 800px"}
      className={cn("max-w-full h-auto", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      width={width}
      height={height}
      {...rest}
    />
  );
}
