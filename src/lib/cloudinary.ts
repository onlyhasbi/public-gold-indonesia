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
export const optimizeImage = (url: string | null | undefined): string => {
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

  // Construct Cloudinary Fetch URL
  // Format: https://res.cloudinary.com/<cloud_name>/image/fetch/f_auto,q_auto/<url>
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${url}`;
};
