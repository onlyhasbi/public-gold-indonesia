/**
 * Utility for Cloudinary Image Optimization
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryOptions {
  width?: number;
  blur?: boolean;
  priority?: boolean;
}

/**
 * Generates a Cloudinary URL with transformations based on the source and options.
 */
export function getCloudinaryUrl(src: string, options: CloudinaryOptions = {}) {
  const { width, blur, priority } = options;

  if (!src) return "";

  const isCloudinary = src.includes("res.cloudinary.com");
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  const isSvg = src.toLowerCase().endsWith(".svg");
  const isExternal =
    (src.startsWith("http") || src.startsWith("//")) && !isCloudinary;

  // Domains known to block Cloudinary fetch
  const BLOCKED_DOMAINS = ["chinapress.com.my"];
  const isBlockedDomain =
    isExternal && BLOCKED_DOMAINS.some((domain) => src.includes(domain));

  const isPublicId = [!isExternal, !isCloudinary, !isLocal, !isSvg].every(
    Boolean,
  );

  if (
    isBlockedDomain ||
    (!isExternal && !isCloudinary && !isLocal && !isPublicId)
  ) {
    return src;
  }

  const transformations = ["f_auto"];

  if (blur) {
    transformations.push("e_blur:2000", "w_20", "q_auto:low");
  } else {
    transformations.push(priority ? "q_auto" : "q_auto:eco");
    if (!priority) {
      transformations.push("dpr_auto");
    }
    // Only apply width and limit to non-SVG images to preserve vector proportions
    if (!isSvg) {
      if (width) {
        transformations.push(`w_${width}`);
      }
      transformations.push("c_limit");
    }
  }

  // Case 1: YouTube
  const ytMatch = src.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
  if (ytMatch && ytMatch[1]) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/${transformations.join(",")}/${ytMatch[1]}.jpg`;
  }

  // Case 2: Existing Cloudinary
  if (isCloudinary) {
    const isUpload = src.includes("/upload/");
    const isFetch = src.includes("/fetch/");
    const token = isUpload ? "/upload/" : isFetch ? "/fetch/" : null;

    if (token) {
      const parts = src.split(token);
      return `${parts[0]}${token}${transformations.join(",")}/${parts[1]}`;
    }
  }

  // Case 3: Local Asset (Production only)
  if (isLocal && !import.meta.env.DEV) {
    const fullUrl = `${window.location.origin}${src}`;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformations.join(",")}/${encodeURIComponent(fullUrl)}`;
  }

  // Case 4: Public ID or External Fetch
  const fetchType = isPublicId ? "upload" : "fetch";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/${fetchType}/${transformations.join(",")}/${isPublicId ? src : encodeURIComponent(src)}`;
}

/**
 * Generates a standard srcset for responsive images.
 */
export function getCloudinarySrcSet(
  src: string,
  options: Pick<CloudinaryOptions, "priority"> = {},
) {
  return [400, 800, 1200, 1600]
    .map((w) => `${getCloudinaryUrl(src, { ...options, width: w })} ${w}w`)
    .join(", ");
}
