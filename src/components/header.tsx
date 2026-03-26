import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();



  return (
    <div className="relative flex flex-col md:flex-row min-h-[50rem] w-full items-center justify-center bg-white gap-8 md:gap-16 p-6 md:p-0">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#9ca3af_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#9ca3af_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent)]"></div>
      <div className="relative w-60 h-60 md:w-80 md:h-80 z-10 shrink-0">
        {/* Pulse ripple rings */}
        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-40 animate-[ripple_2s_ease-out_infinite]" />
        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-30 animate-[ripple_2s_ease-out_0.8s_infinite]" />
        <style>{`@keyframes ripple { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.15); opacity: 0; } }`}</style>
        <img
          className="relative overflow-hidden rounded-full w-full h-full object-cover shadow-2xl shadow-slate-200"
          src="./me.webp"
          alt="me-picture"
        />
        <span className="w-20 h-20 md:w-24 md:h-24 absolute bottom-0 right-0 z-[99]">
          <img
            className="rounded-full overflow-hidden w-full h-full border-4 border-white shadow-lg"
            src="./5g.webp"
            alt="team-picture"
          />
        </span>
      </div>
      <div className="max-w-[540px] space-y-5 z-10 text-center md:text-left">
        <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-full border border-red-100">
          {t('hero.eyebrow')}
        </span>
        <h1 
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.2] tracking-tight text-slate-900"
          dangerouslySetInnerHTML={{ __html: t('hero.headline') }}
        />
        <p 
          className="text-base sm:text-lg text-slate-600 max-w-[520px] leading-relaxed mx-auto md:mx-0"
          dangerouslySetInnerHTML={{ __html: t('hero.mission') }}
        />
        <a
          href="https://wa.me/6283114340955"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-red-300 active:scale-95 no-underline"
        >
          {t('hero.cta')}
        </a>
      </div>
    </div>
  );
}

export default Header;
