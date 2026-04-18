import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import Benefit from "../components/benefit";
import CallToAction from "../components/cta";
import Excellence from "../components/excellence";
import Header from "../components/header";
import PaymentMethods from "../components/payment_methods";

import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PriceList from "../components/pricelist";
import PublicGold from "../components/public_gold";
import Questions from "../components/questions";
import GradientHighlight from "../components/ui/gradient_highlight";
import { MovingCards } from "../components/ui/moving_card";
import { trackEvent } from "../lib/analytics";
import { queryClient } from "../lib/queryClient";
import { agentQueryOptions, goldPricesQueryOptions } from "../lib/queryOptions";
import { cn } from "../lib/utils";
import { useSEO } from "../hooks/useSEO";

export const Route = createFileRoute("/$pgcode")({
  component: App,
  loader: async ({ params }) => {
    try {
      // START BOTH IN PARALLEL
      // Prefetch gold prices in the background (no await)
      queryClient.prefetchQuery(goldPricesQueryOptions());

      // Ensure agent data is ready for the initial render (await)
      await queryClient.ensureQueryData(agentQueryOptions(params.pgcode));
    } catch {
      throw notFound();
    }
  },
});

function App() {
  const { pgcode } = Route.useParams();
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
      <section id="advantage" className="scroll-mt-20">
        <Benefit />
      </section>
      <section id="public-gold" className="scroll-mt-20">
        <PublicGold />
      </section>
      <section id="products" className="scroll-mt-20">
        <PriceList price={goldPrices ?? undefined} pgbo={pgbo} />
      </section>
      <section id="excellence" className="scroll-mt-20">
        <PaymentMethods pgbo={pgbo} />
        <Excellence />
      </section>
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
      <Questions />
      <section id="contact" className="scroll-mt-20">
        <CallToAction pgbo={pgbo} />
      </section>

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
