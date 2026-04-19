import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AppLink as Link } from "@/lib/router-wrappers";
import { ChevronDown, Languages, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { agentQueryOptions } from "@/lib/queryOptions";
import { OptimizedImage } from "@/components/ui/optimized-image";

function Topbar({ pgbo: propsPgbo }: { pgbo?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { pgcode } = useParams({ strict: false }) as { pgcode?: string };

  const { data: pageid } = useQuery({
    ...agentQueryOptions(pgcode || ""),
    enabled: !!pgcode && !propsPgbo,
    select: (data) => data?.pageid,
  });

  const pgbo = propsPgbo || { pageid };
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lang = i18n.language;

  const languages = [
    { id: "id", label: "Indonesia", emoji: "🇮🇩", code: "ID" },
    { id: "en", label: "English", emoji: "🇬🇧", code: "EN" },
    { id: "ms", label: "Malaysia", emoji: "🇲🇾", code: "MS" },
    { id: "zh", label: "Chinese", emoji: "🇨🇳", code: "ZH" },
    { id: "ta", label: "Tamil", emoji: "🇮🇳", code: "TA" },
    { id: "ar", label: "العربية", emoji: "🇸🇦", code: "AR" },
  ];

  const toggleLang = (selected: string) => {
    i18n.changeLanguage(selected);
    setIsOpen(false);
  };

  const currentLang = languages.find((l) => lang.startsWith(l.id));
  const currentLangEmoji = currentLang?.emoji ?? "🌐";
  const currentLangLabel = currentLang?.code ?? "EN";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm"
            : "h-20 bg-transparent",
        )}
      >
        <div className="flex items-center justify-between w-11/12 max-w-7xl mx-auto h-full">
          {/* Logo */}
          <Link
            to="/$pgcode"
            params={{ pgcode: pgbo?.pageid || "" }}
            onClick={() => {
              if (window.location.pathname.startsWith("/")) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <OptimizedImage
              src="/logo.svg"
              alt="Public Gold"
              priority
              className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform object-contain shrink-0"
              width={200}
              height={56}
            />
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Selector (Desktop) */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      rounded="xl"
                      className="flex items-center gap-2 px-3 font-semibold border-slate-200 hover:border-slate-300 transition-all h-11"
                    >
                      <Languages className="w-4 h-4 text-slate-400" />
                      <span className="flex items-center gap-1.5">
                        <span className="text-base leading-none">
                          {currentLangEmoji}
                        </span>
                        <span>{currentLangLabel}</span>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-2xl p-2"
                >
                  {languages.map((l) => (
                    <DropdownMenuItem
                      key={l.id}
                      onClick={() => toggleLang(l.id as any)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer",
                        lang.startsWith(l.id)
                          ? "text-red-600 font-bold bg-red-50/50"
                          : "text-slate-600",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{l.emoji}</span>
                        {l.label}
                      </span>
                      {lang.startsWith(l.id) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Registration Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    rounded="xl"
                    className="font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all h-11"
                  >
                    {t("nav.register")}
                    <ChevronDown className="w-3.5 h-3.5 ml-1 transition-transform duration-200" />
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl p-2 z-50"
              >
                <DropdownMenuItem
                  render={
                    <Link
                      to="/register"
                      search={{ type: "dewasa", ref: pgbo?.pageid }}
                      preload="intent"
                      className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors font-semibold no-underline"
                    >
                      <OptimizedImage
                        src="/dewasa.webp"
                        alt={t("nav.accountAdult")}
                        className="w-7 h-7 rounded-full object-cover shrink-0 aspect-square object-top"
                        width={28}
                        height={28}
                      />
                      {t("nav.accountAdult")}
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      to="/register"
                      search={{ type: "anak", ref: pgbo?.pageid }}
                      preload="intent"
                      className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors font-semibold no-underline"
                    >
                      <OptimizedImage
                        src="/anak.webp"
                        alt={t("nav.accountChild")}
                        className="w-7 h-7 rounded-full object-cover shrink-0 aspect-square object-top"
                        width={28}
                        height={28}
                      />
                      {t("nav.accountChild")}
                    </Link>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-white transition-all duration-500 ease-in-out lg:hidden flex flex-col",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none translate-y-4",
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <OptimizedImage
                src="/logo.svg"
                alt="Public Gold"
                className="h-8 w-auto"
                width={120}
                height={32}
              />
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              Language
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => toggleLang(l.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    lang.startsWith(l.id)
                      ? "bg-white border-red-600 text-red-600 shadow-md shadow-red-100"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100",
                  )}
                >
                  <span className="text-2xl">{l.emoji}</span>
                  <span className="text-xs font-bold">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Topbar;
