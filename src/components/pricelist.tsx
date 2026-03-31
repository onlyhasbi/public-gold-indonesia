import { Autoplay, FreeMode, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { TrendingUp, ShieldCheck, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import GradientHighlight from "./ui/gradient_highlight";
import { useState } from "react";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import BaseLayout from "../layout/base";
import type { GoldPricesResult } from "../types";

type PriceListKey = "poe" | "dinar" | "goldbar";

type Props = {
  price?: GoldPricesResult;
};

export const dinar = [
  {
    title: "1/4 Dinar",
    weight: "1.0625g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDI0001B.png",
    category: "dinar",
  },
  {
    title: "1/2 Dinar",
    weight: "2.125g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDI0001A.png",
    category: "dinar",
  },
  {
    title: "1 Dinar",
    weight: "4.25g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDI0001.png",
    category: "dinar",
  },
  {
    title: "5 Dinar",
    weight: "21.25g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDI0005.png",
    category: "dinar",
  },
  {
    title: "10 Dinar",
    weight: "42.5g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDI0010.png",
    category: "dinar",
  },
];

export const goldbar = [
  {
    title: "0.5 gram",
    weight: "0.5g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PP0001NL_1756438125.png",
    category: "goldbar",
  },
  {
    title: "1 gram",
    weight: "1g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PP0001NK_1753243761.png",
    category: "goldbar",
  },
  {
    title: "5 gram",
    weight: "5g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PGI0005.png",
    category: "goldbar",
  },
  {
    title: "10 gram",
    weight: "10g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PGI0010.png",
    category: "goldbar",
  },
  {
    title: "20 gram",
    weight: "20g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PGI0020.png",
    category: "goldbar",
  },
  {
    title: "50 gram",
    weight: "50g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PGI0050.png",
    category: "goldbar",
  },
  {
    title: "100 gram",
    weight: "100g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PGI0100.png",
    category: "goldbar",
  },
];

import { useTranslation } from "react-i18next";

function PriceList({ price }: Props) {
  const { t, i18n } = useTranslation();
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  const getPrice = (item: { title: string; weight: string; category: string }) => {
    const list = price?.[item.category as PriceListKey] || [];

    const matchWithBoundary = (label: string, search: string) => {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?<![\\d.])${escaped}\\b`, "i").test(label);
    };

    let found = list.find((g) => matchWithBoundary(g.label, item.title));

    if (!found) {
      found = list.find((g) => matchWithBoundary(g.label, item.weight));
    }

    if (!found || !found.price) return null;
    return found.price;
  };

  const parsePriceToNumber = (priceStr: string | null | undefined): number | null => {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  };

  const perGramPrice = parsePriceToNumber(price?.poe?.[1]?.price);
  const budgetAmount = 300_000;
  const gramsFor300k = perGramPrice ? (budgetAmount / perGramPrice).toFixed(4) : null;

  const formatPrice = (priceValue: string | null | undefined) => {
    if (!priceValue) return (
      <span className="flex items-center gap-1 text-slate-400">
        <Clock className="w-3 h-3 animate-pulse" />
        {t("priceList.loading")}
      </span>
    );
    return priceValue;
  };

  return (
    <BaseLayout className="flex-col bg-white overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 -z-1" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 -z-1" />

      {/* Section Header */}
      <div className="text-center mb-16 relative z-10 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          <GradientHighlight text={t("priceList.title")} highlight="Harga Emas" />
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3">
          <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed text-center">
            {(() => {
              const text = t("priceList.subtitle");
              const parts = text.split("{mbr}");
              if (parts.length > 1) {
                return (
                  <>
                    <span className="md:inline hidden">{parts[0]}{parts[1]}</span>
                    <span className="inline md:hidden">{parts[0]}</span>
                  </>
                );
              }
              return text;
            })()}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline md:hidden text-slate-500 text-base">
              {t("priceList.subtitle").split("{mbr}")[1] || ""}
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {new Intl.DateTimeFormat(i18n.language || "id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }).format(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* POE & Markets Stats */}
      <div className="w-full flex flex-col-reverse lg:flex-row gap-6 mb-16 relative z-10 items-stretch">

        {/* TradingView Widget */}
        <div className="w-full lg:flex-1 h-[400px] lg:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden bg-white">
          {/* Wrapper peretas batas (Border hack wrapper) - Menyembunyikan 1px border native TradingView dari dalam iframe dengan cara menggesernya keluar dari 'overflow-hidden' */}
          <div className="w-[calc(100%+4px)] h-[calc(100%+4px)] -ml-[2px] -mt-[2px]">
            <iframe
              src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=2&timezone=Asia%2FJakarta&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=id"
              className="w-full h-full border-none pointer-events-auto min-h-[400px]"
              title="TradingView XAUUSD"
            />
          </div>
        </div>

        {/* Kontainer Utama POE & Harga Per Gram (Unified Side Panel) */}
        <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col shrink-0 overflow-hidden rounded-2xl md:rounded-3xl transition-all duration-300 bg-white group/container h-auto lg:h-[420px]">

          {/* PRIMARY: Pre-Order Emas (POE) - Top Stack */}
          <div className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group/primary cursor-default">
            {/* Dekorasi Ikon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 transition-transform duration-700 group-hover/primary:scale-110 pointer-events-none mix-blend-overlay">
              <TrendingUp className="w-48 h-48 sm:w-56 sm:h-56" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-medium mb-1 tracking-tight text-red-100">
                Harga per <span className="font-black text-white bg-white/10 px-2 py-0.5 rounded-md mx-0.5">{gramsFor300k ?? "..."}</span> gram
              </h3>

              <div className="mt-1">
                <span className="text-3xl lg:text-4xl font-black tracking-tighter leading-none whitespace-nowrap">
                  {formatPrice(price?.poe?.[0]?.price)}
                </span>
              </div>
            </div>

            {/* Glossy Overlay Tersembunyi */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover/primary:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          </div>

          {/* Divider Horizontal Universal */}
          <div className="h-[1px] w-full bg-slate-200" />

          {/* SECONDARY: Harga Per Gram - Bottom Stack */}
          <div className="flex-1 bg-gradient-to-br from-white to-slate-50 p-6 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group/secondary cursor-default">
            {/* Dekorasi Ikon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] transition-transform duration-700 group-hover/secondary:scale-110 pointer-events-none">
              <ShieldCheck className="w-40 h-40 sm:w-48 sm:h-48 text-slate-900" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center gap-1">
              <h4 className="text-lg md:text-xl font-medium tracking-tight mb-1 text-slate-500 w-full text-center">
                Harga per gram
              </h4>
              <div className="w-full mt-1">
                <span className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                  {formatPrice(price?.poe?.[1]?.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products List */}
      <div
        className="w-full relative z-10"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setHoverSide(x < rect.width / 2 ? "left" : "right");
        }}
        onMouseLeave={() => setHoverSide(null)}
      >

        {/* Navigation Arrows positioned on sides */}
        <button className={`swiper-prev-btn absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg duration-300 ${hoverSide === "left" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <ChevronLeft className="w-5 md:w-6 h-5 md:h-6" />
        </button>
        <button className={`swiper-next-btn absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg duration-300 ${hoverSide === "right" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <ChevronRight className="w-5 md:w-6 h-5 md:h-6" />
        </button>

        <div className="-mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)]">
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".swiper-prev-btn",
              nextEl: ".swiper-next-btn",
            }}
            modules={[FreeMode, Pagination, Autoplay, Navigation]}
            className="!pb-16 !overflow-visible"
          >
            {[...dinar, ...goldbar].map((item, index) => (
              <SwiperSlide key={`${item.title}-${index}`}>
                <Link
                  to="/register"
                  className="group relative flex h-[320px] w-full flex-col items-center overflow-hidden rounded-[2rem] bg-white/40 p-6 text-center backdrop-blur-xl transition-all duration-500 hover:bg-white/60 hover:shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1),20px_0_40px_-20px_rgba(0,0,0,0.1)] md:h-[380px]"
                >
                  {/* Premium Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-red-50/20 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  
                  {/* Reflective Shine Effect */}
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div className="absolute -inset-[100%] top-0 h-full w-1/2 -rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 group-hover:animate-shine" />
                  </div>

                  {/* Header Section */}
                  <div className="relative z-10 w-full flex-shrink-0">
                    <div className="mb-1.5 flex justify-center items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Fine Gold 999.9
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-red-900 md:text-xl text-center w-full">
                      {item.title}
                    </h4>
                  </div>

                  {/* Image Section with Floating Animation */}
                  <div className="relative z-10 flex flex-1 w-full items-center justify-center p-4">
                    <img
                      className="h-auto max-h-[120px] w-auto object-contain drop-shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:animate-float md:max-h-[160px]"
                      src={item.url}
                      alt={item.title}
                    />
                  </div>

                  {/* Bottom Info */}
                  <div className="relative z-10 mt-auto w-full">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/5 text-slate-700 text-xs font-bold tracking-wide transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 group-hover:shadow-lg group-hover:shadow-red-200">
                      {item.weight}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </BaseLayout>
  );
}

export default PriceList;
