import { Autoplay, FreeMode, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MoveRight, MoveLeft, TrendingUp, ShieldCheck, Clock } from "lucide-react";

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
  {
    title: "250 gram",
    weight: "250g",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDG0250_1740124981.png",
    category: "goldbar",
  },
  {
    title: "1000 gram",
    weight: "1kg",
    url: "https://my-cdn.publicgold.com.my/image/catalog/product/PDG1000_1740121659.png",
    category: "goldbar",
  },
];

import { useTranslation } from "react-i18next";

function PriceList({ price }: Props) {
  const { t } = useTranslation();

  const getPrice = (item: { title: string; weight: string; category: string }) => {
    const list = price?.[item.category as PriceListKey] || [];

    const matchWithBoundary = (label: string, search: string) => {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?<![\\d.])${escaped}\\b`, "i").test(label);
    };

    // 1. Try exact match by title with word boundary
    let found = list.find((g) => matchWithBoundary(g.label, item.title));

    // 2. Try match by weight string with word boundary
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
      <div className="w-full text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50/50 border border-red-100 text-red-600 text-xs font-bold mb-6 backdrop-blur-sm shadow-sm">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="uppercase tracking-[0.15em]">{t("priceList.badge")}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          {t("priceList.title")}
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          {t("priceList.subtitle")}
        </p>
      </div>

      {/* POE Cards */}
      <div className="w-full grid md:grid-cols-2 gap-6 mb-16 relative z-10">
        {[
          {
            title: t("priceList.poe.title"),
            subtitle: t("priceList.poe.subtitle"),
            desc: t("priceList.poe.desc"),
            value: price?.poe?.[0]?.price ?? null,
            icon: <TrendingUp className="w-10 h-10 text-white/20" />,
            color: "from-red-600 to-red-700",
            isDark: true
          },
          {
            title: t("priceList.perGram.title"),
            subtitle: t("priceList.perGram.subtitle"),
            desc: t("priceList.perGram.desc"),
            value: price?.poe?.[1]?.price ?? null,
            icon: <ShieldCheck className="w-10 h-10 text-red-600/10" />,
            color: "from-white to-slate-50",
            isDark: false
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-3xl p-8 flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border ${item.isDark
              ? `bg-gradient-to-r ${item.color} text-white border-transparent`
              : `bg-gradient-to-br ${item.color} text-slate-900 border-slate-200`
              }`}
          >
            <div className="absolute top-8 right-8 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
              {item.icon}
            </div>

            <div className="relative z-10 flex flex-col flex-1">
              {/* Top: Badge, Title, Desc */}
              <div>
                <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${item.isDark ? "bg-white/15 text-white blur-none" : "bg-red-50 text-red-600"
                  }`}>
                  {item.subtitle}
                </span>
                <h3 className="text-2xl font-black mb-2 tracking-tight">{item.title}</h3>
                <p className={`text-sm font-medium ${item.isDark ? "text-red-100" : "text-slate-500"}`}>
                  {item.desc}
                </p>
              </div>

              {/* Bottom: Price + Extra Info (pushed to bottom) */}
              <div className="mt-auto pt-8">
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.isDark ? "text-red-200" : "text-slate-400"}`}>
                    {t("priceList.currency")} / {item.isDark && gramsFor300k ? `${gramsFor300k} ` : ""}Gram
                  </span>
                  <span className="text-4xl font-black tracking-tight">
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

      {/* Featured Products List */}
      <div className="w-full relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div className="text-left">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {t("products.title")}
            </h3>
            <p className="text-slate-500 text-lg">
              Pilihan investasi {t("products.types.goldbar")} & {t("products.types.dinar")} terbaik.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="swiper-prev-btn w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
              <MoveLeft className="w-5 h-5" />
            </button>
            <button className="swiper-next-btn w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
              <MoveRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="-mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)]">
          <Swiper
            slidesPerView={1.2}
            spaceBetween={16}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 2.5, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1440: { slidesPerView: 3, spaceBetween: 20 },
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
                <div className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-500 h-[340px] flex flex-col items-center text-center relative overflow-hidden">

                  {/* Background Accent */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Header Section */}
                  <div className="mb-6 w-full px-2">
                    <h4 className="text-lg font-bold text-slate-800 mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex justify-center items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                        {item.weight}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        999.9 Gold
                      </span>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="flex-1 w-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/0 via-slate-50/50 to-slate-50/0 rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000" />
                    <img
                      className="max-h-[130px] w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                      src={item.url}
                      alt={item.title}
                    />
                  </div>

                  {/* Global Price Footer */}
                  <div className="w-full pt-4 mt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
                      {t("priceList.priceLabel")}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-slate-400">
                        {t("priceList.currency")}
                      </span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {formatPrice(getPrice(item))}
                      </span>
                    </div>
                  </div>

                  {/* Hover Action Indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </BaseLayout>
  );
}

export default PriceList;
