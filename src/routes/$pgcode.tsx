import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, useMatches, notFound } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import { lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Benefit = lazy(() => import("@/components/benefit"));
const CallToAction = lazy(() => import("@/components/cta"));
const Excellence = lazy(() => import("@/components/excellence"));
const PaymentMethods = lazy(() => import("@/components/payment_methods"));
const PriceList = lazy(() => import("@/components/pricelist"));
const PublicGold = lazy(() => import("@/components/public_gold"));
const Questions = lazy(() => import("@/components/questions"));

import Header from "@/components/header";
import NotFound from "@/components/not_found";
import GradientHighlight from "@/components/ui/gradient_highlight";
import { MovingCards } from "@/components/ui/moving_card";
import { trackEvent } from "@/lib/analytics";
import { agentQueryOptions, goldPricesQueryOptions } from "@/lib/queryOptions";
import { cn } from "@/lib/utils";

import { getCloudinaryUrl, getCloudinarySrcSet } from "@/lib/images";
import { useLazyInteraction } from "@/hooks/useLazyInteraction";
import { LazySection } from "@/components/ui/lazy-section";

function App() {
  const matches = useMatches();
  const pgcode = (
    matches.find((m: any) => m.routeId === "/$pgcode")?.params as any
  )?.pgcode;

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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Save referral info for registration flow (PageID only)
    if (pgbo) {
      localStorage.setItem("ref_pageid", pgbo.pageid);
    }
  }, [pgbo]);

  useEffect(() => {
    // Send visitor analytic only once per session
    const hasVisited = sessionStorage.getItem(`visited_${pgbo?.pageid}`);
    if (pgbo && !hasVisited) {
      trackEvent(pgbo.pageid, "visitor").then(() => {
        sessionStorage.setItem(`visited_${pgbo.pageid}`, "true");
      });
    }

    const handleScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 1000) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [pgbo]);

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
        onClick={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className={cn(
          "md:hidden fixed right-6 bottom-8 w-12 h-12 bg-white/90 backdrop-blur-xl text-slate-800 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 transition-all duration-500 border border-slate-200/50 active:scale-95",
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
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
                rel: "preload",
                as: "image",
                href: getCloudinaryUrl(pgbo.foto_profil_url, {
                  width: 400,
                  priority: true,
                }),
                imageSrcset: getCloudinarySrcSet(pgbo.foto_profil_url, {
                  priority: true,
                }),
                imageSizes: "(max-width: 768px) 100vw, 400px",
                fetchpriority: "high",
              },
            ]
          : []),
        {
          rel: "preload",
          as: "image",
          href: getCloudinaryUrl("/5g.webp", { width: 96, priority: true }),
          fetchpriority: "high",
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
