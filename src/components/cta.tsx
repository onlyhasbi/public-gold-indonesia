import { ArrowRight, MessageCircle } from "lucide-react";
import BaseLayout from "../layout/base";
import { useTranslation } from "react-i18next";

export default function CallToAction() {
    const { t } = useTranslation();



    return (
        <BaseLayout className="flex-col py-20">
            <div className="w-full">
                {/* Main CTA Card */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-rose-600 to-red-700 rounded-3xl p-8 md:p-12">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
                    <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full" />

                    {/* Content with Photo */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                        {/* Photo Section */}
                        <div className="lg:w-1/3 flex justify-center">
                            <div className="relative w-40 h-40 md:w-48 md:h-48">
                                {/* Pulse ripple rings */}
                                <span className="absolute inset-0 rounded-full border-[3px] border-white/60 opacity-40 animate-[ripple_2s_ease-out_infinite]" />
                                <span className="absolute inset-0 rounded-full border-[3px] border-white/40 opacity-30 animate-[ripple_2s_ease-out_0.8s_infinite]" />
                                <style>{`@keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.25); opacity: 0; } }`}</style>
                                
                                {/* Photo */}
                                <img
                                    src="./me.webp"
                                    alt="Hasbi - Dealer Public Gold"
                                    className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                                />

                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="lg:w-2/3 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                {t('cta.title')}
                            </h2>
                            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8">
                                {t('cta.desc')}
                            </p>

                            {/* CTA Button */}
                            <div className="flex justify-center lg:justify-start">
                                <a
                                    href="https://mypublicgold.com/app/link/hasbi/whatsapp/id"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 bg-white text-red-600 hover:bg-slate-50"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t('cta.whatsapp')}
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} 5G Associates Indonesia. All rights reserved.</p>
                </div>
            </div>
        </BaseLayout>
    );
}
