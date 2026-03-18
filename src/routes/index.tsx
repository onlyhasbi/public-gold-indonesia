import { createFileRoute } from "@tanstack/react-router";

import { Suspense } from "react";
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

export const Route = createFileRoute("/")(
  {
    component: App,
    loader: getGoldPrices,
  },
);

function App() {
  const goldPrices = Route.useLoaderData();
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
              <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
                {t("testimonials.badge")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                {t("testimonials.title")}
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                {t("testimonials.desc")}
              </p>
            </div>
            <MovingCards
              items={t("testimonials.items", { returnObjects: true }) as any}
              direction="right"
              speed="slow"
            />
          </div>
        </section>
        <Questions />
        <section id="contact" className="scroll-mt-20">
          <CallToAction />
        </section>
        <a
          className="fixed left-6 bottom-6"
          href="https://wa.me/628979901844"
          target="_blank"
          rel="noopener noreferrer"
          title="Whatsapp"
        >
          <img className="w-10" src="./whatsapp.png" alt="whatsapp-logo" />
        </a>
      </div>
    </Suspense>
  );
}
