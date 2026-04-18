/**
 * Cloudinary image optimization utility.
 * Use Cloudinary's 'fetch' capability to proxy and optimize external images.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/**
 * Wraps an external image URL with Cloudinary fetch parameters for:
 * - f_auto: Automatic format selection (WebP, AVIF, etc.)
 * - q_auto: Automatic quality/compression
 */
export const optimizeImage = (
  url: string | null | undefined,
  width?: number,
): string => {
  if (!url) return "";

  // If it's already a Cloudinary URL or localized/special path, return as is
  if (
    url.includes("res.cloudinary.com") ||
    url.startsWith("/") ||
    url.startsWith(".") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const transformations = ["f_auto", "q_auto"];
  if (width) {
    transformations.push(`c_limit,w_${width}`);
  }
  const transformationString = transformations.join(",");

  // Handle YouTube thumbnails using Cloudinary's native YouTube support
  // Patterns like i3.ytimg.com/vi/ID/... or img.youtube.com/vi/ID/...
  const ytMatch = url.match(/(?:ytimg\.com|youtube\.com)\/vi\/([^/]+)/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/youtube/${transformationString}/${videoId}.jpg`;
  }

  // Construct Cloudinary Fetch URL with encoded target URL for safety
  // Format: https://res.cloudinary.com/<cloud_name>/image/fetch/<transformations>/<url>
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformationString}/${encodeURIComponent(url)}`;
};
