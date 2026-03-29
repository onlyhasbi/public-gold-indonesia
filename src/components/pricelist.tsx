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
        <div className="flex flex-col md:flex-row items-center justify-center gap-3">
          <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
            {t("priceList.subtitle")}
          </p>
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

      {/* Markets & POE Stats */}
      <div className="w-full flex flex-col lg:flex-row gap-6 mb-16 relative z-10 items-stretch">
        
        {/* TradingView Widget */}
        <div className="w-full lg:flex-1 h-[400px] lg:h-auto rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
          <iframe 
            src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=2&timezone=Asia%2FJakarta&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=id"
            className="w-full h-full border-none pointer-events-auto min-h-[400px] lg:min-h-full"
            title="TradingView XAUUSD"
          />
        </div>

        {/* POE & Per Gram Cards */}
        <div className="w-full lg:w-[35%] xl:w-[30%] grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-6 shrink-0">
          {[
            {
              title: "Pre-Order Emas (POE)",
              unit: gramsFor300k ? `Rp / ${gramsFor300k} Gram` : `Rp / ... Gram`,
              value: price?.poe?.[0]?.price ?? null,
              icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white/20" />,
              color: "from-red-600 to-red-700",
              isDark: true
            },
            {
              title: "Harga Per Gram",
              unit: "Rp / Gram",
              value: price?.poe?.[1]?.price ?? null,
              icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-600/10" />,
              color: "from-white to-slate-50",
              isDark: false
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border h-full ${item.isDark
                ? `bg-gradient-to-r ${item.color} text-white border-transparent`
                : `bg-gradient-to-br ${item.color} text-slate-900 border-slate-200`
                }`}
            >
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5 md:top-6 md:right-6 lg:top-8 lg:right-8 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
                {item.icon}
              </div>

              <div className="relative z-10 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-[12px] sm:text-[14px] md:text-xl lg:text-2xl font-black mb-1.5 md:mb-2 tracking-tight pr-6 md:pr-10 lg:pr-12 leading-tight">{item.title}</h3>

                {/* Price + Extra Info */}
                <div className="mt-auto pt-4 md:pt-6 lg:pt-8 w-full">
                  <div className="flex flex-col">
                    <span className={`text-[8px] sm:text-[9px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-1.5 break-words ${item.isDark ? "text-red-200" : "text-slate-400"}`}>
                      {item.unit}
                    </span>
                    <span className="text-[14px] sm:text-base md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-none whitespace-nowrap">
                      {formatPrice(item.value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>
          ))}
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
                <Link to="/register" className="group bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-5 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-500 h-[290px] md:h-[340px] flex flex-col items-center text-center relative overflow-hidden block cursor-pointer">

                  {/* Background Accent */}
                  <div className="absolute -top-20 -right-20 md:-top-24 md:-right-24 w-40 h-40 md:w-48 md:h-48 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Header Section */}
                  <div className="mb-4 md:mb-6 w-full px-1 md:px-2 flex-shrink-0">
                    <h4 className="text-[15px] md:text-lg font-bold text-slate-800 mb-1 lg:mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex justify-center items-center gap-1.5 md:gap-2">
                      <span className="px-2 py-0.5 rounded-md md:rounded-lg bg-red-50 text-red-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                        {item.weight}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        999.9 Gold
                      </span>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/0 via-slate-50/50 to-slate-50/0 rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000" />
                    <img
                      className="max-h-[100px] md:max-h-[130px] w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                      src={item.url}
                      alt={item.title}
                    />
                  </div>

                  {/* Global Price Footer */}
                  <div className="w-full pt-3 md:pt-4 mt-3 md:mt-3 border-t border-slate-100 flex-shrink-0">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5 md:mb-1">
                      {t("priceList.priceLabel")}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400">
                        {t("priceList.currency")}
                      </span>
                      <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        {formatPrice(getPrice(item))}
                      </span>
                    </div>
                  </div>

                  {/* Hover Action Indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
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
