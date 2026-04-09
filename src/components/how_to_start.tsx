import { UserPlus, ShieldCheck, PiggyBank, ArrowRight } from "lucide-react";
import BaseLayout from "../layout/base";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

function HowToStart() {
    const { t } = useTranslation();

    const stepsResult = t("howToStart.steps", { returnObjects: true });
    const steps = Array.isArray(stepsResult) ? stepsResult : [];
    const icons = [
        <UserPlus className="w-8 h-8" />,
        <ShieldCheck className="w-8 h-8" />,
        <PiggyBank className="w-8 h-8" />,
    ];

    return (
        <BaseLayout className="flex-col py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60" />

            {/* Header */}
            <div className="text-center mb-16 relative z-10">
                <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
                    {t("howToStart.badge")}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6">
                    {t("howToStart.title")}
                </h2>
                <p className="max-w-2xl mx-auto text-slate-500 text-lg">
                    {t("howToStart.subtitle")}
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-3 gap-8 w-full relative z-10">
                {steps.map((item, index) => (
                    <Card
                        key={index}
                        className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        <CardContent className="p-0">
                            {/* Step Number */}
                            <div className="absolute top-6 right-6 text-6xl font-black text-slate-50 group-hover:text-red-50 transition-colors pointer-events-none">
                                0{index + 1}
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 relative z-10">
                                {icons[index]}
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-red-700 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed mb-6">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Connecting Arrow (Desktop only, except last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-20 text-slate-300">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* CTA */}
            <div className="mt-12 text-center relative z-10">
                <a
                    href="https://publicgold.co.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-4 rounded-full hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-xl shadow-red-200"
                >
                    {t("howToStart.cta")}
                    <ArrowRight className="w-5 h-5" />
                </a>
                <p className="mt-4 text-sm text-slate-400">
                    {t("howToStart.note")}
                </p>
            </div>
        </BaseLayout>
    );
}

export default HowToStart;
