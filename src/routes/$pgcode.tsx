import { createFileRoute, useMatches, notFound } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Benefit = lazy(() => import("../components/benefit"));
const CallToAction = lazy(() => import("../components/cta"));
const Excellence = lazy(() => import("../components/excellence"));
const PaymentMethods = lazy(() => import("../components/payment_methods"));
const PriceList = lazy(() => import("../components/pricelist"));
const PublicGold = lazy(() => import("../components/public_gold"));
const Questions = lazy(() => import("../components/questions"));

import Header from "../components/header";
import GradientHighlight from "../components/ui/gradient_highlight";
import { MovingCards } from "../components/ui/moving_card";
import { trackEvent } from "../lib/analytics";
import { queryClient } from "../lib/queryClient";
import { agentQueryOptions, goldPricesQueryOptions } from "../lib/queryOptions";
import { cn } from "../lib/utils";
import { useSEO } from "../hooks/useSEO";
import { getCloudinaryUrl, getCloudinarySrcSet } from "../lib/images";

export const Route = createFileRoute("/$pgcode")({
  component: App,
  loader: async ({ params }) => {
    // PREFETCH BOTH IN BACKGROUND
    try {
      await Promise.all([
        queryClient.ensureQueryData(goldPricesQueryOptions()),
        queryClient.ensureQueryData(agentQueryOptions(params.pgcode)),
      ]);
    } catch (err: any) {
      if (err.response?.status === 404) {
        throw notFound();
      }
      throw err;
    }
  },
});

function App() {
  const matches = useMatches();
  const pgcode = (matches.find((m) => m.routeId === "/$pgcode")?.params as any)
    ?.pgcode;

  // If we're transitioning out, pgcode might be undefined
  if (!pgcode) return null;

  const { data: pgbo } = useSuspenseQuery(agentQueryOptions(pgcode));
  const { data: goldPrices } = useQuery(goldPricesQueryOptions());

  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const displayName =
    pgbo?.nama_panggilan || pgbo?.nama_lengkap || "Authorized Dealer";
  const title = t("seo.title", { name: displayName });
  const description = t("seo.description", { name: displayName });

  useSEO({
    title,
    description,
    image: pgbo?.foto_profil_url,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: displayName,
        description: description,
        image: pgbo?.foto_profil_url,
        jobTitle: "Authorized Public Gold Dealer",
        identifier: pgbo?.pgcode,
        url: window.location.href,
        sameAs: [
          pgbo?.sosmed_facebook,
          pgbo?.sosmed_instagram,
          pgbo?.sosmed_tiktok,
        ].filter(Boolean),
      },
    },
    preloadImages: pgbo?.foto_profil_url
      ? [
          {
            src: getCloudinaryUrl(pgbo.foto_profil_url, {
              width: 800,
              priority: true,
            }),
            srcSet: getCloudinarySrcSet(pgbo.foto_profil_url, {
              priority: true,
            }),
            sizes: "(max-width: 768px) 100vw, 800px",
          },
        ]
      : undefined,
  });

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
      if (window.scrollY > 1000) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pgbo]);

  return (
    <div className="relative">
      <section id="about" className="scroll-mt-20">
        <Header pgbo={pgbo} />
      </section>

      <Suspense fallback={<div className="h-48" />}>
        <section id="advantage" className="scroll-mt-20">
          <Benefit />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-48" />}>
        <section id="public-gold" className="scroll-mt-20">
          <PublicGold />
        </section>
      </Suspense>

      <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center bg-slate-50/50 rounded-3xl animate-pulse" />}>
        <section id="products" className="scroll-mt-20">
          <PriceList price={goldPrices ?? undefined} pgbo={pgbo} />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-48" />}>
        <section id="excellence" className="scroll-mt-20">
          <PaymentMethods pgbo={pgbo} />
          <Excellence />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-64" />}>
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
      </Suspense>

      <Suspense fallback={<div className="h-48" />}>
        <Questions />
      </Suspense>

      <Suspense fallback={<div className="h-64" />}>
        <section id="contact" className="scroll-mt-20">
          <CallToAction pgbo={pgbo} />
        </section>
      </Suspense>

      {/* Scroll To Top - Hanya Mobile */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
