import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Hook to manage document title and meta tags dynamically.
 * Centralizes SEO logic for better Separation of Concerns.
 */
export function useSEO({ title, description, image, url }: SEOOptions) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set/update meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // 3. Update Meta Tags
    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
    }

    if (image) {
      setMetaTag("property", "og:image", image);
    }

    setMetaTag("property", "og:title", title);
    
    if (url || typeof window !== 'undefined') {
      setMetaTag("property", "og:url", url || window.location.href);
    }

  }, [title, description, image, url]);
}
