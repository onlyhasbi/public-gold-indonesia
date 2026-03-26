import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const REGISTER_URL =
  "/api-proxy/index.php?route=account/register&intro_pgcode=PG01387609&is_dealer=1";

function RegisterPage() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchRegistrationPage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(REGISTER_URL);
        if (!response.ok) {
          throw new Error(`Gagal memuat halaman: ${response.status}`);
        }

        let html = await response.text();

        // Parse HTML to remove the logo element
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Remove the logo link (a > img.pbgold-logo)
        const logoImages = doc.querySelectorAll("img.pbgold-logo");
        logoImages.forEach((img) => {
          const parentLink = img.closest("a");
          if (parentLink) {
            parentLink.remove();
          } else {
            img.remove();
          }
        });

        // Add a <base> tag so relative URLs (CSS, JS, images) resolve correctly
        const existingBase = doc.querySelector("base");
        if (!existingBase) {
          const base = doc.createElement("base");
          base.href = "https://publicgold.co.id/";
          base.target = "_self";
          doc.head.prepend(base);
        }
        // Inject a back button before the "Pendaftaran Pelanggan" heading
        const headings = doc.querySelectorAll("h1, h2, h3, .panel-heading, [class*='heading']");
        headings.forEach((heading) => {
          if (heading.textContent?.includes("Pendaftaran Pelanggan")) {
            // Create back arrow link
            const backLink = doc.createElement("a");
            backLink.href = "javascript:void(0)";
            backLink.setAttribute("onclick", "window.top.history.back(); return false;");
            backLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="m15 18-6-6 6-6"/></svg>`;
            backLink.setAttribute("style", "display:inline-flex;align-items:center;justify-content:center;margin-right:10px;color:white;text-decoration:none;vertical-align:middle;opacity:0.9;cursor:pointer;");
            backLink.setAttribute("title", "Kembali");
            heading.insertBefore(backLink, heading.firstChild);
          }
        });

        // Serialize back to HTML string
        const modifiedHtml = doc.documentElement.outerHTML;
        setHtmlContent(modifiedHtml);
      } catch (err: any) {
        console.error("Error fetching registration page:", err);
        setError(
          err.message || "Terjadi kesalahan saat memuat halaman pendaftaran."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationPage();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-slate-600 font-medium">
          Memuat halaman pendaftaran...
        </p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh]">
      {htmlContent && (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          className="w-full h-full border-none"
          title="Pendaftaran Public Gold"
          allowFullScreen
        />
      )}
    </div>
  );
}
