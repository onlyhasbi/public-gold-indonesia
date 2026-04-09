import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../lib/analytics";
import { buttonVariants } from "@/components/ui/button";

interface PgboData {
  foto_profil_url?: string | null;
  nama_lengkap?: string | null;
  nama_panggilan?: string | null;
  no_telpon?: string | null;
  link_group_whatsapp?: string | null;
  pgcode?: string | null;
  pageid?: string | null;
  [key: string]: any;
}

function Header({ pgbo }: { pgbo?: PgboData }) {
  const { t } = useTranslation();

  const handleWhatsAppClick = () => {
    trackEvent(pgbo?.pageid, 'whatsapp_click');
  };

  const hasPhoto = !!pgbo?.foto_profil_url;
  const hasPhone = !!pgbo?.no_telpon;
  const displayName = pgbo?.nama_panggilan || pgbo?.nama_lengkap || "Authorized Dealer";
  const whatsappLink = hasPhone
    ? `https://wa.me/${pgbo!.no_telpon!.replace(/\D/g, "")}`
    : null;

  return (
    <div className="relative flex flex-col md:flex-row min-h-[50rem] w-full items-center justify-center bg-white gap-8 md:gap-16 p-6 md:p-0 overflow-hidden">
      {/* Background patterns */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)'
        }} 
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent)]" />

      {/* Hero Image Container */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 z-10 shrink-0">
        {/* Pulse ripple rings */}
        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-40 animate-[ripple_2s_ease-out_infinite]" />
        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-30 animate-[ripple_2s_ease-out_0.8s_infinite]" />
        
        <style>{`
          @keyframes ripple { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.15); opacity: 0; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
        
        {/* Profile Image with Card-like shadow */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 bg-white">
          {hasPhoto ? (
            <img
              className="w-full h-full object-cover"
              src={pgbo!.foto_profil_url!}
              alt={`${displayName} - Authorized Public Gold Dealer`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-lg font-semibold tracking-wide uppercase">Photo</span>
            </div>
          )}
        </div>

        {/* Floating Badge (5G Team) */}
        <span className="w-20 h-20 md:w-24 md:h-24 absolute bottom-0 right-0 z-20 animate-[float_4s_ease-in-out_infinite]">
          <img
            className="rounded-full overflow-hidden w-full h-full border-4 border-white shadow-xl"
            src="./5g.webp"
            alt="Public Gold 5G Associates Team - Success Together"
          />
        </span>
      </div>

      {/* Hero Content Section */}
      <div className="max-w-[540px] space-y-6 z-10 text-center md:text-left px-4 md:px-0">
        <div className="space-y-4">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.2] tracking-tight text-slate-800"
            dangerouslySetInnerHTML={{ __html: t('hero.headline', { name: displayName, interpolation: { escapeValue: false } }) }}
          />
          <p 
            className="text-base sm:text-lg text-slate-500 max-w-[520px] leading-relaxed mx-auto md:mx-0 font-medium"
            dangerouslySetInnerHTML={{ __html: t('hero.mission') }}
          />
        </div>

        {whatsappLink && (
          <div className="pt-2 sm:pt-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={cn(
                buttonVariants({ variant: "default", size: "lg", rounded: "full" }),
                "px-8 py-7 font-bold transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(220,38,38,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(220,38,38,0.5)] hover:-translate-y-1 active:scale-95 bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white no-underline ring-1 ring-white/10"
              )}
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_10px_4px_rgba(74,222,128,0.8),0_0_20px_8px_rgba(74,222,128,0.4)]"></span>
              </span>
              {t('hero.cta')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
