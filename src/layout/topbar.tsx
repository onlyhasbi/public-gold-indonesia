import { navigation } from "../constant/navigation";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

function Topbar({ pgbo }: { pgbo?: any }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [registerMenuOpen, setRegisterMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const registerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const sections = navigation.map((item) => item.href.replace("#", ""));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (registerMenuRef.current && !registerMenuRef.current.contains(event.target as Node)) {
        setRegisterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lang = i18n.language;

  const dynamicNavigation = navigation.map((item) => ({
    ...item,
    label: t(item.translationKey),
  }));

  const languages = [
    { id: "id", label: "Indonesia", emoji: "🇮🇩", code: "ID" },
    { id: "ms", label: "Malaysia", emoji: "🇲🇾", code: "MS" },
    { id: "zh", label: "Chinese", emoji: "🇨🇳", code: "ZH" },
    { id: "ta", label: "Tamil", emoji: "🇮🇳", code: "TA" },
  ];

  const toggleLang = (selected: "id" | "ms" | "zh" | "ta") => {
    i18n.changeLanguage(selected);
    setLangMenuOpen(false);
  };

  const currentLang = languages.find(l => lang.startsWith(l.id));
  const currentLangEmoji = currentLang?.emoji ?? "🌐";
  const currentLangLabel = currentLang?.code ?? "EN";

  const scrollToSection = (href: string) => {
    const id = href.replace("#", "");

    if (window.location.pathname !== "/") {
      navigate({ to: "/", hash: id });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm"
            : "h-20 bg-transparent"
        )}
      >
        <div className="flex items-center justify-between w-11/12 max-w-7xl mx-auto h-full">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <img src={`./logo.svg`} alt="Public Gold" className="h-14 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
              {dynamicNavigation.map((item, index) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <li key={`${index}-${item.translationKey}`}>
                    <a
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        isActive
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Selector (Desktop) */}
            <div ref={langMenuRef} className="hidden lg:relative lg:block">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-semibold border",
                  langMenuOpen
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                <Languages className={cn("w-4 h-4", langMenuOpen ? "text-amber-400" : "text-slate-400")} />
                <span className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{currentLangEmoji}</span>
                  <span>{currentLangLabel}</span>
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", langMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown */}
              {langMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Language</div>
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => toggleLang(l.id as any)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                        lang.startsWith(l.id)
                          ? "text-red-600 font-bold bg-red-50/50"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{l.emoji}</span>
                        {l.label}
                      </span>
                      {lang.startsWith(l.id) && <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA - Register Dropdown */}
            <div className="relative" ref={registerMenuRef}>
              <button
                onClick={() => setRegisterMenuOpen(!registerMenuOpen)}
                className="flex items-center justify-center gap-1.5 bg-red-600 text-white px-4 py-2 lg:px-6 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 hover:shadow-red-200 active:scale-95 cursor-pointer"
              >
                {t("nav.register")}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", registerMenuOpen && "rotate-180")} />
              </button>

              {registerMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                  <Link
                    to="/register"
                    search={{ type: "dewasa", ref: pgbo?.pageid }}
                    onClick={() => { setRegisterMenuOpen(false); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium no-underline"
                  >
                    <img src="./dewasa.webp" alt="Dewasa" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> Akun Dewasa
                  </Link>
                  <Link
                    to="/register"
                    search={{ type: "anak", ref: pgbo?.pageid }}
                    onClick={() => { setRegisterMenuOpen(false); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium no-underline"
                  >
                    <img src="./anak.webp" alt="Anak" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> Akun Anak
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-white transition-all duration-500 ease-in-out lg:hidden flex flex-col",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-4"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img src={`./logo.svg`} alt="Public Gold" className="h-8 w-auto" />
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Language</h3>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => toggleLang(l.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    lang.startsWith(l.id)
                      ? "bg-white border-red-600 text-red-600 shadow-md shadow-red-100"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
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
