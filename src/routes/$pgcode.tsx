import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import { lazy, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const Benefit = lazy(() => import("@/components/benefit"));
const CallToAction = lazy(() => import("@/components/cta"));
const Excellence = lazy(() => import("@/components/excellence"));
const PaymentMethods = lazy(() => import("@/components/payment_methods"));
const PriceList = lazy(() => import("@/components/pricelist"));
const PublicGold = lazy(() => import("@/components/public_gold"));
const Questions = lazy(() => import("@/components/questions"));
const MovingCards = lazy(() =>
  import("@/components/ui/moving_card").then((m) => ({
    default: m.MovingCards,
  })),
);

import Header from "@/components/header";
import NotFound from "@/components/not_found";
import GradientHighlight from "@/components/ui/gradient_highlight";
import { trackEvent } from "@/lib/analytics";
import { agentQueryOptions, goldPricesQueryOptions } from "@/lib/queryOptions";

import { getCloudinaryUrl, getCloudinarySrcSet } from "@/lib/images";
import { useLazyInteraction } from "@/hooks/useLazyInteraction";
import { LazySection } from "@/components/ui/lazy-section";

function App() {
  const { pgcode } = Route.useParams();

  // If we're transitioning out, pgcode might be undefined
  if (!pgcode) return null;

  const { data: pgbo } = useSuspenseQuery(agentQueryOptions(pgcode));

  // LAZY FETCH: Trigger gold prices only after human interaction for LCP Optimization
  const shouldFetchPrices = useLazyInteraction();
  const { data: goldPrices } = useQuery({
    ...goldPricesQueryOptions(),
    enabled: shouldFetchPrices,
  });

  const { t } = useTranslation();
  const scrollBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Save referral info for registration flow (PageID only)
    if (pgbo) {
      localStorage.setItem("ref_pageid", pgbo.pageid);
    }

    // Send visitor analytic only once per session
    const hasVisited = sessionStorage.getItem(`visited_${pgbo?.pageid}`);
    if (pgbo && !hasVisited) {
      trackEvent(pgbo.pageid, "visitor").then(() => {
        sessionStorage.setItem(`visited_${pgbo.pageid}`, "true");
      });
    }
  }, [pgbo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    let isVisible = false;

    const updateScrollTopVisibility = () => {
      const next = window.scrollY > 1000;
      if (next !== isVisible) {
        isVisible = next;
        const btn = scrollBtnRef.current;
        if (btn) {
          btn.style.opacity = next ? "1" : "0";
          btn.style.transform = next ? "translateY(0)" : "translateY(1rem)";
          btn.style.pointerEvents = next ? "auto" : "none";
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollTopVisibility);
    };

    // Set initial state without waiting for first scroll event
    updateScrollTopVisibility();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <section id="about" className="scroll-mt-20">
        <Header pgbo={pgbo} />
      </section>

      <section id="advantage" className="scroll-mt-20">
        <LazySection minHeight="400px">
          <Benefit />
        </LazySection>
      </section>

      <section id="public-gold" className="scroll-mt-20">
        <LazySection minHeight="500px">
          <PublicGold />
        </LazySection>
      </section>

      <section id="products" className="scroll-mt-20">
        <LazySection minHeight="600px">
          <PriceList price={goldPrices ?? undefined} pgbo={pgbo} />
        </LazySection>
      </section>

      <section id="excellence" className="scroll-mt-20">
        <LazySection minHeight="600px">
          <PaymentMethods pgbo={pgbo} />
          <Excellence />
        </LazySection>
      </section>

      <LazySection minHeight="400px">
        <section id="testimonials" className="scroll-mt-20">
          <div className="w-11/12 max-w-7xl mx-auto py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                <GradientHighlight
                  text={t("testimonials.title")}
                  highlight={t("ui.highlightTestimonials")}
                />
              </h2>
              <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {(t("testimonials.desc") as string)
                  .split("{mbr}")
                  .map((part: string, i: number, arr: string[]) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <br className="block md:hidden" />}
                    </span>
                  ))}
              </p>
            </div>
            <MovingCards
              items={t("testimonials.items", { returnObjects: true }) as any}
              direction="left"
              speed="slow"
            />
          </div>
        </section>
      </LazySection>

      <LazySection minHeight="400px">
        <Questions />
      </LazySection>

      <section id="contact" className="scroll-mt-20">
        <LazySection minHeight="400px">
          <CallToAction pgbo={pgbo} />
        </LazySection>
      </section>

      {/* Scroll To Top - Hanya Mobile */}
      <button
        ref={scrollBtnRef}
        onClick={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="md:hidden fixed right-6 bottom-8 w-12 h-12 bg-white/90 backdrop-blur-xl text-slate-800 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 transition-all duration-500 border border-slate-200/50 active:scale-95"
        style={{
          opacity: 0,
          transform: "translateY(1rem)",
          pointerEvents: "none",
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}

export const Route = createFileRoute("/$pgcode")({
  component: App,
  loader: async ({ params, context }) => {
    try {
      const data = await context.queryClient.ensureQueryData(
        agentQueryOptions(params.pgcode),
      );
      return { pgbo: data };
    } catch (err: any) {
      if (err.status === 404 || err.response?.status === 404) {
        throw notFound();
      }
      throw err;
    }
  },
  head: ({ loaderData }) => {
    const pgbo = (loaderData as any)?.pgbo;
    if (!pgbo) return {};

    const displayName = pgbo.nama_panggilan || "Authorized Dealer";
    const title = `${displayName} - Konsultan Emas Public Gold Indonesia`;
    const description = `Amankan masa depan keluarga dengan tabungan emas bersama Public Gold Indonesia`;
    // Use JPG format explicitly for WhatsApp/SEO Compatibility
    const image = getCloudinaryUrl(pgbo.foto_profil_url, {
      width: 800,
      format: "jpg",
    });
    const url = `https://mypublicgold.id/${pgbo.pageid}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [
        ...(pgbo.foto_profil_url
          ? [
              {
                rel: "preload" as const,
                as: "image" as const,
                href: getCloudinaryUrl(pgbo.foto_profil_url, {
                  width: 400,
                  priority: true,
                }),
                imageSrcSet: getCloudinarySrcSet(pgbo.foto_profil_url, {
                  priority: true,
                  maxWidth: 320,
                }),
                imageSizes: "(max-width: 768px) 256px, 320px",
                fetchPriority: "high" as const,
              },
            ]
          : []),
        {
          rel: "canonical" as const,
          href: url,
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: displayName,
              description: description,
              image: image,
              jobTitle: "Authorized Public Gold Dealer",
              identifier: pgbo.pgcode,
              url: url,
              sameAs: [
                pgbo.sosmed_facebook,
                pgbo.sosmed_instagram,
                pgbo.sosmed_tiktok,
              ].filter(Boolean),
            },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-10 text-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Terjadi Kesalahan</h2>
        <p className="text-slate-500 max-w-md">
          {error.message || "Gagal memuat profil konsultan."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  },
  notFoundComponent: () => <NotFound />,
});
