import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import Benefit from "../components/benefit";
import CallToAction from "../components/cta";
import Excellence from "../components/excellence";
import Header from "../components/header";
import PaymentMethods from "../components/payment_methods";

import PriceList from "../components/pricelist";
import PublicGold from "../components/public_gold";
import { MovingCards } from "../components/ui/moving_card";
import { getGoldPrices } from "../services/getGoldPrices";
import { useTranslation } from "react-i18next";

import Questions from "../components/questions";
import GradientHighlight from "../components/ui/gradient_highlight";

export const Route = createFileRoute("/")({
  component: App,
  loader: getGoldPrices,
});

function App() {
  const goldPrices = Route.useLoaderData();
  const { t } = useTranslation();
  return (
    <div className="relative">
      <section id="about" className="scroll-mt-20">
        <Header />
      </section>
      <section id="advantage" className="scroll-mt-20">
        <Benefit />
      </section>
      <section id="public-gold" className="scroll-mt-20">
        <PublicGold />
      </section>
      <section id="products" className="scroll-mt-20">
        <PriceList price={goldPrices ?? undefined} />
      </section>
      <section id="excellence" className="scroll-mt-20">
        <PaymentMethods />
        <Excellence />
      </section>
      <section id="testimonials" className="scroll-mt-20">
        <div className="w-11/12 max-w-7xl mx-auto py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              <GradientHighlight text={t("testimonials.title")} highlight="Kata Mereka" />
            </h2>
            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t("testimonials.desc").split("{mbr}").map((part, i, arr) => (
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
        <CallToAction />
      </section>

      {/* Scroll To Top - Hanya Mobile */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="md:hidden fixed right-6 bottom-6 w-12 h-12 bg-slate-800/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-xl z-50 hover:bg-slate-700 transition-all border border-slate-700/50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}
