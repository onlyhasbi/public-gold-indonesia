import { AlertCircle, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import GradientHighlight from "./ui/gradient_highlight";
import { Spinner } from "./ui/spinner";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from './ui/EmblaCarouselButtons'

import BaseLayout from "../layout/base";
import type { GoldPricesResult } from "../types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Embla Tween Logic Constants
const TWEEN_FACTOR_BASE = 0.8 // Pronounced factor for 'Pop-out' effect

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max)

const PRINTING_COSTS: Record<string, number> = {
  // Goldbar
  "0.5g": 52500,
  "1g": 52500,
  "5g": 30000,
  "10g": 45000,
  "20g": 70000,
  "50g": 120000,
  "100g": 210000,
  // Dinar
  "1.0625g": 70000,
  "2.125g": 30000,
  "4.25g": 30000,
  "21.25g": 70000,
  "42.5g": 120000,
};

type Props = {
  price?: GoldPricesResult;
  pgbo?: any;
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

const allProducts = [...dinar, ...goldbar];

function PriceList({ price, pgbo }: Props) {
  const { t, i18n } = useTranslation();
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);
  const [priceMode, setPriceMode] = useState<"tabungan" | "tunai">("tabungan");

  const getWeightNumber = (weightStr: string): number => {
    return parseFloat(weightStr.replace(/[^\d.]/g, '')) || 0;
  };

  const parsePriceToNumber = (priceStr: string | null | undefined): number | null => {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  };

  const perGramPrice = useMemo(() => parsePriceToNumber(price?.poe?.[1]?.price), [price]);
  const budgetAmount = 300_000;
  const gramsFor300k = perGramPrice ? (budgetAmount / perGramPrice).toFixed(4) : null;

  // Embla Setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<(HTMLElement | null)[]>([])

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi)

  const setTweenNodes = useCallback((emblaApi: any) => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode: HTMLElement) => {
      return slideNode.querySelector('.embla__tween__node') as HTMLElement | null
    })
  }, [])

  const setTweenFactor = useCallback((emblaApi: any) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenScale = useCallback((emblaApi: any, event?: any) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = event?.type === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slideRegistry = engine.slideRegistry
      if (!slideRegistry) return

      const slidesInSnap = slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex: number) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem: any) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
        const scale = numberWithinRange(tweenValue, 0.65, 1).toString()
        const opacity = numberWithinRange(tweenValue, 0.4, 1).toString()
        const tweenNode = tweenNodes.current[slideIndex]

        if (tweenNode) {
          tweenNode.style.transform = `scale(${scale})`
          tweenNode.style.opacity = opacity
        }
      })
    })
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
  }, [emblaApi, tweenScale, setTweenNodes, setTweenFactor])


  const formatPrice = (priceValue: string | number | null | undefined) => {
    if (priceValue === null || priceValue === undefined) return (
      <span className="flex items-center gap-2 text-slate-400">
        <Spinner size={12} className="text-slate-400 opacity-100" />
        {t("priceList.loading")}
      </span>
    );

    const val = typeof priceValue === 'string' ? parsePriceToNumber(priceValue) : priceValue;
    if (val === null) return "Rp ...";

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('Rp', 'Rp ');
  };

  const getCalculatedPrice = (item: typeof allProducts[0]) => {
    const weight = getWeightNumber(item.weight);
    let printCost = PRINTING_COSTS[item.weight] || 0;

    if (priceMode === "tabungan") {
      if (!perGramPrice) return null;
      return (perGramPrice * weight) + printCost;
    } else {
      // mode tunai: check for special promotional printing costs
      if (item.category === "goldbar") {
        if (item.weight === "1g") printCost = 0;
        else if (item.weight === "5g") printCost = 15000;
      }

      const apiArray = item.category === "dinar" ? price?.dinar : price?.goldbar;
      const apiItem = apiArray?.find(p => p.label === item.title);
      const apiPrice = parsePriceToNumber(apiItem?.price);

      if (!apiPrice) return null;
      return apiPrice + printCost;
    }
  };

  return (
    <BaseLayout className="flex-col bg-white overflow-hidden relative">
      <style>{`
        .embla {
          overflow: hidden;
          width: 100%;
        }
        .embla__viewport {
          overflow: visible;
          cursor: grab;
        }
        .embla__viewport:active {
          cursor: grabbing;
        }
        .embla__container {
          display: flex;
          align-items: center;
          touch-action: pan-y pinch-zoom;
          margin-left: -1rem;
        }
        .embla__slide {
          flex: 0 0 85%;
          min-width: 0;
          padding-left: 1rem;
        }
        @media (min-width: 768px) {
          .embla__slide {
            flex: 0 0 60%;
          }
        }
        @media (min-width: 1024px) {
          .embla__slide {
            flex: 0 0 42%;
          }
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 -z-1" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 -z-1" />

      {/* Section Header */}
      <div className="text-center mb-12 relative z-10 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          <GradientHighlight text={t("priceList.title")} highlight="Harga Emas" />
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 px-4">
          <p className="text-slate-500 text-sm md:text-lg max-w-2xl leading-relaxed text-center">
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
            <span className="inline md:hidden text-slate-500 text-sm">
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

      {/* Price Stats Section - Minimalist Centered Layout with Divider */}
      <div className="w-full max-w-5xl mx-auto mb-16 relative z-10 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 py-10">
          {/* Column 1: Saving Estimate */}
          <div className="flex flex-col items-center justify-center group cursor-default">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">
                Harga per <span className="text-red-600 underline underline-offset-4 decoration-red-600/30 font-black">{gramsFor300k ?? "..."}</span> gram
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter transition-all duration-500 group-hover:scale-105 group-hover:text-red-600">
              {formatPrice(price?.poe?.[0]?.price)}
            </div>
          </div>

          <div className="hidden md:block w-[1.5px] h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

          {/* Column 2: Spot Price */}
          <div className="flex flex-col items-center justify-center group cursor-default">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">
                Harga per gram saat ini
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter transition-all duration-500 group-hover:scale-105 group-hover:text-red-600">
              {formatPrice(price?.poe?.[1]?.price)}
            </div>
          </div>

          <div className="hidden md:block w-[1.5px] h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

          {/* Column 3: Pricing Switch */}
          <div className="flex flex-col items-center justify-center group cursor-default">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase leading-none">
                  Pilihan Harga
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-slate-300 hover:text-red-500 transition-colors">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="center" className="p-5 shadow-2xl border-slate-100 ring-1 ring-black/5 rounded-2xl">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-left">Informasi Harga</h4>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed italic text-left">
                          Harga bersifat estimasi dan akan dikunci saat pesanan dibuat.
                          Update harga berkala: <span className="font-bold text-slate-700">Tunai</span> (setiap 20 menit), <span className="font-bold text-slate-700">Tabungan</span> (setiap 24 jam atau jika terjadi fluktuasi signifikan pada pasar emas global XAUUSD).
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-full flex items-center border border-slate-200/60 transition-all duration-500 group-hover:border-slate-300">
              <button
                onClick={() => setPriceMode("tabungan")}
                className={cn(
                  "px-8 py-2.5 rounded-full text-[11px] md:text-xs font-black transition-all duration-300 uppercase tracking-wide",
                  priceMode === "tabungan"
                    ? "bg-white text-red-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Tabungan
              </button>
              <button
                onClick={() => setPriceMode("tunai")}
                className={cn(
                  "px-8 py-2.5 rounded-full text-[11px] md:text-xs font-black transition-all duration-300 uppercase tracking-wide",
                  priceMode === "tunai"
                    ? "bg-white text-red-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Tunai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Section (Full Width Focused) */}
      <div
        className="w-full relative z-10 mb-16"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setHoverSide(x < rect.width / 2 ? "left" : "right");
        }}
        onMouseLeave={() => setHoverSide(null)}
      >
        {/* Navigation Arrows */}
        <PrevButton
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
          className={cn(
            "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg duration-300",
            hoverSide === "left" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
        <NextButton
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
          className={cn(
            "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg duration-300",
            hoverSide === "right" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />

        <div className="embla">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {allProducts.map((item, index) => {
                const weightNum = getWeightNumber(item.weight);
                const calculatedPrice = getCalculatedPrice(item);

                return (
                  <div className="embla__slide" key={`${item.title}-${index}`}>
                    <div className="embla__tween__node w-full">
                      <Link
                        to="/register"
                        search={{ ref: pgbo?.pageid }}
                        className={cn(
                          "group relative flex w-full flex-col items-center overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-xl p-6 md:py-8 md:px-10 text-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] transition-all duration-500 no-underline border border-white/40",
                          "aspect-[4/3] h-auto"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-red-50/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                        {/* Title Section */}
                        <div className="relative z-10 w-full flex-shrink-0 mb-4">
                          <h4 className="text-xl font-bold text-slate-800 transition-all duration-500 group-hover:text-red-700 lg:text-2xl text-center w-full tracking-tight">
                            {item.title}
                          </h4>
                          <div className="mt-1 flex items-center justify-center gap-1.5 opacity-60">
                            <span className="text-[10px] md:text-xs tracking-[0.051em] text-slate-600 uppercase font-medium">
                              Fine Gold 999.9
                            </span>
                          </div>
                        </div>

                        {/* Image Section - Scaled Down slightly for space */}
                        <div className="relative z-10 flex flex-1 w-full items-center justify-center py-4">
                          <img
                            className="h-full max-h-[140px] md:max-h-[200px] w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2"
                            src={item.url}
                            alt={item.title}
                          />
                        </div>

                        {/* Price Section */}
                        <div className="relative z-10 w-full flex-shrink-0 mt-6 flex flex-col items-center">
                          <div className="text-xl md:text-2xl font-black tracking-tight leading-none text-slate-900">
                            {formatPrice(calculatedPrice)}
                          </div>
                          <div className="w-10 h-1.5 bg-red-600 rounded-full mt-3"></div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default PriceList;
