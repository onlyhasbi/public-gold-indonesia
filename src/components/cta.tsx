import { ArrowRight, MessageCircle } from "lucide-react";
import BaseLayout from "../layout/base";
import { useTranslation } from "react-i18next";

export default function CallToAction() {
    const { t } = useTranslation();

    // Fallback for badges array in case it's not array or mapped correctly
    const badgesResult = t('cta.badges', { returnObjects: true });
    const badges = Array.isArray(badgesResult) ? badgesResult : [];

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
                            <div className="relative">
                                {/* Decorative ring */}
                                <div className="absolute -inset-3 bg-white/20 rounded-full animate-pulse" />
                                <div className="absolute -inset-6 border-2 border-white/30 rounded-full" />

                                {/* Photo */}
                                <img
                                    src="./me.webp"
                                    alt="Hasbi - Dealer Public Gold"
                                    className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-2xl"
                                />

                                {/* Badge */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-red-600 text-xs font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                                    {t('cta.dealerBadge')}
                                </div>
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
                                    className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-red-50 transition-all duration-300 hover:scale-105 shadow-xl"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t('cta.whatsapp')}
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-white/80 text-sm">
                                {badges.map((badge, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center text-slate-500 text-sm">
                    <p>© 2024 Public Gold Indonesia. All rights reserved.</p>
                    <p className="mt-2">
                        {t('cta.footer')} -{" "}
                        <span className="font-medium text-slate-700">A. Muh. Hasbi Haerurrijal</span>
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
}
