import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";

const HOME_URL = import.meta.env.DEV ? "/" : "https://mypublicgold.id";

export default function NotFound() {
  const { t } = useTranslation();

  const buttonClass = "inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all hover:scale-110 active:scale-95 no-underline";
  const buttonTitle = t("notFound.backHome", "Kembali ke Beranda");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-700">
      <div className="text-center space-y-10 max-w-md w-full">
        {/* Simple Number */}
        <h1 className="text-[12rem] md:text-[16rem] font-black tracking-tighter text-slate-100 select-none leading-none">
          404
        </h1>
        
        {/* Simple Typography */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 tracking-wide">
            {t("notFound.title", "Halaman Tidak Ditemukan")}
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed max-w-sm mx-auto">
            {t("notFound.desc", "Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak ada.")}
          </p>
        </div>

        {/* Single CTA */}
        <div className="pt-8">
          {import.meta.env.DEV ? (
            <Link
              to="/"
              className={buttonClass}
              title={buttonTitle}
            >
              <Home className="w-8 h-8" />
            </Link>
          ) : (
            <a
              href={HOME_URL}
              className={buttonClass}
              title={buttonTitle}
            >
              <Home className="w-8 h-8" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
