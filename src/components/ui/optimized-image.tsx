import { useState, type ImgHTMLAttributes } from "react";

export type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  priority?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

/**
 * A high-performance image component that provides:
 * - Blur-Up technique (placeholder transitions)
 * - Automatic srcset (responsive sizes)
 * - Modern format selection (WebP/AVIF)
 * - Layout shift prevention (CLS)
 * - Optimal lazy loading
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const { src, className, priority, width, height, aspectRatio, ...rest } =
    props;
  const [isLoaded, setIsLoaded] = useState(false);
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!src) return null;

  // Determine if it's a Cloudinary URL
  const isCloudinary = src.includes("res.cloudinary.com");
  const isExternal = src.startsWith("http") && !isCloudinary;

  // Construction helpers
  const getUrl = (w?: number, blur?: boolean) => {
    const transformations = ["f_auto", "q_auto"];
    if (blur) {
      transformations.push("e_blur:2000", "w_40", "q_auto:low");
    } else if (w) {
      transformations.push(`w_${w}`, "c_limit");
    }

    // Case 1: YouTube URL
    const ytMatch = src.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/${transformations.join(",")}/${ytMatch[1]}.jpg`;
    }

    // Case 2: Existing Cloudinary URL - inject transformations
    if (isCloudinary) {
      // If it already has transformations (contains /upload/ followed by something then /), we might need to be careful
      // But usually user provides a raw URL.
      if (src.includes("/upload/")) {
        const parts = src.split("/upload/");
        return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
      }
    }

    // Case 3: External fetch
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformations.join(",")}/${encodeURIComponent(src)}`;
  };

  const defaultWidth = width || 800;
  const useCloudinary = isExternal || isCloudinary;

  const srcset = useCloudinary
    ? [400, 800, 1200, 1600].map((w) => `${getUrl(w)} ${w}w`).join(", ")
    : undefined;

  const placeholderUrl = useCloudinary ? getUrl(undefined, true) : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{
        aspectRatio:
          aspectRatio || (width && height ? width / height : undefined),
      }}
    >
      {/* 1. Blurred Placeholder Layer */}
      {useCloudinary && !isLoaded && (
        <img
          src={placeholderUrl}
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-500"
          alt=""
          aria-hidden="true"
        />
      )}

      {/* 2. Main High-Res Image */}
      <img
        src={useCloudinary ? getUrl(defaultWidth) : src}
        srcSet={srcset}
        sizes={props.sizes || "(max-width: 768px) 100vw, 800px"}
        className={`w-full h-full transition-opacity duration-700 ease-in-out ${
          useCloudinary
            ? isLoaded
              ? "opacity-100"
              : "opacity-0"
            : "opacity-100"
        }`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        {...rest}
      />
    </div>
  );
}
