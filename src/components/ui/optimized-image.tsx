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
  const [hasError, setHasError] = useState(false);
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!src) return null;

  // Determine the type of the source
  const isCloudinary = src.includes("res.cloudinary.com");
  const isExternal =
    (src.startsWith("http") || src.startsWith("//")) && !isCloudinary;
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  const isSvg = src.toLowerCase().endsWith(".svg");

  // Domains known to block Cloudinary fetch (hotlinking protection)
  const BLOCKED_DOMAINS = ["chinapress.com.my"];
  const isBlockedDomain =
    isExternal && BLOCKED_DOMAINS.some((domain) => src.includes(domain));

  // If it's not a URL and not a local path, assume it's a Cloudinary Public ID
  const isPublicId = [!isExternal, !isCloudinary, !isLocal, !isSvg].every(
    Boolean,
  );

  // Construction helpers
  const getUrl = (w?: number, blur?: boolean) => {
    const transformations = ["f_auto", "fl_strip_profile"];

    if (blur) {
      // Extremely lightweight placeholder
      transformations.push("e_blur:2000", "w_20", "q_auto:low");
    } else {
      transformations.push("q_auto:eco", "dpr_auto");
      if (w) {
        transformations.push(`w_${w}`, "c_limit");
      }
    }

    // Case 1: YouTube URL
    const ytMatch = src.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/${transformations.join(",")}/${ytMatch[1]}.jpg`;
    }

    // Case 2: Existing Cloudinary URL - inject transformations
    if (isCloudinary) {
      const isUpload = src.includes("/upload/");
      const isFetch = src.includes("/fetch/");
      const token = isUpload ? "/upload/" : isFetch ? "/fetch/" : null;

      if (token) {
        const parts = src.split(token);
        const resourcePath = parts[1];
        return `${parts[0]}${token}${transformations.join(",")}/${resourcePath}`;
      }
    }

    // Case 3: Local asset - fetch using full domain (Production only)
    if (isLocal && !import.meta.env.DEV) {
      const fullUrl = `${window.location.origin}${src}`;
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformations.join(",")}/${encodeURIComponent(fullUrl)}`;
    }

    // Case 4: Cloudinary Public ID or External fetch
    const fetchType = isPublicId ? "upload" : "fetch";
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/${fetchType}/${transformations.join(",")}/${isPublicId ? src : encodeURIComponent(src)}`;
  };

  const defaultWidth = width || 800;
  // Optimize local assets via Cloudinary ONLY in production and if not an SVG
  const canOptimizeLocal = isLocal && !isSvg && !import.meta.env.DEV;
  // Disable Cloudinary if error occurred OR if domain is known to be blocked
  const useCloudinary =
    !hasError &&
    !isBlockedDomain &&
    (isExternal || isCloudinary || canOptimizeLocal || isPublicId);

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
        srcSet={useCloudinary ? srcset : undefined}
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
        onError={() => setHasError(true)}
        {...rest}
      />
    </div>
  );
}
