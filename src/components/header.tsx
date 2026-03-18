import { cn } from "../lib/utils";
import { Button } from "./ui/moving_border";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
        <img
          className="overflow-hidden rounded-full w-full h-full object-cover shadow-2xl shadow-slate-200"
          src="./me.jpg"
          alt="me-picture"
        />
        <span className="w-20 h-20 md:w-24 md:h-24 absolute bottom-0 right-0 z-[99]">
          <img
            className="rounded-full overflow-hidden w-full h-full border-4 border-white shadow-lg"
            src="./5g.png"
            alt="team-picture"
          />
        </span>
      </div>
      <div className="max-w-[500px] space-y-5 z-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-2">
          {t('hero.greeting')} <span className="text-red-500">Hasbi</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-6">
          {t('hero.role')}
        </p>
        <p className="text-slate-500 mb-8 max-w-lg leading-relaxed mx-auto md:mx-0">
          {t('hero.mission')}
        </p>
        <Button
          className="bg-white text-black border-neutral-200 shadow-sm"
          onClick={() => scrollToSection("#advantage")}
        >
          {t('hero.more')}
        </Button>
      </div>
    </div>
  );
}

export default Header;
