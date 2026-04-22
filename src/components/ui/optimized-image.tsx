import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";
import { getCloudinaryUrl, getCloudinarySrcSet } from "@/lib/images";

export type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  priority?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

export function OptimizedImage(props: OptimizedImageProps) {
  const { src, className, priority, width, height, aspectRatio, ...rest } =
    props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsClient(true);
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  if (!src) return null;

  const isSvg = src.toLowerCase().endsWith(".svg");
  const isLocal = src.startsWith("/") && !src.startsWith("//");

  // Domains known to block Cloudinary fetch
  const BLOCKED_DOMAINS = ["chinapress.com.my"];
  const isBlockedDomain =
    (src.startsWith("http") || src.startsWith("//")) &&
    BLOCKED_DOMAINS.some((domain) => src.includes(domain));

  const defaultWidth = width || 800;
  // Optimize local assets via Cloudinary ONLY in production and if not an SVG
  const canOptimizeLocal = isLocal && !isSvg && !import.meta.env.DEV;
  // Disable Cloudinary if error occurred, domain is blocked, or it's an SVG
  const useCloudinary =
    !hasError && !isBlockedDomain && !isSvg && (!isLocal || canOptimizeLocal);

  const srcset = useCloudinary
    ? getCloudinarySrcSet(src, { priority })
    : undefined;

  const placeholderUrl = useCloudinary
    ? getCloudinaryUrl(src, { blur: true })
    : undefined;

  // IMPORTANT FIX: Extract object-* classes to apply to the img tag, not the wrapper
  const classNames = (className || "").split(" ");
  const objectClasses = classNames.filter((c) => c.startsWith("object-"));
  const wrapperClasses = classNames.filter((c) => !c.startsWith("object-"));

  return (
    <div
      className={`relative overflow-hidden ${wrapperClasses.join(" ")}`}
      style={{
        aspectRatio:
          aspectRatio || (width && height ? width / height : undefined),
      }}
    >
      {/* 1. Blurred Placeholder Layer - Skipped for priority images to optimize LCP */}
      {useCloudinary && !isLoaded && !priority && isClient && (
        <img
          src={placeholderUrl}
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-500"
          alt=""
          aria-hidden="true"
        />
      )}

      {/* 2. Main High-Res Image */}
      <img
        ref={imgRef}
        src={
          useCloudinary
            ? getCloudinaryUrl(src, { width: defaultWidth, priority })
            : src
        }
        srcSet={useCloudinary ? srcset : undefined}
        sizes={props.sizes || "(max-width: 768px) 100vw, 800px"}
        className={`w-full h-full ${
          objectClasses.length > 0
            ? objectClasses.join(" ")
            : "object-cover object-center"
        } ${!priority && isClient ? "transition-opacity duration-700 ease-in-out" : ""} ${
          useCloudinary
            ? isLoaded || priority || !isClient
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
